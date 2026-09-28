#!/usr/bin/env node
// 001-start-is-run — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is a `start` procedure —
// `.agents/skills/start.md`, a wrapper pointing at it, or `start` in the stamp's `adopted`.
// Once the body is `.claude/skills/run-<id>/SKILL.md`, Copilot's twin is
// `.github/skills/run/SKILL.md`, and the stamp says `run`, the migration has nothing to see.

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, rmdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());
const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const STAMP = ".devbook/config.json";
const OLD_BODY = ".agents/skills/start.md";
const OLD_WRAPPERS = [".claude/skills/start/SKILL.md", ".github/skills/start/SKILL.md"];
const TWIN = ".github/skills/run/SKILL.md";
const MARK = "**Goal, fixed by devbook-procedures:**";

const abs = (rel) => path.join(ROOT, rel);
const lf = (text) => text.replace(/\r\n/g, "\n");
const hash = (text) => `sha256:${createHash("sha256").update(lf(text), "utf8").digest("hex")}`;

async function exists(rel) {
    try { await stat(abs(rel)); return true; } catch { return false; }
}

/** Splits a Markdown file into its frontmatter lines and its body. */
function split(text) {
    const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(lf(text));
    return m ? { fm: m[1].split("\n"), body: m[2] } : { fm: [], body: lf(text) };
}

/** The raw `key: value` line of a frontmatter, kept verbatim so its quoting survives. */
const line = (fm, key) => fm.find((l) => l.startsWith(`${key}:`));
const unquote = (l) => l.slice(l.indexOf(":") + 1).trim().replace(/^"(.*)"$/, "$1");

/** Every `.claude/skills/run-*` recipe already in the repository. */
async function recipes() {
    const dir = abs(".claude/skills");
    if (!(await exists(".claude/skills"))) return [];
    const found = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const rel = `.claude/skills/${e.name}/SKILL.md`;
        if (e.isDirectory() && e.name.startsWith("run-") && (await exists(rel))) found.push(rel);
    }
    return found.sort();
}

function renderTwin(seedFm, bodies) {
    const pointers = bodies.map((b) => `Read \`${b}\` and follow it.`).join("\n");
    const lead = bodies.length > 1 ? "Pick the recipe for the unit being changed. " : "";
    return `---\nname: run\n${line(seedFm, "description")}\n---\n\n${MARK} ${unquote(line(seedFm, "goal"))}\n\n${lead}${pointers} It is this repository's own procedure; where it\nand the goal above disagree, the procedure is what needs fixing.\n`;
}

/** Replaces the value of `"devbook-procedures"` in the stamp text, leaving every other byte alone. */
function replaceEntry(text, entry) {
    const key = '"devbook-procedures":';
    const at = text.indexOf(key);
    const open = text.indexOf("{", at);
    let depth = 0, inString = false, end = -1;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (inString) { if (c === "\\") i++; else if (c === '"') inString = false; continue; }
        if (c === '"') inString = true;
        else if (c === "{") depth++;
        else if (c === "}" && --depth === 0) { end = i; break; }
    }
    const indent = /[ \t]*$/.exec(text.slice(text.lastIndexOf("\n", at) + 1, at))[0];
    // A list of strings stays on one line, as the stamp writes `adopted`.
    const rendered = JSON.stringify(entry, null, 2)
        .replace(/\[\n\s*("[^"\n]*"(?:,\n\s*"[^"\n]*")*)\n\s*\]/g, (_, items) => `[${items.split(/,\n\s*/).join(", ")}]`)
        .split("\n").join(`\n${indent}`);
    return text.slice(0, open) + rendered + text.slice(end + 1);
}

const seed = split(await readFile(path.join(PLUGIN, "assets", "skills", "run.md"), "utf8")).fm;
// The release this migration ships in, stamped as `from` on what it writes.
const version = "1.11.0";

const stampText = (await exists(STAMP)) ? lf(await readFile(abs(STAMP), "utf8")) : null;
const stamp = stampText ? JSON.parse(stampText) : null;
const entry = stamp?.components?.["devbook-procedures"];
const id = stamp?.id;

const plan = [];
const writes = [];
const removes = [];
let body = null;

const existing = await recipes();
if (await exists(OLD_BODY)) {
    if (existing.length) {
        console.log(`${OLD_BODY} and ${existing.join(", ")} both exist: fold the start procedure into the recipe by hand, delete ${OLD_BODY}, and run this again.`);
        process.exit(1);
    }
    if (!id) {
        console.log(`${STAMP} carries no id, so the recipe cannot be named run-<id>. Add the id and run this again.`);
        process.exit(1);
    }
    body = `.claude/skills/run-${id}/SKILL.md`;
    const old = split(await readFile(abs(OLD_BODY), "utf8"));
    const text = `---\nname: run-${id}\n${line(seed, "description")}\n${line(seed, "goal")}\n---\n${old.body.startsWith("\n") ? "" : "\n"}${old.body}`;
    writes.push([body, text]);
    removes.push(OLD_BODY);
    plan.push(`move ${OLD_BODY} → ${body}`);
}

for (const w of OLD_WRAPPERS) {
    if (!(await exists(w))) continue;
    const text = lf(await readFile(abs(w), "utf8"));
    if (!text.includes(MARK)) { plan.push(`leave ${w}: not a devbook-procedures wrapper — delete it by hand if it is stale`); continue; }
    removes.push(w);
    plan.push(`delete ${w}`);
}

const bodies = body ? [body] : existing;
const migrating = removes.length > 0 || (entry?.adopted ?? []).includes("start");
let twin = null;
if (migrating && bodies.length) {
    twin = renderTwin(seed, bodies);
    const current = (await exists(TWIN)) ? lf(await readFile(abs(TWIN), "utf8")) : null;
    if (current !== null && !current.includes(MARK)) plan.push(`leave ${TWIN}: not a devbook-procedures wrapper`);
    else if (current !== twin) { writes.push([TWIN, twin]); plan.push(`write ${TWIN}`); }
}

let newStamp = null;
if (entry && migrating) {
    const next = structuredClone(entry);
    next.adopted = (next.adopted ?? []).map((n) => (n === "start" ? "run" : n));
    next.adopted = [...new Set(next.adopted)];
    const materialized = next.materialized ?? {};
    for (const p of [OLD_BODY, ...OLD_WRAPPERS]) if (removes.includes(p)) delete materialized[p];
    for (const [p, text] of writes) {
        materialized[p] = { from: version, hash: hash(text), managed: p === TWIN };
    }
    next.materialized = Object.fromEntries(Object.entries(materialized).sort(([a], [b]) => a.localeCompare(b)));
    newStamp = replaceEntry(stampText, next);
    if (newStamp !== stampText) plan.push(`rewrite components.devbook-procedures in ${STAMP}: adopted start → run, materialized moved`);
    else newStamp = null;
}

if (!plan.length) { console.log("001-start-is-run: nothing to do."); process.exit(0); }
for (const p of plan) console.log(`- ${p}`);
const work = writes.length + removes.length + (newStamp ? 1 : 0);
if (checkOnly) process.exit(work ? 1 : 0);

for (const [p, text] of writes) {
    await mkdir(path.dirname(abs(p)), { recursive: true });
    await writeFile(abs(p), text, "utf8");
}
for (const p of removes) {
    await rm(abs(p));
    try { await rmdir(path.dirname(abs(p))); } catch { /* not empty, or the shared .agents/skills */ }
}
if (newStamp) await writeFile(abs(STAMP), newStamp, "utf8");
console.log("001-start-is-run: applied.");
