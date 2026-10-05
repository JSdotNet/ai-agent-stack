#!/usr/bin/env node
// 004-start-binding-is-run — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is `extensions["app.start"]`
// naming `repo:start`, as a string or as an object's `provider`. Once the key is gone, or its
// provider is the run recipe, the migration has nothing to see.

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const STAMP = ".devbook/config.json";
const OLD = "repo:start";
// The run recipe, which an unset `app.start` — `phase-verify.app` from delivery 1.14.0 — falls
// back to. Options need a provider to belong to, so they move to it by name.
const DEFAULT = "repo:run";

const abs = (rel) => path.join(ROOT, rel);
const lf = (text) => text.replace(/\r\n/g, "\n");

async function exists(rel) {
    try { await stat(abs(rel)); return true; } catch { return false; }
}

/** The index just past the JSON value starting at or after `i`. */
function valueEnd(text, i) {
    while (/\s/.test(text[i])) i++;
    if (text[i] === '"') {
        for (i++; text[i] !== '"'; i++) if (text[i] === "\\") i++;
        return i + 1;
    }
    if (text[i] === "{" || text[i] === "[") {
        let depth = 0, inString = false;
        for (; i < text.length; i++) {
            const c = text[i];
            if (inString) { if (c === "\\") i++; else if (c === '"') inString = false; continue; }
            if (c === '"') inString = true;
            else if (c === "{" || c === "[") depth++;
            else if ((c === "}" || c === "]") && --depth === 0) return i + 1;
        }
    }
    return /^[^,}\]\s]*/.exec(text.slice(i))[0].length + i;
}

/** The members of the object opening at `open`: key text and the spans of key and value. */
function members(text, open) {
    const found = [];
    let i = open + 1;
    for (;;) {
        while (/[\s,]/.test(text[i])) i++;
        if (text[i] === "}") return found;
        const keyStart = i, keyEnd = valueEnd(text, i);
        const colon = text.indexOf(":", keyEnd);
        let valueStart = colon + 1;
        while (/\s/.test(text[valueStart])) valueStart++;
        i = valueEnd(text, valueStart);
        found.push({ key: JSON.parse(text.slice(keyStart, keyEnd)), keyStart, valueStart, valueEnd: i });
    }
}

/** Removes one member from its object, leaving every other byte alone. */
function removeMember(text, list, index) {
    const m = list[index];
    if (index + 1 < list.length) return text.slice(0, m.keyStart) + text.slice(list[index + 1].keyStart);
    if (index > 0) return text.slice(0, list[index - 1].valueEnd) + text.slice(m.valueEnd);
    const open = text.lastIndexOf("{", m.keyStart), close = text.indexOf("}", m.valueEnd);
    return text.slice(0, open + 1) + text.slice(close);
}

const stampText = (await exists(STAMP)) ? lf(await readFile(abs(STAMP), "utf8")) : null;
const root = stampText ? members(stampText, stampText.indexOf("{")) : [];
const extIndex = root.findIndex((m) => m.key === "extensions");
const ext = extIndex === -1 ? null : root[extIndex];
const points = ext && stampText[ext.valueStart] === "{" ? members(stampText, ext.valueStart) : [];
const atIndex = points.findIndex((m) => m.key === "app.start");
const value = atIndex === -1 ? null : JSON.parse(stampText.slice(points[atIndex].valueStart, points[atIndex].valueEnd));

const options = value && typeof value === "object" ? Object.keys(value).filter((k) => k !== "provider") : [];
const stale = value === OLD || (value && typeof value === "object" && value.provider === OLD);
if (!stale) { console.log("004-start-binding-is-run: nothing to do."); process.exit(0); }

let next, plan;
if (options.length === 0) {
    // The run recipe covers it: the key goes, and `extensions` with it once empty.
    next = points.length === 1
        ? removeMember(stampText, root, extIndex)
        : removeMember(stampText, points, atIndex);
    plan = `remove extensions["app.start"] from ${STAMP}: ${OLD} is gone, and an unset app.start falls back to the run recipe`;
} else {
    const m = points[atIndex];
    const old = stampText.slice(m.valueStart, m.valueEnd);
    next = stampText.slice(0, m.valueStart) + old.replace(/("provider"\s*:\s*)"repo:start"/, `$1"${DEFAULT}"`) + stampText.slice(m.valueEnd);
    plan = `rewrite extensions["app.start"].provider in ${STAMP} to ${DEFAULT}, keeping ${options.join(", ")}`;
}

console.log(`- ${plan}`);
if (checkOnly) process.exit(1);
await writeFile(abs(STAMP), next, "utf8");
console.log("004-start-binding-is-run: applied.");
