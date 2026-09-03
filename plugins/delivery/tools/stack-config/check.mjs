#!/usr/bin/env node
// Validates the delivery-owned keys of .github/ai-agent-stack.json against
// resources/ai-agent-stack.schema.json.
//
// An unknown key is an error, not a warning: a typo must never become a silently absent
// setting. Keys the engine does not own — `components` and anything another component
// writes — are ignored here, because each component validates its own entry.
//
//   node check.mjs [path-to-ai-agent-stack.json]
//
// Exit 0 when the file is valid or absent, 1 when it is not.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, '..', '..', 'resources', 'ai-agent-stack.schema.json');
const OWNED = ['bindings', 'extensions', 'policy', 'gates'];

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
        errors.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
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

export function checkStackConfig(config, schema) {
    const errors = [];
    for (const key of OWNED) {
        if (key in config) validate(config[key], schema.properties[key], schema, key, errors);
    }
    return errors;
}

function main() {
    const target = resolve(process.argv[2] ?? join('.github', 'ai-agent-stack.json'));
    let raw;
    try {
        raw = readFileSync(target, 'utf8');
    } catch {
        console.log(`no stack config at ${target} — every point falls back to its default`);
        return 0;
    }

    let config;
    try {
        config = JSON.parse(raw);
    } catch (error) {
        console.error(`${target}: not valid JSON — ${error.message}`);
        return 1;
    }

    const errors = checkStackConfig(config, JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')));
    if (errors.length === 0) {
        console.log(`${target}: ok`);
        return 0;
    }
    console.error(`${target}: ${errors.length} problem(s)`);
    for (const error of errors) console.error(`  ${error}`);
    return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    process.exit(main());
}
