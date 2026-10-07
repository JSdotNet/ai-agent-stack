// Check that a run file and active.json are always whole JSON, however their writers overlap.
//
// Every session on a checkout starts its own MCP server, and they all keep runs in the one
// per-checkout state directory, so several server processes write the same files. With one
// shared temp name per run, two writers truncated and filled the same temp file from offset 0,
// and the rename published a complete object followed by the tail of a longer, older one.
// This drives writeRun, withRunFileLock, and writeActive from child processes the way those
// servers do.
//
//   node dev/atomic-write-test.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as store from "../store.mjs";
import { writeActive } from "../state.mjs";

const RUN_ID = "run-atomic-test";
const SELF = fileURLToPath(import.meta.url);

// A long and a short body for the same run, so an overlap that mixes them leaves a tail.
function body(i, long) {
    return { id: RUN_ID, writer: i, padding: long ? "x".repeat(20000) : "", counter: 0 };
}

// Child modes: `write <dir> <i> <n>` rewrites the run n times, alternating long and short;
// `increment <dir> <n>` adds one to the counter n times under the cross-process lock;
// `active <i> <n>` rewrites active.json in DELIVERY_SURFACE_COLLECTOR_STATE_DIR n times.
if (process.argv[2] === "write") {
    const [, , , dir, i, n] = process.argv;
    for (let k = 0; k < Number(n); k++) await store.writeRun(dir, body(Number(i), k % 2 === 0));
    process.exit(0);
}
if (process.argv[2] === "increment") {
    const [, , , dir, n] = process.argv;
    for (let k = 0; k < Number(n); k++) {
        await store.withRunFileLock(dir, RUN_ID, async () => {
            const run = await store.readRun(dir, RUN_ID);
            run.counter += 1;
            await store.writeRun(dir, run);
        });
    }
    process.exit(0);
}
if (process.argv[2] === "active") {
    const [, , , i, n] = process.argv;
    for (let k = 0; k < Number(n); k++) {
        await writeActive({ runId: `run-${i}`, stage: k % 2 === 0 ? { index: k, name: "x".repeat(20000) } : null });
    }
    process.exit(0);
}

let failures = 0;
function check(label, actual, expected) {
    const ok = actual === expected;
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        expected: ${expected}\n        actual:   ${actual}`}`);
}

function child(args, env = {}) {
    return new Promise((resolve) => {
        const proc = spawn(process.execPath, [SELF, ...args], { stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, ...env } });
        let stderr = "";
        proc.stderr.on("data", (d) => (stderr += d));
        proc.on("exit", (code) => resolve({ code, stderr }));
    });
}

function parses(file) {
    try {
        JSON.parse(readFileSync(file, "utf8"));
        return true;
    } catch {
        return false;
    }
}

// Whether what a reader got was torn content. Windows can refuse the open itself for the
// instant a rename replaces the file; that is no read at all, not a torn one.
function readsTorn(file) {
    let text;
    try {
        text = readFileSync(file, "utf8");
    } catch {
        return false;
    }
    try {
        JSON.parse(text);
        return false;
    } catch {
        return true;
    }
}

// Read the whole time the writers run: a reader must never see a mixed file either.
async function whileReading(file, work) {
    let torn = 0;
    let reads = 0;
    let done = false;
    const poll = (async () => {
        while (!done) {
            reads++;
            if (readsTorn(file)) torn++;
            await new Promise((r) => setTimeout(r, 2));
        }
    })();
    const results = await work();
    done = true;
    await poll;
    return { results, torn, reads };
}

function reportErrors(results) {
    const errors = results.filter((r) => r.code !== 0);
    check("every writer finished without an error", errors.length, 0);
    if (errors.length) console.log(errors.map((r) => (r.stderr.split("\n").find((l) => /Error/.test(l)) || r.stderr).trim()).join("\n"));
}

const leftovers = (dir, keep) => readdirSync(dir).filter((f) => f !== keep);
const runFile = (dir) => path.join(dir, `${RUN_ID}.json`);

