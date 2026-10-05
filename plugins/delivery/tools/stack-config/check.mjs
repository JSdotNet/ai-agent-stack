#!/usr/bin/env node
// Validates the delivery-owned keys of .devbook/config.json against
// resources/config.schema.json, and merges the user's overlays over it — up to two, applied
// in this order, each optional and absent by default:
//
//   <config dir>/config.local.json               this user, every repository
//   <config dir>/repos/<id>/config.local.json    this user, the repository `id` names
//
// where <config dir> is $XDG_CONFIG_HOME/devbook when that variable is set, else
// %APPDATA%\devbook on Windows and ~/.config/devbook elsewhere. Both live outside every
// clone, so a fresh worktree runs with the same settings as the last one and nothing personal
// ever sits in the repository, gitignored or not.
//
// An unknown key is an error, not a warning: a typo must never become a silently absent
// setting. That holds at the top level too: `components` is the one committed key the engine
// does not own, each component validating its own entry there, and `ext` is its machine-scope
// counterpart — `ext.<plugin>.<key>`, accepted in an overlay only, carried through the merge
// untouched and read by the plugin that owns the namespace, never by the engine. A top-level
// key that is none of these is a misspelling of one of them and is reported by name.
//
// `phases` is checked against the phase lists the schema declares under its `x-flows`: an
// unknown flow, a phase its flow lacks, a qualifier the phase does not take, and an entry for
// a phase that takes no configuration are refused by name in every layer, and the committed
// file must list every phase of each map it carries. A key 1.14.0 removed is refused with a
// pointer to delivery:update, which rewrites it; none is an alias.
//
//   node check.mjs [path-to-config.json]            validate; status lines on stdout
//   node check.mjs [path-to-config.json] --print    validate, then print the merged config
//
// `--print` is how a flow reads the effective configuration: one JSON document on stdout —
// `{ target, layers, config }`, the layers with their paths and presence, `config` the
// committed file with every present overlay merged over it (`null` when there is no
// committed file) — with the status lines moved to stderr. Nothing is printed when a layer
// is invalid: a consumer never sees a merge the checker refused.
//
// Exit 0 when the files are valid or absent, 1 when they are not.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, '..', '..', 'resources', 'config.schema.json');

