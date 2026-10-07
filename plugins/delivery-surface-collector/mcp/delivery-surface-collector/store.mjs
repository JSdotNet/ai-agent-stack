// Persistence layer for delivery-surface-collector runs.
//
// Each run is stored as one JSON file under `<baseDir>/<runId>.json`. `baseDir`
// is resolved by state.mjs to a per-project directory outside the repository,
// so runs survive a session restart without ever showing up in `git status`.
// Reads/writes are simple whole-file JSON round-trips; run counts per project
// are small (tens, not thousands) so this needs no indexing.

import { mkdir, readdir, readFile, writeFile, rm, rename } from "node:fs/promises";
import path from "node:path";

function fileFor(baseDir, runId) {
    return path.join(baseDir, `${runId}.json`);
}

export async function ensureDir(baseDir) {
    await mkdir(baseDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Windows refuses a rename over a file another process has open, for as long as it is open.
const RENAME_BUSY = new Set(["EPERM", "EACCES", "EBUSY"]);

export async function writeRun(baseDir, run) {
    await ensureDir(baseDir);
    // Write beside, then rename over: a reader never finds the file missing between a
    // delete and a rewrite, which is what made a run vanish under a concurrent get_run. The
    // temp name is this write's own: a shared one lets two overlapping writes mix their bodies.
    const file = fileFor(baseDir, run.id);
    const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2, 10)}.tmp`;
    try {
        await writeFile(tmp, JSON.stringify(run, null, 2), "utf8");
    } catch (err) {
        await rm(tmp, { force: true });
        throw err;
    }
    for (let attempt = 0; ; attempt++) {
        try {
            await rename(tmp, file);
            return run;
        } catch (err) {
            if (!RENAME_BUSY.has(err && err.code) || attempt >= 40) {
                await rm(tmp, { force: true });
                throw err;
            }
            await sleep(5 + attempt * 5);
        }
    }
}

// While a rename replaces the record, Windows can answer a reader ENOENT or a sharing
// violation for a moment. Retry those a few times before believing them. ENOENT is retried
// on Windows only: elsewhere the rename is atomic, so a missing run stays an immediate null.
const READ_BUSY = new Set(["EPERM", "EACCES", "EBUSY"]);
const READ_RETRY_MS = [5, 10, 20, 20];

async function readRunFile(file) {
    for (let attempt = 0; ; attempt++) {
        try {
            return JSON.parse(await readFile(file, "utf8"));
        } catch (err) {
            const code = err && err.code;
            const transient = READ_BUSY.has(code) || (code === "ENOENT" && process.platform === "win32");
            if (!transient || attempt >= READ_RETRY_MS.length) {
                if (code === "ENOENT") return null;
                throw err;
            }
            await sleep(READ_RETRY_MS[attempt]);
        }
    }
}

export async function readRun(baseDir, runId) {
    return readRunFile(fileFor(baseDir, runId));
}

export async function listRuns(baseDir) {
    await ensureDir(baseDir);
    const entries = await readdir(baseDir).catch(() => []);
    // A run mid-rename may show only as its temp file, so that names it too.
    const files = new Set();
    for (const entry of entries) {
        const match = /^(.+\.json)(\.(.+\.)?tmp)?$/.exec(entry);
        if (match) files.add(match[1]);
    }
    const runs = [];
    for (const file of files) {
        try {
            const run = await readRunFile(path.join(baseDir, file));
            if (run) runs.push(run);
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
