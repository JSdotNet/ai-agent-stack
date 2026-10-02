// demo.mjs — the click demos: the HTML contract each `*.demo.html` keeps, and
// the `demo` addresses chapters point into them with.
//
// A demo is not a chapter. It carries no `meta` block and names no page, so
// everything the checker knows about it comes from two places: its name, which
// says which page it belongs to, and its `demo-model` script, which lists every
// screen, anchor, walkthrough, and panel key an address may name. The rules are
// devbook-domain.md's; the address is the contract `resources/demo-address.md`.
//
// Dependency-free ESM against node built-ins. The HTML is scanned with regular
// expressions rather than parsed: a demo is generated from one template, and
// what is checked here is markup that template writes the same way every time.

import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
    CHANGES_ROOT,
    DELTA_FOLDER,
    DEVBOOK_PREFIX,
    changePathParts,
    demoPagePath,
    isDemoPath,
    isPageNamedDemo,
    parseDocument,
    resolveType,
    folderKindForPath,
    slugify,
} from "./metadata.mjs";

/** The size a demo aims under. Past it is a warning and never an error. */
export const DEMO_SIZE_TARGET = 500 * 1024;

/** The one script outside the template's managed region, and the file's own metadata. */
export const DEMO_MODEL_ID = "demo-model";
export const DEMO_META_ID = "demo-meta";

const REGION_BEGIN = /<!--\s*template:begin\b[^>]*?-->/gi;
const REGION_END = /<!--\s*template:end\b[^>]*?-->/gi;

/**
 * A sync reader for demo files under `repoRoot`: `(relPath) => text | null`,
 * cached. Sync so a fingerprint can be taken inside the per-document lint.
 */
export function demoReader(repoRoot) {
    const cache = new Map();
    return (relPath) => {
        if (!cache.has(relPath)) {
            let text = null;
            try {
                text = readFileSync(path.join(repoRoot, relPath), "utf8");
            } catch {
                text = null;
            }
            cache.set(relPath, text);
        }
        return cache.get(relPath);
    };
}

// ── Scanning the file ───────────────────────────────────────────────────────

function attribute(attrs, name) {
    const match = new RegExp(`(?:^|\\s)${name}(?:\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+)))?(?=\\s|/|$)`, "i").exec(attrs);
    if (!match) return null;
    return match[1] === undefined ? "" : match[2] ?? match[3] ?? match[4] ?? "";
}

/** Blank `from`–`to` in `text`, keeping every offset. */
const blank = (text, from, to) => text.slice(0, from) + text.slice(from, to).replace(/[^\n]/g, " ") + text.slice(to);

/** The template's managed regions, as `[start, end]` offsets. */
function managedRegions(html) {
    const begins = [...html.matchAll(REGION_BEGIN)].map((m) => m.index);
    const ends = [...html.matchAll(REGION_END)].map((m) => m.index);
    const regions = [];
    for (const start of begins) {
        const end = ends.find((offset) => offset > start);
        regions.push([start, end ?? html.length]);
    }
    return regions;
}

/**
 * What the checker reads from one demo. `markup` is the file with comments
 * and script bodies blanked, so markup quoted in either is never scanned as
 * an element.
 */
