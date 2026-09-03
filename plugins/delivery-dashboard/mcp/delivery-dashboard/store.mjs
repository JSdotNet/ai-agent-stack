// Persistence layer for delivery-dashboard runs.
//
// Each run is stored as one JSON file under `<baseDir>/<runId>.json`. `baseDir`
// is resolved by state.mjs to a per-project directory outside the repository,
// so runs survive a session restart without ever showing up in `git status`.
// Reads/writes are simple whole-file JSON round-trips; run counts per project
// are small (tens, not thousands) so this needs no indexing.

import { mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";

function fileFor(baseDir, runId) {
    return path.join(baseDir, `${runId}.json`);
}

export async function ensureDir(baseDir) {
    await mkdir(baseDir, { recursive: true });
}

export async function writeRun(baseDir, run) {
    await ensureDir(baseDir);
    const tmp = fileFor(baseDir, run.id) + ".tmp";
    await writeFile(tmp, JSON.stringify(run, null, 2), "utf8");
    await rm(fileFor(baseDir, run.id), { force: true });
    await writeFile(fileFor(baseDir, run.id), JSON.stringify(run, null, 2), "utf8");
    await rm(tmp, { force: true });
    return run;
}

export async function readRun(baseDir, runId) {
    try {
        const raw = await readFile(fileFor(baseDir, runId), "utf8");
        return JSON.parse(raw);
    } catch (err) {
        if (err && err.code === "ENOENT") return null;
        throw err;
    }
}

export async function listRuns(baseDir) {
    await ensureDir(baseDir);
    const entries = await readdir(baseDir).catch(() => []);
    const runs = [];
    for (const entry of entries) {
        if (!entry.endsWith(".json")) continue;
        try {
            const raw = await readFile(path.join(baseDir, entry), "utf8");
            runs.push(JSON.parse(raw));
        } catch {
            // Skip unreadable/corrupt run files rather than failing the whole list.
        }
    }
    runs.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    return runs;
}

export function newRunId() {
    return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
