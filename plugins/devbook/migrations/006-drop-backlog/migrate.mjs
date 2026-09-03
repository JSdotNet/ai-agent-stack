#!/usr/bin/env node
// 006-drop-backlog — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: every step is expressed as "this shape must not
// be present", so applying it twice is applying it once. `--check` runs the
// same detection and writes nothing, which is what CI and the plan phase of
// `devbook-sync` call.

import { readFile, writeFile, readdir, stat, rm } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

// The folders devbook still recognizes. Their chapters are where a reference
// into `.backlog/` can still be hiding.
const FOLDERS = [".arc42", ".domain", ".tech", ".design", ".ai"];
const WORKFLOW = ".github/workflows/knowledge-meta.yml";
const ORPHANED_META = ".backlog/_meta";

// The two fields that hold chapter references, and so the only lines a
// `.backlog/…` entry can legally appear on.
const REFERENCE_LINE = /^(\s*)(related|depends-on):\s*(.*)$/;

const findings = [];

async function exists(relPath) {
    try {
        await stat(path.join(ROOT, relPath));
        return true;
    } catch {
        return false;
    }
}

async function markdownUnder(folder) {
    const found = [];
    async function walk(rel) {
        let entries;
        try {
            entries = await readdir(path.join(ROOT, rel), { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const child = path.posix.join(rel, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "_meta") continue;
                await walk(child);
            } else if (entry.name.endsWith(".md")) {
                found.push(child);
            }
        }
    }
    await walk(folder);
    return found;
}

/** Strip `.backlog/…` entries from one reference line, or drop the line when nothing is left. */
function rewriteReferenceLine(line) {
    const match = REFERENCE_LINE.exec(line);
    if (!match) return { line, removed: 0 };
    const [, indent, field, rawValue] = match;
    const bracketed = rawValue.startsWith("[") && rawValue.endsWith("]");
    const entries = (bracketed ? rawValue.slice(1, -1) : rawValue)
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    const kept = entries.filter(
        (entry) => !entry.replace(/^['"]|['"]$/g, "").startsWith(".backlog/")
    );
    const removed = entries.length - kept.length;
    if (removed === 0) return { line, removed: 0 };
    // A field with nothing left is omitted, never written out as an empty list.
    if (kept.length === 0) return { line: null, removed };
    const value = bracketed || kept.length > 1 ? `[${kept.join(", ")}]` : kept[0];
    return { line: `${indent}${field}: ${value}`, removed };
}

async function sweepReferences() {
    for (const folder of FOLDERS) {
        for (const relPath of await markdownUnder(folder)) {
            const original = await readFile(path.join(ROOT, relPath), "utf8");
            const eol = original.includes("\r\n") ? "\r\n" : "\n";
            const rewritten = [];
            let removed = 0;
            for (const line of original.split(/\r?\n/)) {
                const result = rewriteReferenceLine(line);
                removed += result.removed;
                if (result.line !== null) rewritten.push(result.line);
            }
            if (removed === 0) continue;
            findings.push(`${relPath}: ${removed} reference(s) into .backlog/`);
            if (!checkOnly) await writeFile(path.join(ROOT, relPath), rewritten.join(eol), "utf8");
        }
    }
}

async function sweepOrphanedMeta() {
    if (!(await exists(ORPHANED_META))) return;
    findings.push(`${ORPHANED_META}: orphaned derived artifacts, nothing regenerates them`);
    if (!checkOnly) await rm(path.join(ROOT, ORPHANED_META), { recursive: true, force: true });
}

async function sweepWorkflow() {
    if (!(await exists(WORKFLOW))) return;
    const original = await readFile(path.join(ROOT, WORKFLOW), "utf8");
    const next = original.replace(/^[ \t]*-[ \t]*['"]?\.backlog\/\*\*['"]?[ \t]*\r?\n/gm, "");
    if (next === original) return;
    findings.push(`${WORKFLOW}: path filter still watches .backlog/**`);
    if (!checkOnly) await writeFile(path.join(ROOT, WORKFLOW), next, "utf8");
}

await sweepReferences();
await sweepOrphanedMeta();
await sweepWorkflow();

// `.backlog/` itself is the repository's content, not devbook's to remove.
if (await exists(".backlog")) {
    console.log(
        ".backlog/ is still present. devbook no longer reads it, and this migration " +
            "deliberately leaves it alone — move those chapters to a tracker, or keep them " +
            "as ordinary Markdown outside the convention."
    );
}

if (!findings.length) {
    console.log(`006-drop-backlog: nothing to do under ${ROOT}.`);
    process.exit(0);
}

for (const finding of findings) {
    console.log(`  ${checkOnly ? "would fix" : "fixed   "} ${finding}`);
}

if (checkOnly) {
    console.error(`\n006-drop-backlog: ${findings.length} item(s) still to migrate.`);
    process.exit(1);
}

console.log(`\n006-drop-backlog: applied ${findings.length} change(s). Regenerate _meta/ next.`);
