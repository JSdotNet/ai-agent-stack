#!/usr/bin/env node
// Converts the retired personal model-selection file into the user-overlay `phases` entries
// that replace it, and prints them. Writes nothing: `devbook-config:local` merges the result
// into the overlay, validates it, and retires the file.
//
//   node model-selection.mjs [path]           print { phases, unknown } as JSON
//
// Without a path, the file is where the delivery `model-override` slot says it lives:
// CLAUDE_FLOW_MODEL_SELECTION_PATH when set, else model-selection.md in the devbook config
// directory. Exit 0 with `{ "present": false }` when there is no file.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The 1.13.0 categories, from delivery's retired `flow-model-selection.md`, by the phases each
// one's stages became. Human-in-the-Loop and Fallback / Unclassified name no phase.
export const CATEGORIES = {
    'Architecture & Design': [
        ['flow-code', 'phase-scope'], ['flow-code', 'phase-plan'],
        ['flow-spec', 'phase-drafting:arc42'], ['flow-spec', 'phase-drafting:tech'],
    ],
    'Implementation & Coding': [['flow-code', 'phase-implement']],
    'Testing, QA & Monitoring': [['flow-code', 'phase-build-test'], ['flow-code', 'phase-verify']],
    Verification: [['flow-code', 'phase-spec-check']],
    'Domain Design': [['flow-spec', 'phase-drafting:domain']],
    'Design Authoring': [['flow-spec', 'phase-drafting:design']],
    'Documentation & Low-Complexity': [
        ['flow-spec', 'phase-drafting:ai'], ['flow-code', 'phase-report-back'], ['flow-spec', 'phase-report-back'],
    ],
    'Human-in-the-Loop': [],
    'Fallback / Unclassified': [],
};

/** The `Category | Model` rows of a model-selection file, in order. */
export function parseModelSelection(text) {
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
        const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^\*\*|\*\*$/g, ''));
        if (cells.length < 2 || !cells[0] || /^-+$/.test(cells[0]) || /^category$/i.test(cells[0])) continue;
        if (!line.trim().startsWith('|')) continue;
        rows.push({ category: cells[0], model: cells[1].replace(/`/g, '') });
    }
    return rows;
}

/**
 * The overlay `phases` the rows become, plus every row naming no phase: an unknown category,
 * or one that maps to none. A category listed twice takes its last row.
 */
export function toPhases(rows) {
    const phases = {};
    const unknown = [];
    for (const { category, model } of rows) {
        const targets = CATEGORIES[category];
        if (!targets?.length) {
            unknown.push({ category, model, why: targets ? 'names no phase' : 'not a 1.13.0 category' });
            continue;
        }
        for (const [flow, phase] of targets) {
            phases[flow] ??= {};
            phases[flow][phase] = { model };
        }
    }
    return { phases, unknown };
}

export function modelSelectionPath(env = process.env) {
    if (env.CLAUDE_FLOW_MODEL_SELECTION_PATH) return resolve(env.CLAUDE_FLOW_MODEL_SELECTION_PATH);
    const dir = env.XDG_CONFIG_HOME
        ? join(env.XDG_CONFIG_HOME, 'devbook')
        : process.platform === 'win32' && env.APPDATA
          ? join(env.APPDATA, 'devbook')
          : join(homedir(), '.config', 'devbook');
    return join(dir, 'model-selection.md');
}

function main(argv) {
    const path = argv[0] ? resolve(argv[0]) : modelSelectionPath();
    if (!existsSync(path)) {
        console.log(JSON.stringify({ path, present: false }, null, 2));
        return 0;
    }
    const { phases, unknown } = toPhases(parseModelSelection(readFileSync(path, 'utf8')));
    console.log(JSON.stringify({ path, present: true, phases, unknown }, null, 2));
    return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    process.exit(main(process.argv.slice(2)));
}
