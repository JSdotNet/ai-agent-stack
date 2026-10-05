#!/usr/bin/env node
// 002-debug-is-diagnose — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is a `debug` procedure —
// `.agents/skills/debug.md`, a wrapper pointing at it, or `debug` in the stamp's `adopted`.
// Once none of those remain, the migration has nothing to see. The `diagnose` wrappers are
// `update`'s to write, as for any adopted procedure.

import { createHash } from "node:crypto";
import { readFile, rm, rmdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const STAMP = ".devbook/config.json";
const OLD_BODY = ".agents/skills/debug.md";
const NEW_BODY = ".agents/skills/diagnose.md";
const OLD_WRAPPERS = [".claude/skills/debug/SKILL.md", ".github/skills/debug/SKILL.md"];
const MARK = "**Goal, fixed by devbook-procedures:**";

const abs = (rel) => path.join(ROOT, rel);
const lf = (text) => text.replace(/\r\n/g, "\n");
const hash = (text) => `sha256:${createHash("sha256").update(lf(text), "utf8").digest("hex")}`;

async function exists(rel) {
    try { await stat(abs(rel)); return true; } catch { return false; }
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

// The release this migration ships in, stamped as `from` on what it writes.
const version = "1.14.0";

const stampText = (await exists(STAMP)) ? lf(await readFile(abs(STAMP), "utf8")) : null;
const stamp = stampText ? JSON.parse(stampText) : null;
const entry = stamp?.components?.["devbook-procedures"];
const materialized = entry?.materialized ?? {};

const plan = [];
const writes = [];
const removes = [];

if (await exists(OLD_BODY)) {
    if (await exists(NEW_BODY)) {
        console.log(`${OLD_BODY} and ${NEW_BODY} both exist: fold one into the other by hand, delete ${OLD_BODY}, and run this again.`);
        process.exit(1);
    }
    const text = lf(await readFile(abs(OLD_BODY), "utf8"));
    const stamped = materialized[OLD_BODY];
    if (stamped && stamped.hash === hash(text)) {
        removes.push(OLD_BODY);
        plan.push(`delete ${OLD_BODY}: unedited since it landed, so update seeds ${NEW_BODY} fresh`);
    } else {
        writes.push([NEW_BODY, text.replace(/^(---\n[\s\S]*?)^name: debug$/m, "$1name: diagnose")]);
        removes.push(OLD_BODY);
        plan.push(`move ${OLD_BODY} → ${NEW_BODY}: edited, kept as the repository's own`);
    }
}

for (const w of OLD_WRAPPERS) {
    if (!(await exists(w))) continue;
    const text = lf(await readFile(abs(w), "utf8"));
    if (!text.includes(MARK)) { plan.push(`leave ${w}: not a devbook-procedures wrapper — delete it by hand if it is stale`); continue; }
    removes.push(w);
    plan.push(`delete ${w}`);
}

let newStamp = null;
if (entry && (removes.length > 0 || (entry.adopted ?? []).includes("debug"))) {
    const next = structuredClone(entry);
    next.adopted = [...new Set((next.adopted ?? []).map((n) => (n === "debug" ? "diagnose" : n)))];
    const moved = next.materialized ?? {};
    for (const p of [OLD_BODY, ...OLD_WRAPPERS]) if (removes.includes(p)) delete moved[p];
    for (const [p, text] of writes) moved[p] = { from: version, hash: hash(text), managed: false };
    next.materialized = Object.fromEntries(Object.entries(moved).sort(([a], [b]) => a.localeCompare(b)));
    newStamp = replaceEntry(stampText, next);
    if (newStamp !== stampText) plan.push(`rewrite components.devbook-procedures in ${STAMP}: adopted debug → diagnose, materialized moved`);
    else newStamp = null;
}

if (!plan.length) { console.log("002-debug-is-diagnose: nothing to do."); process.exit(0); }
for (const p of plan) console.log(`- ${p}`);
const work = writes.length + removes.length + (newStamp ? 1 : 0);
if (checkOnly) process.exit(work ? 1 : 0);

for (const [p, text] of writes) await writeFile(abs(p), text, "utf8");
for (const p of removes) {
    await rm(abs(p));
    try { await rmdir(path.dirname(abs(p))); } catch { /* not empty, or the shared .agents/skills */ }
}
if (newStamp) await writeFile(abs(STAMP), newStamp, "utf8");
console.log("002-debug-is-diagnose: applied.");
