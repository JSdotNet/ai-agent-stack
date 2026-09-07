#!/usr/bin/env node
// 009-install-skill-ids — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is an old
// install-skill id under `extensions`. Once none is left the migration has
// nothing to see, which is what makes re-running it safe.

import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

// Every plugin's install skill is now called `install`; the plugin name in the
// addressed id carries what the old prefix said twice.
const RENAMED = {
    "devbook:devbook-install": "devbook:install",
    "devbook-collaboration:collaboration-install": "devbook-collaboration:install",
    "delivery-schedule:schedule-install": "delivery-schedule:install",
};

// Both config files: the overlay names providers with the same vocabulary, and one
// left behind would keep resolving to a skill that no longer exists.
const TARGETS = [".devbook/config.json", ".devbook/config.local.json"];

async function readIfPresent(relPath) {
    try {
        await stat(path.join(ROOT, relPath));
    } catch {
        return null;
    }
    return readFile(path.join(ROOT, relPath), "utf8");
}

/** Rewrite one provider id wherever it appears, recording each hit. */
function rewrite(node, where, hits) {
    if (typeof node === "string") {
        const to = RENAMED[node];
        if (!to) return node;
        hits.push({ where, from: node, to });
        return to;
    }
    if (Array.isArray(node)) return node.map((item, i) => rewrite(item, `${where}[${i}]`, hits));
    if (node && typeof node === "object") {
        // Only the two keys that hold a provider id. Rewriting every string would
        // rename a gate prompt that happens to quote the old name.
        const out = { ...node };
        for (const key of ["provider", "run"]) {
            if (key in out) out[key] = rewrite(out[key], `${where}.${key}`, hits);
        }
        return out;
    }
    return node;
}

const hits = [];
const pending = [];

for (const target of TARGETS) {
    const raw = await readIfPresent(target);
    if (raw === null) continue;

    let config;
    try {
        config = JSON.parse(raw);
    } catch (error) {
        console.error(`009-install-skill-ids: ${target} is not valid JSON — ${error.message}`);
        console.error("  Fix the file by hand, then re-run. Nothing was changed.");
        process.exit(1);
    }

    if (!config.extensions || typeof config.extensions !== "object") continue;

    const before = hits.length;
    const extensions = {};
    for (const [point, value] of Object.entries(config.extensions)) {
        extensions[point] = rewrite(value, `${target} extensions.${point}`, hits);
    }
    if (hits.length > before) pending.push({ target, config: { ...config, extensions } });
}

if (hits.length === 0) {
    console.log(`009-install-skill-ids: nothing to do under ${ROOT}.`);
    process.exit(0);
}

for (const hit of hits) {
    console.log(`  ${checkOnly ? "would fix" : "fixed   "} ${hit.where}: ${hit.from} -> ${hit.to}`);
}

if (checkOnly) {
    console.error(`\n009-install-skill-ids: ${hits.length} item(s) still to migrate.`);
    process.exit(1);
}

for (const { target, config } of pending) {
    await writeFile(path.join(ROOT, target), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

console.log(`\n009-install-skill-ids: applied ${hits.length} change(s).`);
