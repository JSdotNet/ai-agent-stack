// Persistence layer for delivery-surface-collector runs.
//
// Each run is stored as one JSON file under `<baseDir>/<runId>.json`. `baseDir`
// is resolved by state.mjs to a per-project directory outside the repository,
// so runs survive a session restart without ever showing up in `git status`.
// Reads/writes are simple whole-file JSON round-trips; run counts per project
// are small (tens, not thousands) so this needs no indexing.
//
// Every session on a checkout starts its own server, and they all share this directory, so
// several processes write the same run files. writeFileAtomic keeps every single write whole;
// withRunFileLock keeps a read-modify-write from losing another process's update.

import { mkdir, open, readdir, readFile, writeFile, rm, rename, stat } from "node:fs/promises";
import path from "node:path";

function fileFor(baseDir, runId) {
    return path.join(baseDir, `${runId}.json`);
}

export async function ensureDir(baseDir) {
    await mkdir(baseDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Windows refuses a rename over a file another process has open, for as long as it is open,
// and an exclusive create of a file another process has deleted but not yet closed.
const BUSY = new Set(["EPERM", "EACCES", "EBUSY"]);

// Write to a temp file of this write's own, in the same folder, then rename it over the
// target. The temp name is unique per write: a shared one let two writers truncate and fill
// the same file from offset 0, so a shorter body kept the tail of a longer one and the
// rename published the mix. The rename is what keeps a reader from ever seeing a partial
// file, or none.
export async function writeFileAtomic(file, text) {
    const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2, 10)}.tmp`;
    try {
        await writeFile(tmp, text, "utf8");
    } catch (err) {
        await rm(tmp, { force: true });
        throw err;
    }
    for (let attempt = 0; ; attempt++) {
        try {
            await rename(tmp, file);
            return;
        } catch (err) {
            if (!BUSY.has(err && err.code) || attempt >= 40) {
                await rm(tmp, { force: true });
                throw err;
            }
            await sleep(5 + attempt * 5);
        }
    }
}

export async function writeRun(baseDir, run) {
    await ensureDir(baseDir);
    await writeFileAtomic(fileFor(baseDir, run.id), JSON.stringify(run, null, 2));
    return run;
}

// A lock older than this belongs to a process that died holding it, and is broken. No
// critical section here comes near it.
const LOCK_STALE_MS = 15000;

// Run fn with an exclusive, cross-process hold on one run: a `<runId>.json.lock` file created
// with O_EXCL. fn should re-read the run, change it, and write it — and do nothing slow,
// since every other writer of that run waits on it.
export async function withRunFileLock(baseDir, runId, fn) {
    await ensureDir(baseDir);
    const lock = `${fileFor(baseDir, runId)}.lock`;
    const started = Date.now();
    for (let attempt = 0; ; attempt++) {
        try {
            const handle = await open(lock, "wx");
            await handle.writeFile(`${process.pid}\n`);
            await handle.close();
            break;
        } catch (err) {
            const busy = err && BUSY.has(err.code) && Date.now() - started < LOCK_STALE_MS;
            if (!err || (err.code !== "EEXIST" && !busy)) throw err;
        }
        try {
            if (Date.now() - (await stat(lock)).mtimeMs > LOCK_STALE_MS) await rm(lock, { force: true });
        } catch {
            // Released between the open and the stat: try again.
        }
        await sleep(Math.min(5 + attempt * 2, 25));
    }
    try {
        return await fn();
    } finally {
        await rm(lock, { force: true });
    }
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
