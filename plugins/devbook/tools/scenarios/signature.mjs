// signature.mjs — the scenario page signature: what a derived spec records in
// its header and a run in `run.json`, so a reader can tell a run that proves
// today's page from one that proves an older text.
//
// The canonical text, one line each, joined by "\n" with no trailing newline:
//
//   start: <start>                     only when set
//   actor: <entry>, <entry>            only when set, in written order
//   data: <name>@<hash>, …             only when set; <hash> is the data set's, below
//   profile: <name>                    always; absent reads as `default`
//   flags: <entry>, …                  only when set
//   settings: <entry>, …               only when set
//   shot: <label>                      a screenshot point above the first part
//   part: <heading text>               then, in document order inside the part:
//   step: <Keyword> <text>               each step, keyword and text
//   shot: <label>                        each screenshot point
//
// Every value has its whitespace collapsed to single spaces. Captions, the
// lead, and prose between steps do not count: changing them changes no
// behaviour. The signature is sha256 over the UTF-8 text, first 8 hex.
// `scenario-page.vector.json` beside this file is the shared vector every
// implementation — this one, spec-manager's, Backlog's — is tested against.

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { collapse } from "./parse.mjs";

/** What a data set hashes to when its folder does not exist. */
export const MISSING_DATA = "missing";

/**
 * The canonical text of a parsed page. `dataHash(name)` gives each data set's
 * content hash; without it every data set reads as `missing`.
 */
export function canonicalText(page, dataHash = () => MISSING_DATA) {
    const setup = page.setup ?? {};
    const lines = [];
    const list = (key, values) => {
        if (values?.length) lines.push(`${key}: ${values.map(collapse).join(", ")}`);
    };
    if (setup.start) lines.push(`start: ${collapse(setup.start)}`);
    list("actor", setup.actor);
    list("data", (setup.data ?? []).map((name) => `${collapse(name)}@${dataHash(collapse(name))}`));
    lines.push(`profile: ${collapse(setup.profile ?? "default")}`);
    list("flags", setup.flags);
    list("settings", setup.settings);

    for (const shot of page.shots.filter((s) => s.part === null)) lines.push(`shot: ${shot.label}`);
    for (const part of page.parts) {
        lines.push(`part: ${collapse(part.title)}`);
        const entries = [
            ...part.steps.map((step) => ({ line: step.line, text: `step: ${collapse(step.keyword ? `${step.keyword} ${step.text}` : step.text)}` })),
            ...part.shots.map((shot) => ({ line: shot.line, text: `shot: ${shot.label}` })),
        ].sort((a, b) => a.line - b.line);
        for (const entry of entries) lines.push(entry.text);
    }
    return lines.join("\n");
}

/** The first 8 hex of sha256 over a string. */
export function shortHash(text) {
    return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 8);
}

/** A parsed page's signature. */
export function signatureOf(page, dataHash) {
    return shortHash(canonicalText(page, dataHash));
}

/**
 * A data set's content hash, from `{ relativePath: content }`: for each file in
 * sorted POSIX path order, the path, a newline, the content, and a newline,
 * through sha256, first 8 hex. Text content has CRLF read as LF, so a
 * checkout's line endings never change it; content holding a NUL byte is
 * hashed as the bytes it is.
 */
export function hashFiles(files) {
    const hash = createHash("sha256");
    for (const rel of Object.keys(files).sort()) {
        const content = files[rel];
        const bytes = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
        hash.update(`${rel}\n`, "utf8");
        hash.update(bytes.includes(0) ? bytes : Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8"));
        hash.update("\n", "utf8");
    }
    return hash.digest("hex").slice(0, 8);
}

/** A data set folder's hash per `hashFiles`, or `missing` when the folder does not exist. */
export async function hashDataSet(folder) {
    const files = {};
    async function walk(rel) {
        const entries = await readdir(path.join(folder, rel), { withFileTypes: true });
        for (const entry of entries) {
            const child = rel ? `${rel}/${entry.name}` : entry.name;
            if (entry.isDirectory()) await walk(child);
            else if (entry.isFile()) files[child] = await readFile(path.join(folder, child));
        }
    }
    try {
        await walk("");
    } catch {
        return MISSING_DATA;
    }
    return hashFiles(files);
}

/**
 * A page's signature with its data sets hashed from
 * `<repoRoot>/<scenarioFolder>/data/<name>/`.
 */
export async function pageSignature(page, repoRoot, scenarioFolder) {
    const hashes = new Map();
    for (const name of page.setup?.data ?? []) {
        hashes.set(collapse(name), await hashDataSet(path.join(repoRoot, scenarioFolder, "data", collapse(name))));
    }
    return signatureOf(page, (name) => hashes.get(name) ?? MISSING_DATA);
}