export function parseDemo(html) {
    const regions = managedRegions(html);
    const inRegion = (offset) => regions.some(([start, end]) => offset >= start && offset < end);

    let markup = html;
    for (const m of html.matchAll(/<!--[\s\S]*?-->/g)) markup = blank(markup, m.index, m.index + m[0].length);

    const scripts = [];
    for (const m of markup.matchAll(/<script\b([^>]*)>/gi)) {
        const open = m.index + m[0].length;
        const close = markup.slice(open).search(/<\/script\s*>/i);
        const end = close === -1 ? html.length : open + close;
        scripts.push({
            offset: m.index,
            id: attribute(m[1], "id"),
            type: attribute(m[1], "type"),
            src: attribute(m[1], "src"),
            body: html.slice(open, end),
            managed: inRegion(m.index),
        });
    }
    for (const script of scripts) {
        const open = markup.indexOf(">", script.offset) + 1;
        markup = blank(markup, open, open + script.body.length);
    }

    // Screens are the `section[data-screen]` elements, each spanning to its
    // matching `</section>`; an anchor belongs to the innermost one around it.
    const screens = [];
    const stack = [];
    const tags = [...markup.matchAll(/<(\/?)section\b([^>]*)>/gi)];
    for (const tag of tags) {
        if (tag[1]) {
            const open = stack.pop();
            if (open) open.end = tag.index;
            continue;
        }
        const entry = { attrs: tag[2], start: tag.index, end: markup.length };
        stack.push(entry);
        if (attribute(tag[2], "data-screen") !== null) {
            entry.screen = { id: attribute(tag[2], "id"), start: tag.index, entry };
            screens.push(entry.screen);
        }
    }
    for (const screen of screens) screen.end = screen.entry.end;

    const anchors = [];
    for (const m of markup.matchAll(/<[a-z][\w-]*\b([^>]*\sdata-anchor\b[^>]*)>/gi)) {
        const value = attribute(m[1], "data-anchor");
        if (value === null) continue;
        const around = screens.filter((s) => m.index >= s.start && m.index < s.end);
        const innermost = around.sort((a, b) => b.start - a.start)[0] ?? null;
        anchors.push({ value, screen: innermost?.id ?? null });
    }

    const variants = new Set();
    for (const m of markup.matchAll(/<[a-z][\w-]*\b([^>]*\sdata-variant\b[^>]*)>/gi)) {
        const value = attribute(m[1], "data-variant");
        if (value) variants.add(value);
    }

    const modelScripts = scripts.filter((s) => s.id === DEMO_MODEL_ID);
    let model = null;
    let modelError = null;
    if (!modelScripts.length) modelError = `has no \`<script type="application/json" id="${DEMO_MODEL_ID}">\``;
    else if (modelScripts.length > 1) modelError = `has ${modelScripts.length} \`${DEMO_MODEL_ID}\` scripts — a demo has one`;
    else {
        try {
            model = normalizeModel(JSON.parse(modelScripts[0].body));
        } catch (error) {
            modelError = `has a \`${DEMO_MODEL_ID}\` that is not valid JSON: ${error.message}`;
        }
    }

    return {
        bytes: Buffer.byteLength(html, "utf8"),
        regions,
        scripts,
        screens: screens.map(({ id }) => id),
        anchors,
        variants,
        model,
        modelError,
        fetches: networkFetches(html),
    };
}

// What a demo may not do: load anything over the network. Every style,
// script, and image is inline, so a URL in a resource attribute, a CSS
// `url()` or `@import`, or a script API that reaches out is a file that does
// not open with the network off.
const REMOTE = /^\s*(?:https?:)?\/\//i;
const RESOURCE_ATTRIBUTES = /<(script|link|img|iframe|source|video|audio|embed|object|track|input|image|use)\b([^>]*)>/gi;