// What an overlay may not say. The committed file describes what this repository
// produces; an overlay describes how one machine runs it, and these are the first kind
// wearing the second's clothes. Personal Validation is already `const` in the schema
// and is listed anyway, so the refusal names the invariant rather than a type error.
const LOCKED = [
    'policy.gate.personalValidation',
    'policy.pr.required',
    'policy.qa.ceiling',
    'policy.openspec.scenarios',
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

/**
 * `ext` is opaque to the engine: one object per owning plugin, each read by that plugin
 * alone. The only shape checked is the one that makes it addressable — an object of
 * objects — so a namespace nobody installed stays inert and a scalar at the top is caught.
 */
function checkExt(ext, errors) {
    if (!isPlainObject(ext)) {
        errors.push(`ext: expected an object keyed by plugin name, got ${typeOf(ext)}`);
        return;
    }
    for (const [plugin, keys] of Object.entries(ext)) {
        if (!isPlainObject(keys)) {
            errors.push(`ext.${plugin}: expected an object of that plugin's keys, got ${typeOf(keys)}`);
        }
    }
}

const FLOW_NAME = /^flow-[a-z0-9]+(-[a-z0-9]+)*$/;
const PHASE_KEY = /^phase-[a-z0-9]+(-[a-z0-9]+)*(:[a-z0-9]+(-[a-z0-9]+)*)?$/;
const AREA_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function retiredMessage(path, reason) {
    return `${path}: removed in 1.14.0 — ${reason}. Run delivery:update, which rewrites it.`;
}

/**
 * The qualifiers `phase` takes in a declared flow, or null when it takes none. An area
 * qualifier is a key of `areas` when the layer declares some, else the default pair.
 */
function qualifiersFor(declared, phase, areas, spec) {
    const qualifiers = declared.qualifiers?.[phase];
    if (qualifiers === undefined) return null;
    if (qualifiers !== 'areas') return qualifiers;
    return isPlainObject(areas) && Object.keys(areas).length ? Object.keys(areas) : spec['x-defaultAreas'];
}

/** The schema one phase's entry validates against: the shared fields plus its own options. */
function entrySchema(phase, schema) {
    const base = schema.$defs.phaseEntry;
    const options = schema.properties.phases['x-options']?.[phase];
    return options ? { ...base, properties: { ...base.properties, ...options } } : base;
}

/**
 * Check every flow map under `phases`. `complete` is the committed file's rule: a map lists
 * every phase its flow has, a qualified phase counting when its bare entry or one entry per
 * qualifier is there. `knowAreas` is false for an overlay read alone, whose area qualifier
 * may name an area only the committed file declares; the merged check settles those.
 */
function checkPhases(phases, schema, { areas, complete, knowAreas }, errors) {
    const spec = schema.properties.phases;
    const flows = spec['x-flows'];
    const unconfigured = spec['x-unconfigured'];
    const retired = schema['x-retired']?.flows ?? {};

    for (const [flow, map] of Object.entries(phases)) {
        const path = `phases.${flow}`;
        if (flow in retired) {
            errors.push(retiredMessage(path, `${retired[flow]}, and its entries belong in flow-code's map`));
            continue;
        }
        if (!FLOW_NAME.test(flow)) {
            errors.push(
                `phases: unknown flow "${flow}" — a map is keyed by a flow's skill name: ` +
                    `${Object.keys(flows).join(', ')}, or a repo-native flow-*`,
            );
            continue;
        }
        if (!isPlainObject(map)) {
            errors.push(`${path}: expected an object keyed by phase skill name, got ${typeOf(map)}`);
            continue;
        }
        const declared = flows[flow];

        for (const [key, entry] of Object.entries(map)) {
            const [phase, qualifier] = key.split(':');
            if (phase in unconfigured) {
                errors.push(`${path}.${key}: ${phase} ${unconfigured[phase]}`);
                continue;
            }
            if (!PHASE_KEY.test(key)) {
                errors.push(`${path}: "${key}" is not a phase key — phase-<id>, optionally followed by :<qualifier>`);
                continue;
            }
            if (declared) {
                if (!declared.phases.includes(phase)) {
                    errors.push(`${path}: unknown phase "${phase}" — ${flow} has ${declared.phases.join(', ')}`);
                    continue;
                }
                if (qualifier !== undefined) {
                    const allowed = qualifiersFor(declared, phase, areas, spec);
                    const byArea = declared.qualifiers?.[phase] === 'areas';
                    if (!allowed) {
                        errors.push(`${path}: "${key}" — ${phase} takes no qualifier in ${flow}`);
                        continue;
                    }
                    if (!allowed.includes(qualifier) && (knowAreas || !byArea)) {
                        errors.push(
                            `${path}: "${key}" — ${phase} in ${flow} is qualified by ` +
                                `${byArea ? 'an area' : 'a folder'}: ${allowed.join(', ')}`,
                        );
                        continue;
                    }
                }
            }
            validate(entry, entrySchema(phase, schema), schema, `${path}.${key}`, errors);
        }

        if (!declared || !complete) continue;
        for (const phase of declared.phases) {
            if (phase in map) continue;
            const qualifiers = qualifiersFor(declared, phase, areas, spec);
            if (qualifiers?.length && qualifiers.every((q) => `${phase}:${q}` in map)) continue;
            errors.push(
                `${path}: missing "${phase}" — the committed map lists every phase ${flow} has, ` +
                    'and {} is a complete entry',
            );
        }
    }
}

/**
 * Validate one layer. `overlay: true` is what an overlay gets and the committed file does
 * not: `ext` is a machine's own state and has no place in a file a reviewer reads, and an
 * overlay's maps are partial. `merged: true` marks the result of a merge, which carries
 * every layer's `areas`, so its area qualifiers are checked as well.
 */
export function checkStackConfig(config, schema, { overlay = false, merged = false } = {}) {
    const errors = [];
    const owned = ownedKeys(schema);
    const retired = schema['x-retired'] ?? {};

    for (const [key, reason] of Object.entries(retired.keys ?? {})) {
        if (key in config) errors.push(retiredMessage(key, reason));
    }

    for (const key of owned) {
        if (!(key in config)) continue;
        let value = config[key];
        if (key === 'bindings' && isPlainObject(value)) {
            value = { ...value };
            for (const [binding, reason] of Object.entries(retired.bindings ?? {})) {
                if (!(binding in value)) continue;
                errors.push(retiredMessage(`bindings["${binding}"]`, reason));
                delete value[binding];
            }
        }
        const before = errors.length;
        validate(value, schema.properties[key], schema, key, errors);
        if (key === 'gates' && Array.isArray(value)) {
            // A gate on a retired extension point says so, rather than listing the phase ids.
            value.forEach((gate, i) => {
                if (!(retired.gatePoints ?? []).includes(gate?.at)) return;
                const at = `gates[${i}].at:`;
                const index = errors.findIndex((error, n) => n >= before && error.startsWith(at));
                const message = retiredMessage(
                    `gates[${i}].at`,
                    `"${gate.at}" was an extension point, and a gate now attaches to the phase it belonged to`,
                );
                if (index >= 0) errors[index] = message;
                else errors.push(message);
            });
        }
    }

    if (isPlainObject(config.areas)) {
        for (const area of Object.keys(config.areas)) {
            if (AREA_NAME.test(area)) continue;
            errors.push(
                `areas: "${area}" is not an area name — lowercase letters, digits, and single ` +
                    'hyphens, since it qualifies phase-implement',
            );
        }
    }

    if (isPlainObject(config.phases)) {
        checkPhases(
            config.phases,
            schema,
            { areas: config.areas, complete: !overlay, knowAreas: !overlay || merged },
            errors,
        );
    }

    if ('ext' in config) {
        if (overlay) checkExt(config.ext, errors);
        else {
            errors.push(
                'ext: machine-scope, so it belongs in an overlay and never in the committed ' +
                    'config. Move it to config.local.json at whichever layer is true of it.',
            );
        }
    }

    // Ownership, not a closed list: a component's entry lives under `components`, its
    // machine-scope state under `ext`, so anything else at this level is a misspelling.
    // Matching on "not owned and not one of the two" keeps every component working without
    // the engine knowing any of their names.
    for (const key of Object.keys(config)) {
        if (owned.includes(key) || key === 'components' || key === 'ext' || isAnnotation(key)) continue;
        if (key in (retired.keys ?? {})) continue;
        errors.push(
            `unknown top-level key "${key}": the engine owns ${owned.join(', ')}, a ` +
                'component owns its own entry under `components` and its machine-scope state ' +
                'under `ext` in an overlay. Nothing reads this one.',
        );
    }

    return errors;
}

function isPlainObject(value) {
    return typeOf(value) === 'object';
}

/**
 * What an overlay is forbidden from saying, independent of whether it is well-typed.
 * Returns human-readable refusals; an empty array means the overlay is allowed to apply.
 */
export function checkLocalOverlay(local) {
    const errors = [];

    if ('components' in local) {
        errors.push(
            'components: a stamp is repo-scope and committed, and an overlay is neither. ' +
                "Remove it — the owning component's init and update skills write it.",
        );
    }

    if ('id' in local) {
        errors.push(
            'id: names the repository, and is what found this overlay in the first place. ' +
                'It is set in the committed config or not at all.',
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
 * Merge an overlay over the config beneath it.
 *
 * Objects merge key by key and the overlay wins, so a phase entry merges field by field: an
 * overlay naming `phases.flow-code.phase-implement.model` leaves that entry's agent standing.
 * Arrays replace wholesale rather than concatenating, because a phase's chore list is an
 * ordered whole and half of one from each file is a run nobody wrote down. `gates` is the deliberate exception: it
 * appends, so an overlay can add a checkpoint and has no way of spelling the removal of
 * one. `null` in an overlay is a value — deliberately unbound — and never a delete.
 *
 * The same rules apply at every layer, so `layers.reduce(mergeStackConfig, base)` is the
 * whole merge and no layer can undo what the one beneath it said about gates.
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

/**
 * Where this user's devbook config lives. `XDG_CONFIG_HOME` wins on every platform when it
 * is set; otherwise Windows uses `%APPDATA%` and everything else `~/.config`, which is the
 * XDG default. Host-neutral on purpose: the reader of these files is this script, and
 * Copilot runs it as readily as Claude does.
 */
export function userConfigDir({ env = process.env, platform = process.platform, home = homedir() } = {}) {
    if (env.XDG_CONFIG_HOME) return join(env.XDG_CONFIG_HOME, 'devbook');
    if (platform === 'win32' && env.APPDATA) return join(env.APPDATA, 'devbook');
    return join(home, '.config', 'devbook');
}

/**
 * Every overlay that applies to a config carrying `id`, outermost first — the order they
 * merge in, so the later a layer the more it wins. The repository layer exists only when
 * the committed file carries an `id`: a machine cannot key a folder on a name the
 * repository never chose.
 */
export function overlayPaths(id, options) {
    const user = userConfigDir(options);
    const layers = [{ scope: 'user', path: join(user, 'config.local.json') }];
    if (id) layers.push({ scope: 'repository', path: join(user, 'repos', id, 'config.local.json') });
    return layers;
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

function report(label, errors) {
    console.error(`${label}: ${errors.length} problem(s)`);
    for (const error of errors) console.error(`  ${error}`);
}

/**
 * Read the committed config and every overlay layer, validate each and the merge, and
 * return what a caller needs to act on it. `errors` is non-empty when something failed;
 * `merged` is then meaningless and callers print nothing from it.
 */
export function resolveStackConfig(target, schema, options) {
    const config = readConfig(target);
    const layers = overlayPaths(typeof config?.id === 'string' ? config.id : null, options)
        .map((layer) => ({ ...layer, overlay: readConfig(layer.path) }))
        .map((layer) => ({ ...layer, present: layer.overlay !== null }));
    const lines = [];
    const errors = [];

    if (config === null) {
        // A user overlay applies to every repository, including one that keeps no stack
        // config; it adjusts a repository's wiring and cannot stand in for it.
        lines.push(`no stack config at ${target} — every phase falls back to its default`);
        return { config, layers, merged: null, lines, errors };
    }

    const committedErrors = checkStackConfig(config, schema);
    if (committedErrors.length) errors.push({ label: target, errors: committedErrors });
    else lines.push(`${target}: ok`);

    // Each overlay is checked three times over: what it may not say, whether it is
    // well-typed on its own, and whether what it produces still validates. The third
    // catches the pair that is only wrong together, and runs after every layer so the
    // report names the layer that broke it. The merged result is an overlay's shape, not the
    // committed file's: it may carry `ext`.
    let merged = config;
    for (const { scope, path, overlay } of layers.filter((layer) => layer.present)) {
        const localErrors = [...checkLocalOverlay(overlay), ...checkStackConfig(overlay, schema, { overlay: true })];
        if (localErrors.length) {
            errors.push({ label: path, errors: localErrors });
            return { config, layers, merged: null, lines, errors };
        }
        lines.push(`${path}: ok (${scope} overlay)`);

        merged = mergeStackConfig(merged, overlay);
        const mergedErrors = checkStackConfig(merged, schema, { overlay: true, merged: true });
        if (mergedErrors.length) {
            errors.push({ label: `${target} + ${scope} overlay`, errors: mergedErrors });
            return { config, layers, merged: null, lines, errors };
        }
    }
    if (layers.some((layer) => layer.present)) lines.push('merged: ok');

    return { config, layers, merged: errors.length ? null : merged, lines, errors };
}

function main() {
    const args = process.argv.slice(2);
    const print = args.includes('--print');
    const target = resolve(args.find((arg) => !arg.startsWith('--')) ?? join('.devbook', 'config.json'));
    const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
    // With --print, stdout is the document and everything else goes to stderr.
    const status = print ? console.error : console.log;

    let resolved;
    try {
        resolved = resolveStackConfig(target, schema);
    } catch (error) {
        console.error(error.message);
        return 1;
    }

    for (const line of resolved.lines) status(line);
    for (const { label, errors } of resolved.errors) report(label, errors);
    if (resolved.errors.length) return 1;

    if (print) {
        const layers = resolved.layers.map(({ scope, path, present }) => ({ scope, path, present }));
        console.log(JSON.stringify({ target, layers, config: resolved.merged }, null, 2));
    }
    return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    process.exit(main());
}
