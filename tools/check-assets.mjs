#!/usr/bin/env node
// check-assets.mjs — the review lint CLAUDE.md describes, as a script.
//
//   node tools/check-assets.mjs            # report, exit 1 on any error
//   node tools/check-assets.mjs --budgets  # also list every asset over its body budget
//
// Checks what the removed sync generator used to lint and what a reviewer is otherwise
// expected to catch by eye across seventeen plugins:
//
//   marketplace   every entry has a folder, every folder with a Claude manifest has an
//                 entry, and name/version/description agree across the three files
//   agents        name equals the filename, a description exists, a model pin is a value
//                 Claude accepts, Skill is granted, and a role plugin's agent carries no
//                 session-spawning or delegation tool (see the decision "A Role Plugin
//                 Holds No Flow Control")
//   hooks         hooks/hooks.json never uses type: prompt on SessionStart
//   budgets       body-line counts against the budgets in CLAUDE.md — reported, never
//                 an error (see the decision "Budgets Are Disclosure Triggers, Not Gates"
//                 and debt record 1)
//
// Dependency-free ESM against node: built-ins, like everything else executable here.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS = path.join(ROOT, "plugins");
const showBudgets = process.argv.includes("--budgets");

const BUDGETS = { "SKILL.md": 40, ".instructions.md": 60, ".agent.md": 80 };
const MODEL_PIN = /^(opus|sonnet|haiku|fable|inherit|claude-[\w.-]+)$/;
// Tools that sequence, spawn, or delegate. A role plugin's agent carries none of them.
const FLOW_CONTROL_TOOLS = new Set([
    "Agent", "agent", "SendMessage", "create_session", "send_session_message",
    "respond_to_session_plan", "list_sessions_and_chats", "get_session",
]);
// Plugins whose agents are allowed to delegate: the engine's runner is one; a role is not.
const RUNNER_PLUGINS = new Set(["delivery"]);

const errors = [];
const notes = [];
const error = (msg) => errors.push(msg);

async function exists(p) {
    try { await stat(p); return true; } catch { return false; }
}
async function json(p) {
    return JSON.parse(await readFile(p, "utf8"));
}
async function walk(dir, acc = []) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) await walk(p, acc);
        else acc.push(p);
    }
    return acc;
}
function frontmatter(text) {
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
    if (!m) return { fm: "", body: text };
    return { fm: m[1], body: text.slice(m[0].length) };
}
function bodyLines(body) {
    return body.split(/\r?\n/).filter((l) => l.trim() !== "").length;
}
function rel(p) {
    return path.relative(ROOT, p).replace(/\\/g, "/");
}

// ── marketplace ─────────────────────────────────────────────────────────────

