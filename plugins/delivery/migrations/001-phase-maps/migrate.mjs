#!/usr/bin/env node
// 001-phase-maps — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//   node migrate.mjs --plugin architecture=../ai-plugins/plugins/architecture
//
// Rewrites `extensions`, `bindings["delivery.roles"]`, `bindings["delivery.mcp"]`, a gate on
// an extension point, and a `phases` map under a retired flow into the 1.14.0 phase maps — in
// the committed config, where both maps come out complete, and in both overlay layers, where
// they stay partial. It also renames the policy keys and the gate value 1.14.0 renamed, and
// drops `validate.retryBudget`, in a file already on the phase maps as well. Idempotent by
// construction: once none of those shapes is left in a file the migration has nothing to see
// there.
//
// An agent id is resolved against the plugin that ships it — a `--plugin name=path` root
// first, then this repository's own `plugins/<name>` when it is a marketplace, then the host's
// installed plugins — so a bare plugin becomes its single agent and a provider becomes an
// agent or a skill by what the plugin ships. What cannot be resolved is written as found and
// reported; nothing is guessed.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NAME = "001-phase-maps";
const STAMP = ".devbook/config.json";

// The 1.14.0 phase lists, fixed here rather than read from the schema: a migration moves a
// repository to one release's shape, and a later schema must not change what it wrote.
export const FLOWS = {
    "flow-code": [
        "phase-update-base", "phase-scope", "phase-plan", "phase-implement", "phase-review",
        "phase-build-test", "phase-verify", "phase-spec-check", "phase-create-pr",
        "phase-report-back", "phase-summary",
    ],
    "flow-spec": [
        "phase-update-base", "phase-scope", "phase-drafting:arc42", "phase-drafting:domain",
        "phase-drafting:tech", "phase-drafting:design", "phase-drafting:ai", "phase-check-review",
        "phase-create-pr", "phase-report-back", "phase-summary",
    ],
};
const RETIRED_FLOWS = ["flow-update-packages", "flow-project"];

// Every 1.13.0 extension point, by the phase it belonged to. A gate and an MCP list follow it.
export const POINT_PHASE = {
    "session.start": "phase-update-base",
    "flow.start": "phase-scope",
    spec: "phase-scope",
    implement: "phase-implement",
    validate: "phase-build-test",
    "data.prepare": "phase-verify",
    "app.start": "phase-verify",
    "qa.run": "phase-verify",
    verify: "phase-spec-check",
    deliver: "phase-create-pr",
    "flow.end": "phase-summary",
};

// What each extension point becomes. `field` is the phase entry's key; `either` is a provider
// that lands on `agent` or `skill` by what it resolves to.
const POINTS = {
    "session.start": { field: "before" },
    "flow.start": { field: "after" },
    "flow.end": { field: "after" },
    "data.prepare": { field: "before" },
    spec: { field: "skill" },
    validate: { field: "skill" },
    verify: { field: "skill" },
    deliver: { field: "skill" },
    "app.start": { field: "app" },
    implement: { field: "either" },
    "qa.run": { field: "either" },
};

// What each role becomes: [flow, phase] pairs, a null flow meaning every map with the phase.
const ROLES = {
    architecture: [[null, "phase-scope"], ["flow-code", "phase-plan"], ["flow-spec", "phase-drafting:arc42"], ["flow-spec", "phase-drafting:tech"]],
    qa: [["flow-code", "phase-verify"]],
    domain: [["flow-spec", "phase-drafting:domain"]],
    ux: [["flow-spec", "phase-drafting:design"]],
    docs: [["flow-spec", "phase-drafting:ai"]],
};
const DROPPED_ROLES = ["product", "security"];

// devbook's 004 retires `repo:start`, but only where it runs first and only in the committed
// file, and an earlier 004 rewrote it to `delivery:phase-validation`, retired since. 001 carries
// neither: options move to the run recipe's id.
const RETIRED_START = ["repo:start", "delivery:phase-validation"];
const RUN = "repo:run";

// A gate on one of these is unambiguously 1.13.0. `implement` and `verify` are phase ids as
// well, so a gate on either is read as the old point only in a file migrated for another reason.
const RETIRED_GATE_POINTS = Object.keys(POINT_PHASE).filter((p) => p !== "implement" && p !== "verify");

