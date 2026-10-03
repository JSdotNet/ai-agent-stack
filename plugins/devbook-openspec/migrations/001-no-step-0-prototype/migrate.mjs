#!/usr/bin/env node
// 001-no-step-0-prototype — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shapes that must not be present are the
// `prototype` field in `components.openspec` and the one rule line `init` seeded
// into `openspec/config.yaml`. Once neither is left there is nothing to see.

import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const STAMP = ".devbook/config.json";
const CONFIG = "openspec/config.yaml";
// The exact line `init` wrote under `rules.tasks`, whatever its indentation and line ending.
const RULE = /^[ \t]*- A Step 0 prototype is allowed here\.[ \t]*(\r?\n|$)/m;

const abs = (rel) => path.join(ROOT, rel);
const lf = (text) => text.replace(/\r\n/g, "\n");
const hash = (text) => `sha256:${createHash("sha256").update(lf(text), "utf8").digest("hex")}`;

async function exists(rel) {
    try { await stat(abs(rel)); return true; } catch { return false; }
}

/** Replaces the value of `"openspec"` in the stamp text, leaving every other byte alone. */
function replaceEntry(text, entry) {
    const key = '"openspec":';
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
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    // A list of strings stays on one line, as the stamp writes `tools`.
    const rendered = JSON.stringify(entry, null, 2)
        .replace(/\[\n\s*("[^"\n]*"(?:,\n\s*"[^"\n]*")*)\n\s*\]/g, (_, items) => `[${items.split(/,\n\s*/).join(", ")}]`)
        .split("\n").join(`${eol}${indent}`);
    return text.slice(0, open) + rendered + text.slice(end + 1);
}

const stampText = (await exists(STAMP)) ? await readFile(abs(STAMP), "utf8") : null;
const entry = stampText ? JSON.parse(stampText)?.components?.openspec : null;
if (!entry) { console.log("001-no-step-0-prototype: no components.openspec, nothing to do."); process.exit(0); }

const plan = [];
const next = structuredClone(entry);

if ("prototype" in next) {
    delete next.prototype;
    plan.push(`drop components.openspec.prototype from ${STAMP}`);
}

let newConfig = null;
if (await exists(CONFIG)) {
    const before = await readFile(abs(CONFIG), "utf8");
    if (RULE.test(before)) {
        newConfig = before.replace(RULE, "");
        plan.push(`remove the Step 0 rule line from ${CONFIG}`);
        // A config still as it landed keeps reading as seeded; an edited one stays the repository's.
        const stamped = next.materialized?.[CONFIG];
        if (stamped?.hash === hash(before)) stamped.hash = hash(newConfig);
    }
}

if (!plan.length) { console.log("001-no-step-0-prototype: nothing to do."); process.exit(0); }
for (const p of plan) console.log(`- ${p}`);
if (checkOnly) process.exit(1);

if (newConfig !== null) await writeFile(abs(CONFIG), newConfig, "utf8");
const newStamp = replaceEntry(stampText, next);
if (newStamp !== stampText) await writeFile(abs(STAMP), newStamp, "utf8");
console.log("001-no-step-0-prototype: applied.");
