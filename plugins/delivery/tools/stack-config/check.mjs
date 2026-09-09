#!/usr/bin/env node
// Validates the delivery-owned keys of .devbook/config.json against
// resources/config.schema.json, and merges the gitignored .devbook/config.local.json
// over it when that file is present.
//
// An unknown key is an error, not a warning: a typo must never become a silently absent
// setting. That holds at the top level too: `components` is the one key the engine does not
// own, each component validating its own entry there, so a top-level key that is neither
// engine-owned nor `components` is a misspelling of one of them and is reported by name.
//
//   node check.mjs [path-to-config.json]
//
// The local sibling is found next to the path given, never passed separately: one config
// has one overlay, and naming them independently invites checking a pair that never meet
// at run time.
//
// Exit 0 when the files are valid or absent, 1 when they are not.

import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, '..', '..', 'resources', 'config.schema.json');

// What the overlay may not say. The committed file describes what this repository
// produces; the overlay describes how one machine runs it, and these four are the first
// kind wearing the second's clothes. Personal Validation is already `const` in the schema
// and is listed anyway, so the refusal names the invariant rather than a type error.
const LOCKED = [
    'policy.gate.personalValidation',
    'policy.pr.required',
    'policy.qa.ceiling',
];

/** Resolve a local `#/...` pointer against the schema root. */
function deref(node, root) {
    let seen = 0;
    while (node && node.$ref) {
        if (++seen > 20) throw new Error(`circular $ref at ${node.$ref}`);
        node = node.$ref.split('/').slice(1).reduce((acc, part) => acc?.[part], root);
    }
    return node;
}

function typeOf(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (Number.isInteger(value)) return 'integer';
    return typeof value;
}

function matchesType(value, expected) {
    const actual = typeOf(value);
    const allowed = Array.isArray(expected) ? expected : [expected];
    return allowed.some((t) => t === actual || (t === 'number' && actual === 'integer'));
}