// Policy keys 1.14.0 renamed after the phase they switch, and the one it dropped.
export const RENAMED_POLICY = {
    "phases.verification": "phases.specCheck",
    "phases.workItemUpdate": "phases.reportBack",
};
const DROPPED_POLICY = ["validate.retryBudget"];
const RENAMED_UNATTENDED = { "skip-point": "skip-phase" };

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const json = (v) => JSON.stringify(v);

/** Whether a config file carries a policy key or a gate value this migration renames. */
function needsRenames(config) {
    if (isObject(config.policy) && [...Object.keys(RENAMED_POLICY), ...DROPPED_POLICY].some((k) => k in config.policy)) return true;
    return Array.isArray(config.gates) && config.gates.some((g) => isObject(g) && g.unattended in RENAMED_UNATTENDED);
}

/** Whether a config file carries anything this migration rewrites. */
export function needsMigration(config) {
    if (!isObject(config)) return false;
    return needsPhaseMaps(config) || needsRenames(config);
}

function needsPhaseMaps(config) {
    if ("extensions" in config) return true;
    if (isObject(config.bindings) && ("delivery.roles" in config.bindings || "delivery.mcp" in config.bindings)) return true;
    if (Array.isArray(config.gates) && config.gates.some((g) => isObject(g) && RETIRED_GATE_POINTS.includes(g.at))) return true;
    if (isObject(config.phases) && RETIRED_FLOWS.some((f) => f in config.phases)) return true;
    return false;
}

/**
 * Where a plugin's files are, or null. `roots` maps a plugin name to a folder given on the
 * command line; the repository's own `plugins/<name>` and the host's installed plugins follow.
 */
export function pluginLocator({ root, roots = {}, hostDir } = {}) {
    let installed = null;
    const host = hostDir ?? (process.env.CLAUDE_CONFIG_DIR ? path.resolve(process.env.CLAUDE_CONFIG_DIR) : path.join(homedir(), ".claude"));
    return (name) => {
        if (roots[name]) return roots[name];
        const local = root && path.join(root, "plugins", name);
        if (local && existsSync(path.join(local, ".claude-plugin", "plugin.json"))) return local;
        if (installed === null) {
            try {
                installed = JSON.parse(readFileSync(path.join(host, "plugins", "installed_plugins.json"), "utf8")).plugins ?? {};
            } catch {
                installed = {};
            }
        }
        for (const [key, entries] of Object.entries(installed)) {
            if (key.split("@")[0] !== name) continue;
            const list = (Array.isArray(entries) ? entries : [entries]).filter((e) => e?.installPath && existsSync(e.installPath));
            const pick = list.find((e) => e.scope === "user") ?? list[0];
            if (pick) return pick.installPath;
        }
        return null;
    };
}

function agentFiles(dir) {
    try {
        return readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/(\.agent)?\.md$/, ""));
    } catch {
        return [];
    }
}

/**
 * What an id names: `{ kind: 'agent' | 'skill' | null, id }`. A bare plugin resolves to its
 * single agent; `kind: null` is an id nothing here could settle, written as found.
 */
export function idResolver({ root, locate }) {
    const repoSkill = (name) => [
        `.claude/skills/${name}/SKILL.md`, `.agents/skills/${name}.md`, `.agents/skills/${name}/SKILL.md`,
        `.github/skills/${name}/SKILL.md`,
    ].some((p) => root && existsSync(path.join(root, p)));
    const repoAgent = (name) => [
        `.claude/agents/${name}.md`, `.github/agents/${name}.agent.md`, `.agents/agents/${name}.agent.md`,
    ].some((p) => root && existsSync(path.join(root, p)));

    return (id) => {
        if (typeof id !== "string") return { kind: null, id };
        const [plugin, name] = id.split(":");
        if (plugin === "repo") {
            if (repoAgent(name)) return { kind: "agent", id };
            if (repoSkill(name)) return { kind: "skill", id };
            return { kind: null, id, why: `${id} is no skill or agent this repository ships` };
        }
        const dir = locate(plugin);
        if (!dir) return { kind: null, id, why: `${plugin} is not installed here` };
        if (name === undefined) {
            const agents = agentFiles(path.join(dir, "agents"));
            if (agents.length === 1) return { kind: "agent", id: `${plugin}:${agents[0]}` };
            return {
                kind: null, id,
                why: agents.length ? `${plugin} ships ${agents.length} agents (${agents.join(", ")}) — name one` : `${plugin} ships no agent`,
            };
        }
        if (agentFiles(path.join(dir, "agents")).includes(name)) return { kind: "agent", id };
        if (existsSync(path.join(dir, "skills", name, "SKILL.md"))) return { kind: "skill", id };
        return { kind: null, id, why: `${plugin} ships no agent or skill named ${name}` };
    };
}

