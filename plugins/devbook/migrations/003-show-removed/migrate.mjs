#!/usr/bin/env node
// 003-show-removed — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is a stamped `show` —
// `show` in the stamp's `adopted`, a `show` path in its `materialized`, or a wrapper this
// plugin wrote. An edited body left behind is out of the stamp, so a second run ignores it.

import { createHash } from "node:crypto";
import { readFile, rm, rmdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const STAMP = ".devbook/config.json";
const BODY = ".agents/skills/show.md";
const WRAPPERS = [".claude/skills/show/SKILL.md", ".github/skills/show/SKILL.md"];
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

const stampText = (await exists(STAMP)) ? lf(await readFile(abs(STAMP), "utf8")) : null;
const stamp = stampText ? JSON.parse(stampText) : null;
const entry = stamp?.components?.["devbook-procedures"];
const materialized = entry?.materialized ?? {};

const plan = [];
const removes = [];

const stampedBody = materialized[BODY];
if (stampedBody && (await exists(BODY))) {
    if (stampedBody.hash === hash(await readFile(abs(BODY), "utf8"))) {
        removes.push(BODY);
        plan.push(`delete ${BODY}: unedited since it landed`);
    } else {
        plan.push(`leave ${BODY}: edited, the repository's own — no wrapper will reach it`);
    }
}

for (const w of WRAPPERS) {
    if (!(await exists(w))) continue;
    const text = lf(await readFile(abs(w), "utf8"));
    if (!text.includes(MARK)) { plan.push(`leave ${w}: not a devbook-procedures wrapper — delete it by hand if it is stale`); continue; }
    removes.push(w);
    plan.push(`delete ${w}`);
}

let newStamp = null;
if (entry) {
    const next = structuredClone(entry);
    next.adopted = (next.adopted ?? []).filter((n) => n !== "show");
    next.materialized = Object.fromEntries(Object.entries(next.materialized ?? {}).filter(([p]) => p !== BODY && !WRAPPERS.includes(p)));
    newStamp = replaceEntry(stampText, next);
    if (newStamp !== stampText) plan.push(`rewrite components.devbook-procedures in ${STAMP}: show dropped`);
    else newStamp = null;
}

const work = removes.length + (newStamp ? 1 : 0);
if (!work) { console.log("003-show-removed: nothing to do."); process.exit(0); }
for (const p of plan) console.log(`- ${p}`);
if (checkOnly) process.exit(1);

for (const p of removes) {
    await rm(abs(p));
    try { await rmdir(path.dirname(abs(p))); } catch { /* not empty, or the shared .agents/skills */ }
}
if (newStamp) await writeFile(abs(STAMP), newStamp, "utf8");
console.log("003-show-removed: applied.");
