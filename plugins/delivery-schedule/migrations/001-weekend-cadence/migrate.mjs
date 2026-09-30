#!/usr/bin/env node
// 001-weekend-cadence — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           print the plan; writes nothing
//   node migrate.mjs --root ../other-repo
//
// The routines this moves live in the machine's scheduler, which no script reaches, so the
// work is delivery-schedule:update's: step 6 re-times each routine from the catalog, and
// step 7 stamps the pluginVersion that closes this. Idempotent by that stamp: once it reads
// 1.15.0 or later, or no moved schedule is selected without an override, there is nothing
// to see.

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const STAMP = ".devbook/config.json";
// The release this migration ships in.
const version = "1.15.0";
const MOVED = {
    "morning-brief": ["0 5 * * 1-5", "30 6 * * 1-5"],
    "devbook-update": ["0 5 * * 6", "0 6 * * 6"],
    "security-review": ["0 4 * * 2", "0 8 * * 6"],
    "devbook-verify": ["0 4 * * 1", "0 5 * * 0"],
    "prose-check": ["0 4 * * 3", "0 6 * * 0"],
    "instruction-review": ["0 4 * * 4", "0 7 * * 0"],
    "change-report": ["0 15 * * 5", "0 16 * * 0"],
    "weekly-update": ["0 16 * * 5", "0 17 * * 0"],
};

const below = (a, b) => {
    const [x, y] = [a, b].map((v) => String(v).split(".").map(Number));
    for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0);
    return false;
};

let stamp = null;
try {
    await stat(path.join(ROOT, STAMP));
    stamp = JSON.parse(await readFile(path.join(ROOT, STAMP), "utf8"));
} catch { /* no stack config: nothing scheduled */ }
const entry = stamp?.components?.schedule;

const plan = [];
const kept = [];
if (entry && below(entry.pluginVersion ?? "0.0.0", version)) {
    for (const name of entry.enabled ?? []) {
        if (!MOVED[name]) continue;
        const override = entry.overrides?.[name]?.cron;
        if (override) kept.push(`${name}: override \`${override}\` kept`);
        else plan.push(`${name}: \`${MOVED[name][0]}\` → \`${MOVED[name][1]}\` UTC`);
    }
}

for (const k of kept) console.log(`- ${k}`);
if (!plan.length) { console.log("001-weekend-cadence: nothing to do."); process.exit(0); }
console.log("delivery-schedule:update re-times these routines and stamps pluginVersion:");
for (const p of plan) console.log(`- ${p}`);
if (checkOnly) process.exit(1);
console.log("001-weekend-cadence: nothing written; run delivery-schedule:update to apply.");