/** Each [flow, phase] a target names: every flow map holding the phase when `flow` is null. */
function targets(flow, phase) {
    return Object.entries(FLOWS)
        .filter(([f, phases]) => (flow === null || f === flow) && phases.includes(phase))
        .map(([f]) => [f, phase]);
}

/**
 * Rewrite one parsed config. `overlay` keeps the maps partial; the committed file gets both
 * maps complete, `{}` for every phase nothing named. Returns `{ config, notes }`, `notes`
 * being what a person should read: everything dropped, kept unresolved, or decided.
 */
export function migrateConfig(input, { overlay = false, resolve = () => ({ kind: null }) } = {}) {
    if (!needsMigration(input)) return { config: input, notes: [], changed: false };
    const notes = [];
    const mapped = needsPhaseMaps(input) ? toPhaseMaps(input, { overlay, resolve }, notes) : input;
    const config = renameKeys(mapped, notes);
    return { config, notes, changed: json(config) !== json(input) };
}

/** The policy keys and gate value renamed, in the file's own key order; the dropped key noted. */
function renameKeys(input, notes) {
    const config = { ...input };
    if (isObject(input.policy)) {
        const policy = {};
        for (const [key, value] of Object.entries(input.policy)) {
            if (DROPPED_POLICY.includes(key)) {
                notes.push(`policy["${key}"]: nothing reads it — review.retryBudget and ready.retryBudget bound the loops; dropped`);
                continue;
            }
            const name = RENAMED_POLICY[key] ?? key;
            if (name !== key && name in input.policy) {
                notes.push(`policy["${key}"]: the file already sets ${name} — kept ${json(input.policy[name])}, dropped ${json(value)}`);
                continue;
            }
            policy[name] = value;
        }
        config.policy = policy;
    }
    if (Array.isArray(input.gates)) {
        config.gates = input.gates.map((gate) =>
            isObject(gate) && gate.unattended in RENAMED_UNATTENDED ? { ...gate, unattended: RENAMED_UNATTENDED[gate.unattended] } : gate,
        );
    }
    return config;
}

