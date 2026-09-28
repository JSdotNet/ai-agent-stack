#!/usr/bin/env node
// 020-no-review-triad — see MIGRATION.md.
//
//   node migrate.mjs --check   verify only; exit 1 while work remains
//   node migrate.mjs           apply; a second run changes nothing
//   node migrate.mjs --root ../other-repo
//
// Idempotent by construction: the shape that must not be present is a `meta`
// block in a devbook folder holding `review`, `reviewer`, or `review-at`. Once
// none is left there is nothing to see, which is what makes re-running it safe.
//
// Dependency-free ESM against node built-ins, like every other migration here.

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const rootIndex = args.indexOf("--root");
const ROOT = path.resolve(rootIndex !== -1 ? args[rootIndex + 1] : process.cwd());

const FOLDERS = ["domain", "arc42", "tech", "design", "ai"];
const FIELDS = ["review", "reviewer", "review-at"];

let remaining = 0;
const report = (line) => console.log(line);

async function* markdownFiles(dir) {
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    } catch {
        return;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name.startsWith("_")) continue; // _meta, _tools: never chapters
            yield* markdownFiles(full);
        } else if (entry.name.toLowerCase().endsWith(".md")) {
            yield full;
        }
    }
}

const unquote = (value) => value.replace(/^(["'])(.*)\1$/, "$2");

/**
 * Rewrite one file's `meta` fences, returning the new text and, per block that
 * carried the triad, the state it held — so a pending review can be carried
 * into the pull request or the tracker by whoever runs this.
 *
 * Only lines inside a top-level ```meta fence are considered, so prose or a
 * sample block that happens to say "review: requested" is left alone.
 */
function rewrite(text) {
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const lines = text.split(/\r?\n/);
    const out = [];
    const blocks = [];
    let heading = null;
    let current = null;

    let openFence = null;
    for (const [index, line] of lines.entries()) {
        const trimmed = line.trim();
        const fence = /^(`{3,}|~{3,})\s*([^\s`~]*)\s*$/.exec(trimmed);

        if (fence && openFence === null) {
            openFence = { marker: fence[1], label: fence[2].toLowerCase() };
            if (openFence.label === "meta") current = { heading, line: index + 1, fields: {} };
            out.push(line);
            continue;
        }
        if (fence && openFence && fence[1][0] === openFence.marker[0] &&
            fence[1].length >= openFence.marker.length && fence[2] === "") {
            if (current && Object.keys(current.fields).length) blocks.push(current);
            current = null;
            openFence = null;
            out.push(line);
            continue;
        }
        if (!openFence) {
            const h = /^#{1,6}\s+(.*)$/.exec(line);
            if (h) heading = h[1].trim();
            out.push(line);
            continue;
        }
        if (openFence.label !== "meta") {
            out.push(line);
            continue;
        }

        const match = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(line);
        if (match && FIELDS.includes(match[1])) {
            current.fields[match[1]] = unquote(match[2].trim());
            continue;
        }
        out.push(line);
    }

    return { text: out.join(eol), blocks };
}

for (const folder of FOLDERS) {
    const base = path.join(ROOT, ".devbook", folder);
    try {
        await stat(base);
    } catch {
        continue;
    }

    for await (const file of markdownFiles(base)) {
        const original = await readFile(file, "utf8");
        const { text, blocks } = rewrite(original);
        if (!blocks.length) continue;

        const rel = path.relative(ROOT, file).split(path.sep).join("/");
        remaining++;
        if (!checkOnly) await writeFile(file, text, "utf8");

        const verb = checkOnly ? "would take" : "took";
        for (const block of blocks) {
            const state = [
                block.fields.review ? `review: ${block.fields.review}` : null,
                block.fields.reviewer ? `reviewer: ${block.fields.reviewer}` : null,
                block.fields["review-at"] ? `review-at: ${block.fields["review-at"]}` : null,
            ].filter(Boolean).join(", ");
            report(`${rel}:${block.line} (${block.heading ?? "no heading"}): ${verb} off ${state}`);
        }
    }
}

if (remaining === 0) report("020-no-review-triad: nothing to do");
else if (!checkOnly) {
    report(
        `020-no-review-triad: ${remaining} file(s) changed. \`status\` was left as it was — ` +
        "carry any review still pending into the pull request or the tracker.",
    );
}

process.exit(checkOnly && remaining > 0 ? 1 : 0);
