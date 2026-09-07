#!/usr/bin/env node
// 008-config-to-devbook — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is a stack
// config at the old path. Once it is gone the migration has nothing to see,
// which is what makes re-running it safe.

import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const OLD = ".github/ai-agent-stack.json";
const NEW = ".devbook/config.json";

async function read(relPath) {
    try {
        await stat(path.join(ROOT, relPath));
    } catch {
        return null;
    }
    return readFile(path.join(ROOT, relPath), "utf8");
}

const old = await read(OLD);

if (old === null) {
    console.log(`008-config-to-devbook: nothing to do under ${ROOT}.`);
    process.exit(0);
}

const current = await read(NEW);

// Two configs that disagree is a merge, and merging settings nobody agreed to
// lose is not this script's call. It stops and names both files instead.
if (current !== null && current !== old) {
    console.error(
        `008-config-to-devbook: ${OLD} and ${NEW} both exist and differ.\n` +
            "  Merge them by hand into the new path, keeping every key from both, then delete the old file.\n" +
            "  Nothing was changed."
    );
    process.exit(1);
}

const action = current === null ? `move ${OLD} to ${NEW}` : `delete ${OLD}, already copied to ${NEW}`;

if (checkOnly) {
    console.log(`  would fix ${action}`);
    console.error("\n008-config-to-devbook: 1 item still to migrate.");
    process.exit(1);
}

if (current === null) {
    await mkdir(path.join(ROOT, path.dirname(NEW)), { recursive: true });
    await writeFile(path.join(ROOT, NEW), old, "utf8");
}
await rm(path.join(ROOT, OLD));

console.log(`  fixed    ${action}`);
console.log("\n008-config-to-devbook: applied 1 change.");