function toPhaseMaps(input, { overlay, resolve }, notes) {
    const phases = {};
    const set = (flow, phase, field, value, from) => {
        phases[flow] ??= {};
        const entry = (phases[flow][phase] ??= {});
        if (field in entry && json(entry[field]) !== json(value)) {
            notes.push(`${flow} › ${phase}.${field}: kept ${json(entry[field])}, dropped ${json(value)} from ${from}`);
            return;
        }
        entry[field] = value;
    };

    // Extension points.
    for (const [point, value] of Object.entries(isObject(input.extensions) ? input.extensions : {})) {
        const rule = POINTS[point];
        const phase = POINT_PHASE[point];
        const from = `extensions["${point}"]`;
        if (!rule) {
            notes.push(`${from}: not a 1.13.0 extension point — dropped`);
            continue;
        }
        if (rule.field === "before" || rule.field === "after") {
            for (const [flow] of targets(point === "data.prepare" ? "flow-code" : null, phase)) {
                set(flow, phase, rule.field, value, from);
            }
            continue;
        }
        if (rule.field === "app") {
            const retired = RETIRED_START.find((id) => value === id || (isObject(value) && value.provider === id));
            if (retired) {
                const { provider: _p, ...options } = isObject(value) ? value : {};
                if (!Object.keys(options).length) {
                    notes.push(`${from}: ${retired} is retired — nothing is written, and phase-verify starts the app through the run recipe`);
                    continue;
                }
                notes.push(`${from}: ${retired} is retired — its options move to ${RUN}`);
                set("flow-code", phase, "app", { provider: RUN, ...options }, from);
                continue;
            }
            set("flow-code", phase, "app", value, from);
            continue;
        }
        const provider = isObject(value) ? value.provider : value;
        const options = isObject(value) ? Object.keys(value).filter((k) => k !== "provider") : [];
        if (options.length) notes.push(`${from}: options ${options.join(", ")} have no place in a phase entry — dropped`);
        if (value === null) {
            if (point === "implement") {
                for (const [flow] of targets("flow-code", phase)) set(flow, phase, "agent", null, from);
            } else if (point === "qa.run") {
                notes.push(`${from}: null — no QA provider; phase-verify runs its own procedure, so nothing is written`);
            } else {
                notes.push(`${from}: null — the phase runs its own procedure, so nothing is written`);
            }
            continue;
        }
        const found = resolve(provider);
        if (rule.field === "skill") {
            if (found.kind === "agent" || !String(provider).includes(":")) {
                notes.push(`${from}: ${json(provider)} is ${found.kind === "agent" ? "an agent" : "a bare plugin"}, and ${phase}.skill takes a skill — dropped; bind the skill by hand`);
                continue;
            }
            if (found.kind === null && found.why) notes.push(`${from}: ${found.why} — written as found`);
            for (const [flow] of targets(null, phase).filter(([f]) => point === "deliver" || f === "flow-code")) {
                set(flow, phase, "skill", provider, from);
            }
            continue;
        }
        // implement, qa.run: an agent or a skill, by what the provider is.
        const field = found.kind === "skill" ? "skill" : "agent";
        if (found.kind === null) notes.push(`${from}: ${found.why ?? `${json(provider)} could not be resolved`} — written as ${phase}.agent; check it`);
        for (const [flow] of targets("flow-code", phase)) set(flow, phase, field, found.id ?? provider, from);
    }

    const bindings = isObject(input.bindings) ? input.bindings : {};

    // Roles, after extensions: `qa` only lands where `qa.run` set no agent; a skill sits beside it.
    for (const [role, value] of Object.entries(isObject(bindings["delivery.roles"]) ? bindings["delivery.roles"] : {})) {
        const from = `bindings["delivery.roles"].${role}`;
        if (DROPPED_ROLES.includes(role)) {
            if (value !== null) notes.push(`${from}: ${json(value)} — no phase names the ${role} role any more; dropped`);
            continue;
        }
        if (!ROLES[role]) {
            notes.push(`${from}: not a 1.13.0 role — dropped`);
            continue;
        }
        if (value === null) {
            notes.push(`${from}: null — the phases it ran take the session's runner, so nothing is written`);
            continue;
        }
        const found = resolve(value);
        let agent = value;
        if (found.kind === "agent") agent = found.id;
        else if (found.kind === "skill") {
            notes.push(`${from}: ${json(value)} is a skill, and a role becomes an agent — dropped; bind the agent by hand`);
            continue;
        } else notes.push(`${from}: ${found.why ?? `${json(value)} could not be resolved`} — written as found; check it`);
        if (agent !== value) notes.push(`${from}: ${json(value)} resolved to its single agent, ${agent}`);
        for (const [flow, phase] of ROLES[role].flatMap(([f, p]) => targets(f, p))) {
            if (role === "qa" && phases[flow]?.[phase] && "agent" in phases[flow][phase]) {
                notes.push(`${from}: ${flow} › ${phase} already has its provider from extensions["qa.run"] — the role is not written`);
                continue;
            }
            set(flow, phase, "agent", agent, from);
        }
    }
    if ("domain" in (bindings["delivery.roles"] ?? {}) && bindings["delivery.roles"].domain !== null) {
        notes.push('bindings["delivery.roles"].domain: its extra pass on a flow-code create is gone — boundary work escalates to flow-spec');
    }

    // MCP servers, by the phase each point belonged to. Two points on one phase join, in order.
    const mcpByPhase = {};
    for (const [point, servers] of Object.entries(isObject(bindings["delivery.mcp"]) ? bindings["delivery.mcp"] : {})) {
        const phase = POINT_PHASE[point];
        if (!phase) {
            notes.push(`bindings["delivery.mcp"]["${point}"]: not a 1.13.0 extension point — dropped`);
            continue;
        }
        const flow = ["implement", "validate", "data.prepare", "app.start", "qa.run", "verify"].includes(point) ? "flow-code" : null;
        const key = `${flow ?? "*"}|${phase}`;
        if (servers === null) {
            if (!(key in mcpByPhase)) mcpByPhase[key] = null;
            continue;
        }
        if (mcpByPhase[key] === null) notes.push(`bindings["delivery.mcp"]["${point}"]: joins a point bound to null on ${phase} — the servers win`);
        mcpByPhase[key] = [...new Set([...(mcpByPhase[key] ?? []), ...servers])];
    }
    for (const [key, servers] of Object.entries(mcpByPhase)) {
        const [flow, phase] = key.split("|");
        for (const [f] of targets(flow === "*" ? null : flow, phase)) set(f, phase, "mcp", servers, 'bindings["delivery.mcp"]');
    }

    // Maps under a retired flow, into flow-code. What flow-code already says wins, field by field.
    const existing = isObject(input.phases) ? input.phases : {};
    const kept = {};
    for (const [flow, map] of Object.entries(existing)) {
        if (!RETIRED_FLOWS.includes(flow)) kept[flow] = isObject(map) ? { ...map } : map;
    }
    // Retired maps after every live one, so flow-code is in `kept` before anything merges into it.
    for (const [flow, map] of Object.entries(existing)) {
        if (!RETIRED_FLOWS.includes(flow)) continue;
        for (const [key, entry] of Object.entries(isObject(map) ? map : {})) {
            const phase = key.split(":")[0];
            if (!FLOWS["flow-code"].includes(key) && !FLOWS["flow-code"].includes(phase)) {
                notes.push(`phases.${flow}.${key}: flow-code has no ${phase} — dropped`);
                continue;
            }
            const target = (kept["flow-code"] ??= { ...(existing["flow-code"] ?? {}) });
            const merged = { ...(target[key] ?? {}) };
            for (const [field, value] of Object.entries(isObject(entry) ? entry : {})) {
                if (field in merged && json(merged[field]) !== json(value)) {
                    notes.push(`phases.${flow}.${key}.${field}: flow-code already sets ${json(merged[field])} — dropped ${json(value)}`);
                    continue;
                }
                merged[field] = value;
            }
            target[key] = merged;
        }
        notes.push(`phases.${flow}: moved into flow-code — ${flow.replace("flow-", "")} is a kind of flow-code now`);
    }

    // The final maps: what the file already said, then the migrated fields beneath it.
    const out = {};
    for (const flow of new Set([...Object.keys(kept), ...Object.keys(phases), ...(overlay ? [] : Object.keys(FLOWS))])) {
        const said = isObject(kept[flow]) ? kept[flow] : {};
        const moved = phases[flow] ?? {};
        const map = {};
        // A file's bare phase-drafting stands for its five qualifiers: never add empty ones beside it.
        const bareDrafting = "phase-drafting" in said;
        const order = (FLOWS[flow] ?? []).filter((k) => !(bareDrafting && k.startsWith("phase-drafting:")));
        const rank = (key) => {
            const at = (FLOWS[flow] ?? []).findIndex((k) => k.split(":")[0] === key.split(":")[0]);
            return at === -1 ? Infinity : at;
        };
        const keys = [...new Set([...order, ...Object.keys(said), ...Object.keys(moved)])]
            .sort((a, b) => rank(a) - rank(b));
        for (const key of keys) {
            const inFile = said[key];
            const fromOld = moved[key];
            if (inFile === undefined && fromOld === undefined && overlay) continue;
            const entry = { ...(fromOld ?? {}) };
            for (const [field, value] of Object.entries(isObject(inFile) ? inFile : {})) {
                if (field in entry && json(entry[field]) !== json(value)) {
                    notes.push(`phases.${flow}.${key}.${field}: the file already says ${json(value)} — kept over ${json(entry[field])}`);
                }
                entry[field] = value;
            }
            map[key] = entry;
        }
        if (Object.keys(map).length || !overlay) out[flow] = map;
    }

    // Rebuild the file in its own key order, `phases` where `extensions` was.
    const config = {};
    const place = () => {
        if (Object.keys(out).length) config.phases = out;
    };
    let placed = false;
    for (const [key, value] of Object.entries(input)) {
        if (key === "extensions" || key === "phases") {
            if (!placed) place();
            placed = true;
            continue;
        }
        if (key === "bindings" && isObject(value)) {
            const { "delivery.roles": _r, "delivery.mcp": _m, ...rest } = value;
            if (Object.keys(rest).length) config.bindings = rest;
            if (!placed && !("extensions" in input) && !("phases" in input)) {
                place();
                placed = true;
            }
            continue;
        }
        if (key === "gates" && Array.isArray(value)) {
            config.gates = value.map((gate, i) => {
                if (!isObject(gate) || !(gate.at in POINT_PHASE) || gate.at === "implement") return gate;
                const at = POINT_PHASE[gate.at].replace(/^phase-/, "");
                notes.push(`gates[${i}].at: "${gate.at}" was an extension point — attached to ${at}, the phase it belonged to`);
                return { ...gate, at };
            });
            continue;
        }
        config[key] = value;
    }
    if (!placed) place();

    return config;
}