console.log("— a shorter rewrite —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    await store.writeRun(dir, body(0, true));
    await store.writeRun(dir, body(1, false));
    check("the file parses after a shorter rewrite", parses(runFile(dir)), true);
    check("it holds the shorter body", (await store.readRun(dir, RUN_ID)).writer, 1);
    check("no temp or lock file is left beside it", leftovers(dir, `${RUN_ID}.json`).join(","), "");
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— overlapping writers —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    await store.writeRun(dir, body(0, true));
    const { results, torn, reads } = await whileReading(runFile(dir), () =>
        Promise.all([1, 2, 3, 4].map((i) => child(["write", dir, String(i), "40"])))
    );
    reportErrors(results);
    check(`no read of ${reads} saw a torn file`, torn, 0);
    check("the file parses once they are done", parses(runFile(dir)), true);
    check("no temp or lock file is left beside it", leftovers(dir, `${RUN_ID}.json`).join(","), "");
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— a reader during overlapping writers —");
{
    // On Windows a rename over the record can briefly hide it from a reader as ENOENT or
    // EPERM. The miss is rare — about one round in thirty — so this runs several rounds.
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    await store.writeRun(dir, body(0, false));
    let missing = 0;
    let unlisted = 0;
    let reads = 0;
    for (let round = 0; round < 8; round++) {
        let done = false;
        const poll = (async () => {
            while (!done) {
                reads++;
                if ((await store.readRun(dir, RUN_ID)) === null) missing++;
                if (!(await store.listRuns(dir)).some((r) => r.id === RUN_ID)) unlisted++;
                await new Promise((r) => setTimeout(r, 1));
            }
        })();
        await Promise.all([1, 2, 3, 4].map((i) => child(["write", dir, String(i), "40"])));
        done = true;
        await poll;
    }
    check(`no readRun of ${reads} found the run missing`, missing, 0);
    check(`no listRuns of ${reads} left the run out`, unlisted, 0);
    check("a run that was never written reads as null", await store.readRun(dir, "run-never-written"), null);
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— a record missing for a moment —");
{
    // The rename window, made deterministic: the record lands a few milliseconds after the
    // read starts. Windows retries ENOENT and finds it; elsewhere a missing run is null at once.
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    const lands = new Promise((r) => setTimeout(r, 8)).then(() => store.writeRun(dir, body(0, false)));
    const read = await store.readRun(dir, RUN_ID);
    await lands;
    check("readRun answers as the platform's rename allows", read === null, process.platform !== "win32");
    writeFileSync(path.join(dir, "run-mid-rename.json.1.ab.tmp"), "{}");
    const lister = store.listRuns(dir);
    await new Promise((r) => setTimeout(r, 8));
    await store.writeRun(dir, { ...body(0, false), id: "run-mid-rename" });
    const listed = (await lister).some((r) => r.id === "run-mid-rename");
    check("listRuns finds a run seen only as its temp file", listed, process.platform === "win32");
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— overlapping read-modify-write —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    await store.writeRun(dir, body(0, false));
    if (typeof store.withRunFileLock !== "function") {
        check("store exports withRunFileLock", typeof store.withRunFileLock, "function");
    } else {
        const results = await Promise.all([1, 2, 3, 4].map(() => child(["increment", dir, "25"])));
        reportErrors(results);
        check("no increment is lost across processes", (await store.readRun(dir, RUN_ID)).counter, 100);
        check("no temp or lock file is left beside it", leftovers(dir, `${RUN_ID}.json`).join(","), "");
    }
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— overlapping active.json writers —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    const env = { DELIVERY_SURFACE_COLLECTOR_STATE_DIR: dir };
    const active = path.join(dir, "active.json");
    await child(["active", "0", "1"], env);
    const { results, torn, reads } = await whileReading(active, () =>
        Promise.all([1, 2, 3, 4].map((i) => child(["active", String(i), "40"], env)))
    );
    reportErrors(results);
    check(`no read of ${reads} saw a torn active.json`, torn, 0);
    check("active.json parses once they are done", parses(active), true);
    check("no temp file is left beside it", leftovers(dir, "active.json").join(","), "");
    rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${failures ? `${failures} failing` : "all passing"}`);
process.exit(failures ? 1 : 0);
