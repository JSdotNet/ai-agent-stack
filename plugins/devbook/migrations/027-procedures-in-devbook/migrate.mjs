#!/usr/bin/env node
// 027-procedures-in-devbook — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is a
// `components.devbook-procedures` entry. Once its `adopted` sits under
// `components.devbook.procedures` and its `materialized` entries under
// `components.devbook.materialized`, the migration has nothing to see.

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const STAMP = ".devbook/config.json";
const OLD = "devbook-procedures";
const abs = (rel) => path.join(ROOT, rel);

async function exists(rel) {
    try { await stat(abs(rel)); return true; } catch { return false; }
}

/** Where the value of `"key":` starts and ends, searching from `from`; null when absent. */
function valueSpan(text, key, from) {
    const at = text.indexOf(`"${key}":`, from);
    if (at < 0) return null;
    const open = text.indexOf("{", at);
    let depth = 0, inString = false;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (inString) { if (c === "\\") i++; else if (c === '"') inString = false; continue; }
        if (c === '"') inString = true;
        else if (c === "{") depth++;
        else if (c === "}" && --depth === 0) return { key: at, open, end: i + 1 };
    }
    return null;
}

/** The whitespace a line starts with, for the line holding `at`. */
const indentAt = (text, at) => /^[ \t]*/.exec(text.slice(text.lastIndexOf("\n", at - 1) + 1))[0];

if (!(await exists(STAMP))) { console.log("027-procedures-in-devbook: nothing to do."); process.exit(0); }
const raw = await readFile(abs(STAMP), "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const text = raw.replace(/\r\n/g, "\n");
const stamp = JSON.parse(text);
const old = stamp?.components?.[OLD];
if (!old) { console.log("027-procedures-in-devbook: nothing to do."); process.exit(0); }

const unit = /\n([ \t]+)"/.exec(text)?.[1] ?? "  ";
const current = stamp.components.devbook;
const next = structuredClone(current ?? {});
const adopted = [...new Set([...(next.procedures?.adopted ?? []), ...(old.adopted ?? [])])];
next.procedures = { ...(next.procedures ?? {}), adopted };
const materialized = { ...(next.materialized ?? {}) };
const moved = [];
for (const [p, entry] of Object.entries(old.materialized ?? {})) {
    if (p in materialized) continue; // devbook's own record of a path wins
    materialized[p] = entry;
    moved.push(p);
}
next.materialized = Object.fromEntries(Object.entries(materialized).sort(([a], [b]) => a.localeCompare(b)));

console.log(`- move components.${OLD}.adopted [${(old.adopted ?? []).join(", ")}] to components.devbook.procedures.adopted`);
console.log(`- move ${moved.length} materialized entr${moved.length === 1 ? "y" : "ies"} into components.devbook.materialized, hashes kept`);
console.log(`- remove components.${OLD}`);
if (checkOnly) process.exit(1);

const components = text.indexOf('"components":');
const oldSpan = valueSpan(text, OLD, components);
const devSpan = current ? valueSpan(text, "devbook", components) : null;
const render = (value, at) => JSON.stringify(value, null, unit).split("\n").join(`\n${indentAt(text, at)}`);

let out;
if (devSpan) {
    // Remove the old property with the comma that joins it to its neighbour — the one before
    // it, or the one after it when it is the first — then rewrite devbook's value. The later
    // span goes first, so the earlier one's offsets still hold.
    let i = oldSpan.key - 1;
    while (/\s/.test(text[i])) i--;
    const removal = text[i] === ","
        ? { from: i, to: oldSpan.end }
        : { from: oldSpan.key, to: oldSpan.end + (/^\s*,\s*/.exec(text.slice(oldSpan.end))?.[0].length ?? 0) };
    const edits = [
        { ...removal, with: "" },
        { from: devSpan.open, to: devSpan.end, with: render(next, devSpan.key) },
    ].sort((a, b) => b.from - a.from);
    out = text;
    for (const e of edits) out = out.slice(0, e.from) + e.with + out.slice(e.to);
} else {
    // No devbook entry yet: the old property becomes devbook's, in place.
    out = text.slice(0, oldSpan.key) + `"devbook": ${render(next, oldSpan.key)}` + text.slice(oldSpan.end);
}

JSON.parse(out); // never write a stamp that no longer parses
await writeFile(abs(STAMP), out.replace(/\n/g, eol), "utf8");
console.log("027-procedures-in-devbook: applied.");