const marketplace = await json(path.join(ROOT, ".claude-plugin", "marketplace.json"));
const listed = new Map(marketplace.plugins.map((e) => [e.name, e]));
const folders = (await readdir(PLUGINS, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

for (const [name, entry] of listed) {
    const dir = path.join(PLUGINS, name);
    if (entry.source !== `./plugins/${name}`) error(`marketplace: ${name} has source ${entry.source}, expected ./plugins/${name}`);
    if (!(await exists(dir))) { error(`marketplace: ${name} is listed but plugins/${name} does not exist`); continue; }
    const claudePath = path.join(dir, ".claude-plugin", "plugin.json");
    if (!(await exists(claudePath))) { error(`${name}: listed in the marketplace but has no .claude-plugin/plugin.json`); continue; }
    const claude = await json(claudePath);
    for (const field of ["name", "version", "description"]) {
        if (claude[field] !== entry[field]) error(`${name}: ${field} differs between marketplace.json and .claude-plugin/plugin.json`);
    }
    if ("skills" in claude) error(`${name}: Claude manifest names skills; Claude scans skills/ already`);
    if ("hooks" in claude) error(`${name}: Claude manifest names hooks; that fails with "Duplicate hooks file detected"`);
    const copilotPath = path.join(dir, ".github", "plugin", "plugin.json");
    if (await exists(copilotPath)) {
        const copilot = await json(copilotPath);
        for (const field of ["name", "version", "description"]) {
            if (copilot[field] !== claude[field]) error(`${name}: ${field} differs between the Claude and Copilot manifests`);
        }
    } else {
        error(`${name}: ships only the Claude manifest; every plugin here ships both`);
    }
    // Every agent file the manifest lists must exist, and every agent file must be listed.
    const declared = new Set((claude.agents ?? []).map((a) => a.replace(/^\.\//, "").replace(/\\/g, "/")));
    const agentFiles = (await exists(path.join(dir, "agents")))
        ? (await walk(path.join(dir, "agents"))).filter((f) => f.endsWith(".agent.md")).map((f) => path.relative(dir, f).replace(/\\/g, "/"))
        : [];
    for (const f of agentFiles) if (!declared.has(f)) error(`${name}: ${f} is not listed under agents in the Claude manifest, so handoffs to it dangle`);
    for (const d of declared) if (!(await exists(path.join(dir, d)))) error(`${name}: Claude manifest lists ${d}, which does not exist`);
}
for (const folder of folders) {
    if (listed.has(folder)) continue;
    if (await exists(path.join(PLUGINS, folder, ".claude-plugin", "plugin.json"))) {
        error(`plugins/${folder} has a Claude manifest but no marketplace entry, so Claude Code will not offer it`);
    } else {
        notes.push(`plugins/${folder}: not in the marketplace and has no Claude manifest (a Copilot-only profile)`);
    }
}

// ── agents ──────────────────────────────────────────────────────────────────

for (const folder of folders) {
    const agentsDir = path.join(PLUGINS, folder, "agents");
    if (!(await exists(agentsDir))) continue;
    for (const file of (await walk(agentsDir)).filter((f) => f.endsWith(".agent.md"))) {
        const { fm, body } = frontmatter(await readFile(file, "utf8"));
        const label = rel(file);
        const expected = path.basename(file, ".agent.md");
        const name = (/^name:\s*['"]?([^'"\r\n]+)['"]?\s*$/m.exec(fm) ?? [])[1];
        if (name !== expected) error(`${label}: frontmatter name "${name}" must equal the filename "${expected}"`);
        if (!/^description:\s*\S/m.test(fm)) error(`${label}: description is required; Claude refuses to load an agent without one`);
        const model = (/^model:\s*['"]?([^'"\r\n]+)['"]?\s*$/m.exec(fm) ?? [])[1];
        if (model && !MODEL_PIN.test(model.trim())) error(`${label}: model "${model}" is not a value Claude accepts; put the preference in a ## Model section`);
        const tools = new Set([...fm.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]));
        if (!tools.has("Skill")) error(`${label}: tools does not include Skill, so the agent cannot reach plugin skills`);
        if (!RUNNER_PLUGINS.has(folder)) {
            const carried = [...tools].filter((t) => FLOW_CONTROL_TOOLS.has(t));
            if (carried.length) error(`${label}: a role plugin's agent carries flow-control tools: ${carried.join(", ")}`);
        }
        if (/^handoffs:/m.test(fm)) {
            for (const m of fm.matchAll(/^\s+agent:\s*['"]?([\w-]+)/gm)) {
                if (!body.includes(`\`${m[1]}\``) && !body.includes(`${m[1]} agent`) && !body.includes(`${m[1]}.agent.md`)) {
                    error(`${label}: handoff target "${m[1]}" is not named in the body; Claude ignores the handoffs key`);
                }
            }
        }
    }
}

// ── hooks ───────────────────────────────────────────────────────────────────

for (const folder of folders) {
    const hooksPath = path.join(PLUGINS, folder, "hooks", "hooks.json");
    if (!(await exists(hooksPath))) continue;
    const doc = await json(hooksPath);
    const events = doc.hooks ?? doc;
    for (const group of events.SessionStart ?? []) {
        for (const hook of group.hooks ?? []) {
            if (hook.type === "prompt") error(`${folder}/hooks/hooks.json: SessionStart type: prompt fails silently in Claude Code; author it as a command hook`);
        }
    }
}

// ── budgets (report only) ───────────────────────────────────────────────────

const over = [];
let budgeted = 0;
for (const file of await walk(PLUGINS)) {
    const base = path.basename(file);
    const key = base === "SKILL.md" ? "SKILL.md" : base.endsWith(".instructions.md") ? ".instructions.md" : base.endsWith(".agent.md") ? ".agent.md" : null;
    if (!key) continue;
    budgeted++;
    const { body } = frontmatter(await readFile(file, "utf8"));
    const lines = bodyLines(body);
    if (lines > BUDGETS[key]) over.push({ file: rel(file), lines, budget: BUDGETS[key] });
}
over.sort((a, b) => b.lines / b.budget - a.lines / a.budget);

// ── report ──────────────────────────────────────────────────────────────────

for (const n of notes) console.log(`note   ${n}`);
for (const e of errors) console.log(`error  ${e}`);
console.log(`\nbudgets: ${over.length} of ${budgeted} budgeted assets exceed their budget (reported, not an error)`);
if (showBudgets) for (const o of over) console.log(`  ${String(o.lines).padStart(4)} / ${o.budget}  ${o.file}`);
console.log(`\n${errors.length} error(s).`);
process.exit(errors.length ? 1 : 0);