function networkFetches(html) {
    const found = new Set();
    for (const m of html.matchAll(RESOURCE_ATTRIBUTES)) {
        for (const name of ["src", "href", "data", "poster", "xlink:href"]) {
            const value = attribute(m[2], name);
            if (value && REMOTE.test(value)) found.add(`<${m[1].toLowerCase()} ${name}="${value}">`);
        }
        const srcset = attribute(m[2], "srcset");
        if (srcset && srcset.split(",").some((part) => REMOTE.test(part))) found.add(`<${m[1].toLowerCase()} srcset="${srcset}">`);
    }
    for (const m of html.matchAll(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi)) {
        if (REMOTE.test(m[2])) found.add(`url(${m[2]})`);
    }
    for (const m of html.matchAll(/@import\s+(['"])([^'"]*)\1/gi)) {
        if (REMOTE.test(m[2])) found.add(`@import "${m[2]}"`);
    }
    for (const m of html.matchAll(/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\s*\(/g)) {
        found.add(`${m[1]}()`);
    }
    for (const m of html.matchAll(/\bimport\s*\(\s*(['"`])([^'"`]*)\1/g)) {
        if (REMOTE.test(m[2])) found.add(`import("${m[2]}")`);
    }
    return [...found];
}

// ── demo-model ──────────────────────────────────────────────────────────────

const keyOf = (entry) =>
    typeof entry === "string" ? entry : entry && typeof entry === "object" ? entry.id ?? entry.key ?? entry.anchor ?? entry.name ?? null : null;

/**
 * `demo-model`, read into the sets an address resolves against. The model is
 * the template's to shape, so each list is read in the shapes it may take: a
 * list of ids, or of objects carrying `id` (`key` for a panel switch); anchors
 * as one list, per screen on each screen entry, or as `{ screen: [...] }`.
 * `repeated` collects every id the model lists twice in one place.
 */
export function normalizeModel(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("the model is not a JSON object");
    const repeated = [];
    const listInto = (list, where, into = new Set()) => {
        for (const entry of Array.isArray(list) ? list : []) {
            const id = keyOf(entry);
            if (id == null) continue;
            if (into.has(id)) repeated.push(`${where} "${id}"`);
            into.add(String(id));
        }
        return into;
    };

    const screens = new Map();
    for (const entry of Array.isArray(raw.screens) ? raw.screens : []) {
        const id = keyOf(entry);
        if (id == null) continue;
        if (screens.has(id)) repeated.push(`screen "${id}"`);
        const own = entry && typeof entry === "object" && Array.isArray(entry.anchors) ? listInto(entry.anchors, `anchor in screen "${id}"`) : null;
        screens.set(String(id), own);
    }

    const anchors = new Set();
    if (Array.isArray(raw.anchors)) {
        for (const entry of raw.anchors) {
            const id = keyOf(entry);
            const screen = entry && typeof entry === "object" ? entry.screen : null;
            if (id == null) continue;
            if (screen != null) {
                const own = screens.get(screen) ?? new Set();
                if (own.has(id)) repeated.push(`anchor "${id}" in screen "${screen}"`);
                own.add(String(id));
                screens.set(String(screen), own);
            } else {
                if (anchors.has(id)) repeated.push(`anchor "${id}"`);
                anchors.add(String(id));
            }
        }
    } else if (raw.anchors && typeof raw.anchors === "object") {
        for (const [screen, list] of Object.entries(raw.anchors)) {
            screens.set(screen, listInto(list, `anchor in screen "${screen}"`, screens.get(screen) ?? new Set()));
        }
    }

    const walkthroughs = new Map();
    const walkthroughEntries = Array.isArray(raw.walkthroughs)
        ? raw.walkthroughs.map((entry) => [keyOf(entry), entry])
        : raw.walkthroughs && typeof raw.walkthroughs === "object"
          ? Object.entries(raw.walkthroughs)
          : [];
    for (const [id, entry] of walkthroughEntries) {
        if (id == null) continue;
        if (walkthroughs.has(id)) repeated.push(`walkthrough "${id}"`);
        const steps = Array.isArray(entry) ? entry : Array.isArray(entry?.steps) ? entry.steps : [];
        walkthroughs.set(String(id), steps);
    }

    return {
        screens,
        anchors,
        walkthroughs,
        variants: listInto(raw.variants, "variant"),
        roles: listInto(raw.roles ?? raw.actors, "role"),
        flags: listInto(raw.flags, "flag"),
        viewports: listInto(raw.viewports, "viewport"),
        repeated,
    };
}

/** Whether `anchor` is one the model lists for `screen`. */
function modelHasAnchor(model, screen, anchor) {
    const own = model.screens.get(screen);
    return model.anchors.has(anchor) || Boolean(own && own.has(anchor));
}

/** A walkthrough step, read as `{ screen, anchor }`: an address string or an object. */
function stepTarget(step) {
    if (typeof step === "string") {
        const [screen, anchor] = step.replace(/^#/, "").split("?")[0].split("/");
        return { screen: screen || null, anchor: anchor || null };
    }
    if (step && typeof step === "object") {
        if (typeof step.address === "string") return stepTarget(step.address);
        if (typeof step.goto === "string") return stepTarget(step.goto);
        return { screen: step.screen ?? null, anchor: step.anchor ?? null };
    }
    return { screen: null, anchor: null };
}

/**
 * Why the part of an address after `#` does not resolve in `model`, or null
 * when it does — per `resources/demo-address.md`. An empty fragment is the demo
 * as a whole.
 */
export function addressProblem(fragment, model) {
    if (!fragment) return null;
    const [location, query = ""] = fragment.split("?");
    const parts = location.split("/");
    if (parts[0] === "walkthrough") {
        const [, id, step, ...rest] = parts;
        if (!id || rest.length) return `is not a walkthrough address — write \`#walkthrough/<id>[/<step>]\``;
        if (!model.walkthroughs.has(id)) return `names walkthrough "${id}", which \`demo-model\` does not list`;
        if (step !== undefined) {
            const count = model.walkthroughs.get(id).length;
            if (!/^[1-9]\d*$/.test(step) || Number(step) > count) {
                return `names step ${step} of walkthrough "${id}", which has ${count} step(s) counted from 1`;
            }
        }
    } else {
        const [screen, anchor, ...rest] = parts;
        if (rest.length) return `has more than \`<screen>/<anchor>\` before its query`;
        if (!model.screens.has(screen)) return `names screen "${screen}", which \`demo-model\` does not list`;
        if (anchor !== undefined && !modelHasAnchor(model, screen, anchor)) {
            return `names anchor "${anchor}" on screen "${screen}", which \`demo-model\` does not list`;
        }
    }
    for (const pair of query ? query.split("&") : []) {
        const [name, value = ""] = pair.split("=");
        const lists = { role: ["role", model.roles], flags: ["flag", model.flags], vp: ["viewport", model.viewports] }[name];
        if (!lists) return `has query parameter "${name}" — only \`role\`, \`flags\`, and \`vp\` are part of an address`;
        const keys = name === "flags" ? value.split(",").filter(Boolean) : [value];
        for (const key of keys) {
            if (!lists[1].has(key)) return `names ${lists[0]} "${key}", which \`demo-model\` does not list`;
        }
    }
    return null;
}

// ── One file ────────────────────────────────────────────────────────────────

/** Whether a demo's landing place is under `domain/`, the change folder's copy included. */
function landsInDomain(relPath) {
    const target = changePathParts(relPath)?.target ?? relPath;
    return target.startsWith(`${DEVBOOK_PREFIX}domain/`);
}

/** Every rule one demo keeps on its own, as `{ severity, message }` with the path first. */
export function demoFileIssues(relPath, html) {
    const demo = parseDemo(html);
    const issues = [];
    const error = (message) => issues.push({ severity: "error", message: `${relPath} ${message}` });

    for (const script of demo.scripts) {
        if (script.managed || script.id === DEMO_MODEL_ID || script.id === DEMO_META_ID) continue;
        error(
            `has a \`<script${script.id ? ` id="${script.id}"` : ""}>\` outside the template's managed region — ` +
                `the only scripts a demo adds are \`${DEMO_MODEL_ID}\` and its \`${DEMO_META_ID}\`; behaviour comes from the template.`
        );
    }
    for (const fetch of demo.fetches) {
        error(`fetches from the network: ${fetch} — a demo is one file that opens with the network off, every style, script, and image inline.`);
    }
    // The file knows its question and nothing about its lifecycle: `demo-meta`
    // holds `question` alone, per devbook-chapter-metadata.md.
    const metaScript = demo.scripts.find((s) => s.id === DEMO_META_ID);
    if (metaScript) {
        let meta;
        try {
            meta = JSON.parse(metaScript.body);
        } catch (e) {
            error(`has a \`${DEMO_META_ID}\` that is not valid JSON: ${e.message}`);
        }
        if (meta !== undefined) {
            const extra = meta && typeof meta === "object" && !Array.isArray(meta) ? Object.keys(meta).filter((key) => key !== "question") : [];
            if (typeof meta?.question !== "string" || !meta.question.trim()) {
                error(`has a \`${DEMO_META_ID}\` with no \`question\` — the one question the demo was prototyped to answer.`);
            }
            if (extra.length) {
                error(`has \`${extra.join("`, `")}\` in its \`${DEMO_META_ID}\`, which holds \`question\` and nothing else — the file names no stage, status, verdict, or page; where it sits says which it is.`);
            }
        }
    }
    if (demo.bytes > DEMO_SIZE_TARGET) {
        issues.push({
            severity: "warning",
            message: `${relPath} is ${Math.round(demo.bytes / 1024)} KB, past the ${DEMO_SIZE_TARGET / 1024} KB target — inline SVG, shared markup, or a split into page demos brings it down. A demo may exceed it.`,
        });
    }

    if (demo.modelError) {
        error(`${demo.modelError} — every screen, anchor, and walkthrough an address names is listed there.`);
        return issues;
    }
    const { model } = demo;

    if (landsInDomain(relPath)) {
        const variants = new Set([...demo.variants, ...model.variants]);
        if (variants.size > 1) {
            error(`carries ${variants.size} variants (${[...variants].join(", ")}) — a demo under domain/ carries exactly one, the agreed one; trim the rest before it lands.`);
        }
    }

    for (const entry of model.repeated) error(`lists ${entry} twice in \`${DEMO_MODEL_ID}\`.`);

    const seenScreens = new Set();
    for (const id of demo.screens) {
        if (!id) {
            error(`has a \`section[data-screen]\` with no \`id\` — a screen is addressed by its id.`);
            continue;
        }
        if (seenScreens.has(id)) error(`repeats screen id "${id}" — an address must name one screen.`);
        seenScreens.add(id);
        if (!model.screens.has(id)) error(`has screen "${id}", which \`${DEMO_MODEL_ID}\` does not list.`);
    }

    const seenAnchors = new Set();
    for (const { value, screen } of demo.anchors) {
        const key = `${screen ?? ""}/${value}`;
        if (seenAnchors.has(key)) {
            error(`repeats \`data-anchor\` "${value}"${screen ? ` on screen "${screen}"` : " outside every screen"} — an address must name one element.`);
        }
        seenAnchors.add(key);
        if (!modelHasAnchor(model, screen, value)) {
            error(`has \`data-anchor\` "${value}"${screen ? ` on screen "${screen}"` : ""}, which \`${DEMO_MODEL_ID}\` does not list.`);
        }
    }

    for (const [id, steps] of model.walkthroughs) {
        steps.forEach((step, index) => {
            const { screen, anchor } = stepTarget(step);
            const at = `walkthrough "${id}" step ${index + 1}`;
            if (!screen || !model.screens.has(screen)) {
                error(`has ${at} on screen "${screen ?? "(none)"}", which \`${DEMO_MODEL_ID}\` does not list.`);
            } else if (anchor && !modelHasAnchor(model, screen, anchor)) {
                error(`has ${at} on anchor "${anchor}" of screen "${screen}", which \`${DEMO_MODEL_ID}\` does not list.`);
            }
        });
    }
    return issues;
}

// ── The corpus ──────────────────────────────────────────────────────────────

async function demosUnder(repoRoot, rel) {
    const out = [];
    let entries;
    try {
        entries = await readdir(path.join(repoRoot, rel), { withFileTypes: true });
    } catch {
        return out;
    }
    for (const entry of entries) {
        const child = `${rel}/${entry.name}`;
        if (entry.isDirectory()) {
            if (entry.name !== "_meta") out.push(...(await demosUnder(repoRoot, child)));
        } else if (entry.isFile() && isDemoPath(entry.name)) out.push(child);
    }
    return out;
}

async function changeNames(repoRoot) {
    try {
        const entries = await readdir(path.join(repoRoot, CHANGES_ROOT), { withFileTypes: true });
        return entries.filter((e) => e.isDirectory() && e.name !== "archive").map((e) => e.name).sort();
    } catch {
        return [];
    }
}

/** Every demo in the adopted folders and in each open change's `devbook-delta/`. */
export async function collectDemos(repoRoot, folders) {
    const found = [];
    for (const folder of folders) found.push(...(await demosUnder(repoRoot, folder)));
    for (const name of await changeNames(repoRoot)) {
        found.push(...(await demosUnder(repoRoot, `${CHANGES_ROOT}/${name}/${DELTA_FOLDER}`)));
    }
    return found.sort();
}

/** The `#### Scenario:` slugs one level under each requirement chapter, keyed by `<path>#<slug>`. */
export function requirementScenarios(relPath, markdown) {
    const folder = folderKindForPath(relPath);
    const { chapters } = parseDocument(markdown);
    const result = new Map();
    chapters.forEach((chapter, index) => {
        if (!chapter.meta || resolveType(folder, chapter.meta) !== "requirement") return;
        const slugs = new Set();
        for (let i = index + 1; i < chapters.length && chapters[i].level > chapter.level; i++) {
            if (chapters[i].level !== chapter.level + 1 || !/^Scenario:/i.test(chapters[i].text)) continue;
            slugs.add(chapters[i].slug);
            slugs.add(slugify(chapters[i].text.replace(/^Scenario:\s*/i, "")));
        }
        result.set(`${relPath}#${chapter.slug}`, slugs);
    });
    return result;
}

/**
 * Every demo problem across the corpus: each file's own rules, a page-named
 * demo without its page, a demo nothing names, and every `demo` address — on
 * a chapter, a proposal, or a change's `solution.md` — that does not resolve.
 *
 * `holders` is every block that carries a `demo` field, as
 * `{ id, path, refs, scenarios }`: `scenarios` is the set of `#### Scenario:`
 * slugs under it when it is a requirement, and null otherwise. A holder
 * inside a change resolves a path to the change's own copy of the demo first,
 * since that is the demo the change lands.
 */
export async function demoProblems(repoRoot, folders, holders) {
    const problems = [];
    const read = demoReader(repoRoot);
    const demos = await collectDemos(repoRoot, folders);

    // A change's `solution.md` is no chapter and is not indexed, but its file
    // block may name the demo the approach is shown in.
    for (const name of await changeNames(repoRoot)) {
        const relPath = `${CHANGES_ROOT}/${name}/solution.md`;
        let markdown;
        try {
            markdown = await readFile(path.join(repoRoot, relPath), "utf8");
        } catch {
            continue;
        }
        const file = parseDocument(markdown).chapters.find((c) => c.level === 1);
        const refs = file?.meta?.demo;
        if (refs != null) holders.push({ id: relPath, path: relPath, refs: Array.isArray(refs) ? refs : [refs], scenarios: null });
    }

    for (const relPath of demos) {
        for (const issue of demoFileIssues(relPath, read(relPath) ?? "")) problems.push({ ...issue, path: relPath });
    }

    // Where a reference made from `holderPath` lands: the change's own copy of
    // the demo when the holder is in a change that carries one, else the file.
    const resolveFile = (holderPath, target) => {
        const change = changePathParts(holderPath);
        if (change && target.startsWith(DEVBOOK_PREFIX)) {
            const copy = `${CHANGES_ROOT}/${change.name}/${DELTA_FOLDER}/${target.slice(DEVBOOK_PREFIX.length)}`;
            if (read(copy) != null) return copy;
        }
        return read(target) != null ? target : null;
    };

    const named = new Set();
    for (const holder of holders) {
        for (const ref of holder.refs) {
            const raw = String(ref);
            const hash = raw.indexOf("#");
            const target = hash === -1 ? raw : raw.slice(0, hash);
            const fragment = hash === -1 ? "" : raw.slice(hash + 1);
            const at = `${holder.id} has \`demo\` "${raw}"`;
            if (!isDemoPath(target)) {
                problems.push({ severity: "error", path: holder.path, message: `${at}, which does not name a demo — the path ends in \`.demo.html\`, or is a context's \`demo.html\`.` });
                continue;
            }
            const file = resolveFile(holder.path, target);
            if (!file) {
                problems.push({ severity: "error", path: holder.path, message: `${at}, but ${target} does not exist.` });
                continue;
            }
            named.add(file);
            if (file !== target) named.add(target);
            const demo = parseDemo(read(file));
            if (!demo.model) continue; // the file's own lint reports the missing model
            const why = addressProblem(fragment, demo.model);
            if (why) {
                problems.push({ severity: "error", path: holder.path, message: `${at}, which does not resolve in ${file}: the address ${why}.` });
                continue;
            }
            if (holder.scenarios && fragment.startsWith("walkthrough/")) {
                const id = fragment.split("?")[0].split("/")[1];
                if (!holder.scenarios.has(id)) {
                    problems.push({
                        severity: "error",
                        path: holder.path,
                        message: `${at}, whose walkthrough "${id}" matches no \`#### Scenario:\` under the requirement — a requirement's walkthrough plays one of its own scenarios and carries that scenario's slug.`,
                    });
                }
            }
        }
    }

    // A demo in a change has its page when the change carries it or the
    // devbook already holds it at the path the demo lands beside.
    const pageExists = (candidate) => {
        if (read(candidate) != null) return true;
        const target = changePathParts(candidate)?.target;
        return Boolean(target && read(target) != null);
    };
    for (const relPath of demos) {
        const page = demoPagePath(relPath);
        if (pageExists(page)) continue;
        const shown = changePathParts(page)?.target ?? page;
        if (isPageNamedDemo(relPath)) {
            problems.push({
                severity: "error",
                path: relPath,
                message: `${relPath} is named for ${shown}, which does not exist — a page-named demo sits beside its page and moves with it on a split.`,
            });
        } else if (!named.has(relPath) && !named.has(changePathParts(relPath)?.target)) {
            problems.push({
                severity: "error",
                path: relPath,
                message: `${relPath} has no page beside it and no chapter's \`demo\` field names it — a demo not named for a page belongs to the chapters that name it, so name it from one or remove it.`,
            });
        }
    }
    return problems;
}
