// demo.mjs — the rules a click demo's own file must meet, read from its HTML
// alone: what `devbook-domain.md` and `devbook-chapter-metadata.md` say a
// `*.demo.html` is. Nothing here resolves a `demo` field or pairs a demo with
// its page; those read the rest of the repository and belong to the graph
// build. `delta.mjs --check` runs these on every demo a change carries.
//
// A demo is one HTML document built on the template: a managed region between
// `<!-- template:begin hash=… -->` and `<!-- template:end -->`, the template's own; a
// `demo-model` JSON script the panel reads; a `demo-meta` JSON script holding
// `question` and nothing else; every style, script, and image inline.

import { DEVBOOK_PREFIX } from "./metadata.mjs";

/** The size a demo aims under. Past it is a warning, never an error. */
export const DEMO_SIZE_TARGET = 500 * 1024;

const DEMO_PATH = new RegExp(`^${DEVBOOK_PREFIX.replace(/\./g, "\\.")}domain/[^/]+/(?:[^/]+\\.)?demo\\.html$`);

/** Whether a devbook path is where a demo lives: `domain/<context>/demo.html` or `<page>.demo.html`. */
export const isDemoPath = (relPath) => DEMO_PATH.test(String(relPath).replace(/\\/g, "/"));

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const attr = (attrs, name) => new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(attrs)?.slice(1).find((v) => v !== undefined) ?? null;

// A reference is fetched unless it stays in the file: a `data:` URI or a fragment.
const LOCAL = /^\s*(?:data:|#|$)/i;
const FETCHING_TAGS = /<(script|img|iframe|frame|source|video|audio|embed|track|input|link|object|use|image)\b([^>]*)>/gi;
const CSS_URL = /url\(\s*(["']?)([^"')]*)\1\s*\)/gi;
const NETWORK_CALLS = /\b(?:fetch\s*\(|XMLHttpRequest\b|WebSocket\s*\(|EventSource\s*\(|import\s*\(|navigator\.sendBeacon\s*\()/;

function jsonScript(html, id) {
    for (const [, attrs, body] of html.matchAll(SCRIPT)) {
        if (attr(attrs, "id") !== id) continue;
        try {
            return { found: true, value: JSON.parse(body) };
        } catch (error) {
            return { found: true, error: error.message };
        }
    }
    return { found: false };
}

/**
 * The problems in one demo file. `relPath` is where it lands under `.devbook/`
 * and is used only to name it. Each issue is `{ severity, message }`.
 */
export function demoFileIssues(relPath, html) {
    const issues = [];
    const error = (message) => issues.push({ severity: "error", message });

    if (!isDemoPath(relPath)) {
        error(`is not where a demo lives — a demo is \`demo.html\` or \`<page>.demo.html\` directly in a \`domain/<context>/\` folder.`);
    }
    if (!/<html[\s>]/i.test(html)) error(`is not an HTML document — a demo is one file with its \`<html>\` element.`);

    // The markers are HTML comments; the template's own script may name them in text.
    const begins = [...html.matchAll(/<!--\s*template:begin\s+hash=\S+\s*-->/g)];
    const ends = [...html.matchAll(/<!--\s*template:end\s*-->/g)];
    const begin = begins[0]?.index ?? -1;
    const end = ends[0]?.index ?? -1;
    const managed = begin !== -1 && end > begin;
    if (!managed) {
        error(`has no template managed region — a demo is built on the repository's demo template, its region between \`<!-- template:begin hash=… -->\` and \`<!-- template:end -->\` kept as the template wrote it.`);
    } else if (begins.length > 1 || ends.length > 1) {
        error(`has more than one template managed region — the template is in a demo once.`);
    }
    const outside = managed ? html.slice(0, begin) + html.slice(end) : html;
    for (const [, attrs] of outside.matchAll(SCRIPT)) {
        const id = attr(attrs, "id");
        if (id === "demo-model" || id === "demo-meta") continue;
        error(`carries a \`<script${id ? ` id="${id}"` : ""}>\` outside the template's managed region — only \`demo-model\` and \`demo-meta\` sit outside it.`);
    }

    const fetched = new Set();
    for (const [, tag, attrs] of html.matchAll(FETCHING_TAGS)) {
        for (const name of ["src", "href", "xlink:href", "data", "poster", "srcset"]) {
            const value = attr(attrs, name.replace(":", "\\:"));
            if (value !== null && !LOCAL.test(value)) fetched.add(`<${tag.toLowerCase()} ${name}="${value}">`);
        }
    }
    for (const [, , value] of html.matchAll(CSS_URL)) if (!LOCAL.test(value)) fetched.add(`url(${value})`);
    if (/@import\b/i.test(html)) fetched.add("@import");
    for (const [, , body] of html.matchAll(SCRIPT)) {
        const call = NETWORK_CALLS.exec(body);
        if (call) fetched.add(call[0].replace(/\s*\($/, "()"));
    }
    for (const what of fetched) error(`fetches ${what} — a demo is self-contained, every style, script, and image inline and nothing fetched.`);

    const model = jsonScript(html, "demo-model");
    if (!model.found) error(`has no \`<script type="application/json" id="demo-model">\` — every address into the demo resolves against it.`);
    else if (model.error) error(`has a \`demo-model\` that is not JSON: ${model.error}`);

    const meta = jsonScript(html, "demo-meta");
    if (!meta.found) {
        error(`has no \`<script type="application/json" id="demo-meta">\` holding the \`question\` it was prototyped to answer.`);
    } else if (meta.error) {
        error(`has a \`demo-meta\` that is not JSON: ${meta.error}`);
    } else if (!meta.value || typeof meta.value !== "object" || Array.isArray(meta.value) || typeof meta.value.question !== "string" || !meta.value.question.trim()) {
        error(`has a \`demo-meta\` with no \`question\` — the one question the demo was prototyped to answer.`);
    } else {
        const extra = Object.keys(meta.value).filter((key) => key !== "question");
        if (extra.length) {
            error(`has \`${extra.join("`, `")}\` in its \`demo-meta\`, which holds \`question\` and nothing else — the file names no stage, status, verdict, or page; where it sits says which it is.`);
        }
    }

    const size = Buffer.byteLength(html, "utf8");
    if (size > DEMO_SIZE_TARGET) {
        issues.push({ severity: "warning", message: `is ${Math.round(size / 1024)} KB, over the 500 KB a demo aims at — inline SVG over bitmaps, shared markup, or a split into page demos brings it down.` });
    }
    return issues;
}