function userConfigDir(env = process.env) {
    if (env.XDG_CONFIG_HOME) return path.join(env.XDG_CONFIG_HOME, "devbook");
    if (process.platform === "win32" && env.APPDATA) return path.join(env.APPDATA, "devbook");
    return path.join(homedir(), ".config", "devbook");
}

/** The indent a JSON file was written with, so a rewrite keeps it. */
function indentOf(text) {
    const m = /\n([ \t]+)"/.exec(text);
    return m ? m[1] : 2;
}

function main(argv) {
    const checkOnly = argv.includes("--check");
    const rootAt = argv.indexOf("--root");
    const root = path.resolve(rootAt !== -1 ? argv[rootAt + 1] : process.cwd());
    const roots = {};
    argv.forEach((arg, i) => {
        if (arg !== "--plugin") return;
        const [name, dir] = String(argv[i + 1]).split("=");
        roots[name] = path.resolve(dir);
    });
    const resolve = idResolver({ root, locate: pluginLocator({ root, roots }) });

    const committedPath = path.join(root, STAMP);
    const committed = existsSync(committedPath) ? readFileSync(committedPath, "utf8") : null;
    const id = committed ? (() => { try { return JSON.parse(committed).id; } catch { return null; } })() : null;
    const user = userConfigDir();
    const files = [
        { label: STAMP, file: committedPath, overlay: false },
        { label: "user overlay", file: path.join(user, "config.local.json"), overlay: true },
        ...(typeof id === "string" ? [{ label: "repository overlay", file: path.join(user, "repos", id, "config.local.json"), overlay: true }] : []),
    ];

    let pending = 0;
    for (const { label, file, overlay } of files) {
        if (!existsSync(file)) continue;
        const text = readFileSync(file, "utf8");
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (error) {
            console.error(`${label} (${file}): not valid JSON — ${error.message}`);
            return 2;
        }
        const { config, notes, changed } = migrateConfig(parsed, { overlay, resolve });
        if (!changed) continue;
        pending++;
        console.log(`- rewrite ${label} (${file}) into phase maps and the 1.14.0 policy names`);
        for (const note of notes) console.log(`  · ${note}`);
        if (checkOnly) continue;
        const eol = text.includes("\r\n") ? "\r\n" : "\n";
        writeFileSync(file, JSON.stringify(config, null, indentOf(text)).replace(/\n/g, eol) + eol, "utf8");
    }

    if (!pending) {
        console.log(`${NAME}: nothing to do.`);
        return 0;
    }
    if (checkOnly) return 1;
    console.log(`${NAME}: applied.`);
    return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    process.exit(main(process.argv.slice(2)));
}