/** Validate `value` against `schema`, appending human-readable problems to `errors`. */
function validate(value, schema, root, path, errors) {
    schema = deref(schema, root);
    if (!schema) return true;

    if (schema.oneOf) {
        const matched = schema.oneOf.some((branch) => validate(value, branch, root, path, []));
        if (!matched) errors.push(`${path}: no allowed shape matches ${JSON.stringify(value)}`);
        return matched;
    }

    const before = errors.length;

    if (schema.const !== undefined && value !== schema.const) {
        errors.push(`${path}: must be ${JSON.stringify(schema.const)}`);
    }
    if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(', ')}`);
    }
    if (schema.type && !matchesType(value, schema.type)) {
        errors.push(`${path}: expected ${[schema.type].flat().join(' or ')}, got ${typeOf(value)}`);
        return errors.length === before;
    }
    if (schema.pattern && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) {
        // A `title` names the shape in words. Say that instead of the regex where one exists:
        // the point of the message is that the author can see what to write.
        errors.push(
            schema.title
                ? `${path}: ${JSON.stringify(value)} is not ${schema.title}`
                : `${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`,
        );
    }
    if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
        errors.push(`${path}: must be at least ${schema.minimum}`);
    }
    if (schema.minLength !== undefined && typeof value === 'string' && value.length < schema.minLength) {
        errors.push(`${path}: must not be empty`);
    }

    if (typeOf(value) === 'object') {
        for (const key of schema.required ?? []) {
            if (!(key in value)) errors.push(`${path}: missing required key "${key}"`);
        }
        for (const [key, child] of Object.entries(value)) {
            const childSchema = schema.properties?.[key];
            if (childSchema) {
                validate(child, childSchema, root, `${path}.${key}`, errors);
            } else if (schema.additionalProperties === false) {
                errors.push(`${path}: unknown key "${key}"`);
            } else if (schema.additionalProperties) {
                validate(child, schema.additionalProperties, root, `${path}.${key}`, errors);
            }
        }
    }

    if (typeOf(value) === 'array' && schema.items) {
        value.forEach((item, i) => validate(item, schema.items, root, `${path}[${i}]`, errors));
    }

    return errors.length === before;
}

/**
 * Which top-level keys the engine owns — read from the schema rather than restated here, so
 * a key added to one is never missing from the other.
 */
function ownedKeys(schema) {
    return Object.keys(schema.properties ?? {});
}

/**
 * A `$`-prefixed key is a JSON annotation — `$schema`, and the `$comment` the template ships.
 * It belongs to nobody and configures nothing, so it is neither owned nor unknown.
 */
function isAnnotation(key) {
    return key.startsWith('$');
}

export function checkStackConfig(config, schema) {
    const errors = [];
    const owned = ownedKeys(schema);

    for (const key of owned) {
        if (key in config) validate(config[key], schema.properties[key], schema, key, errors);
    }

    // Ownership, not a closed list: a component's entry lives under `components`, so anything
    // else at this level is a misspelling. Matching on "not owned and not a component" keeps
    // every component working without the engine knowing any of their names.
    for (const key of Object.keys(config)) {
        if (owned.includes(key) || key === 'components' || isAnnotation(key)) continue;
        errors.push(
            `unknown top-level key "${key}": the engine owns ${owned.join(', ')}, and a ` +
                'component owns its own entry under `components`. Nothing reads this one.',
        );
    }

    return errors;
}

function isPlainObject(value) {
    return typeOf(value) === 'object';
}

/**
 * What the overlay is forbidden from saying, independent of whether it is well-typed.
 * Returns human-readable refusals; an empty array means the overlay is allowed to apply.
 */
export function checkLocalOverlay(local) {
    const errors = [];

    if ('components' in local) {
        errors.push(
            'components: a stamp is repo-scope and committed, and an overlay is neither. ' +
                "Remove it — the owning component's install skill writes it.",
        );
    }

    for (const locked of LOCKED) {
        const [top, ...rest] = locked.split('.');
        const key = rest.join('.');
        if (isPlainObject(local[top]) && key in local[top]) {
            errors.push(
                `${locked}: locked. It describes what this repository produces, not how one ` +
                    'machine runs it, so it is set in the committed config or not at all.',
            );
        }
    }

    return errors;
}

/**
 * Merge the overlay over the committed config.
 *
 * Objects merge key by key and the overlay wins. Arrays replace wholesale rather than
 * concatenating, because an extension point's chore list is an ordered whole and half of
 * one from each file is a run nobody wrote down. `gates` is the deliberate exception: it
 * appends, so the overlay can add a checkpoint and has no way of spelling the removal of
 * one. `null` in the overlay is a value — deliberately unbound — and never a delete.
 */
export function mergeStackConfig(base, local) {
    const merged = { ...base };

    for (const [key, value] of Object.entries(local)) {
        if (key === 'gates') {
            merged.gates = [...(base.gates ?? []), ...(value ?? [])];
        } else if (isPlainObject(value) && isPlainObject(base[key])) {
            merged[key] = mergeStackConfig(base[key], value);
        } else {
            merged[key] = value;
        }
    }

    return merged;
}

/** Read and parse one config file. Returns null when absent, throws on bad JSON. */
function readConfig(path) {
    if (!existsSync(path)) return null;
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        throw new Error(`${path}: not valid JSON — ${error.message}`);
    }
}

/** `.devbook/config.json` -> `.devbook/config.local.json`. */
function localSiblingOf(path) {
    return join(dirname(path), basename(path).replace(/\.json$/, '.local.json'));
}

function report(label, errors) {
    console.error(`${label}: ${errors.length} problem(s)`);
    for (const error of errors) console.error(`  ${error}`);
}

function main() {
    const target = resolve(process.argv[2] ?? join('.devbook', 'config.json'));
    const localPath = localSiblingOf(target);
    const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));

    let config;
    let local;
    try {
        config = readConfig(target);
        local = readConfig(localPath);
    } catch (error) {
        console.error(error.message);
        return 1;
    }

    if (config === null && local === null) {
        console.log(`no stack config at ${target} — every point falls back to its default`);
        return 0;
    }
    if (config === null) {
        console.error(
            `${localPath}: an overlay with nothing under it. Write ${target} first — the ` +
                "overlay adjusts a repository's wiring and cannot stand in for it.",
        );
        return 1;
    }

    let failed = false;

    const errors = checkStackConfig(config, schema);
    if (errors.length) {
        report(target, errors);
        failed = true;
    } else {
        console.log(`${target}: ok`);
    }

    if (local === null) return failed ? 1 : 0;

    // The overlay is checked three times over: what it may not say, whether it is
    // well-typed on its own, and whether what it produces still validates. The third
    // catches the pair that is only wrong together.
    const refusals = checkLocalOverlay(local);
    const localErrors = [...refusals, ...checkStackConfig(local, schema)];
    if (localErrors.length) {
        report(localPath, localErrors);
        return 1;
    }
    console.log(`${localPath}: ok (overlay)`);

    const mergedErrors = checkStackConfig(mergeStackConfig(config, local), schema);
    if (mergedErrors.length) {
        report(`${target} + ${basename(localPath)}`, mergedErrors);
        return 1;
    }
    console.log(`merged: ok`);

    return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    process.exit(main());
}
