// Check that a run file is always whole JSON and always found, however its writes overlap.
//
// Only the MCP server writes a collector run, but its tool calls overlap, and on Windows a
// rename over the record can hide it from a reader for a moment. This drives writeRun from
// child processes so the writes overlap for real.
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as store from "../store.mjs";

const RUN_ID = "run-atomic-test";
const SELF = fileURLToPath(import.meta.url);

// A long and a short body for the same run, so an overlap that mixes them leaves a tail.
function body(i, long) {
    return { id: RUN_ID, writer: i, padding: long ? "x".repeat(20000) : "" };
}

// Child mode: `write <dir> <i> <n>` rewrites the run n times, alternating long and short.
if (process.argv[2] === "write") {
    const [, , , dir, i, n] = process.argv;
    for (let k = 0; k < Number(n); k++) await store.writeRun(dir, body(Number(i), k % 2 === 0));
    process.exit(0);
}

let failures = 0;
function check(label, actual, expected) {
    const ok = actual === expected;
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        expected: ${expected}\n        actual:   ${actual}`}`);
}

function child(args) {
    return new Promise((resolve) => {
        const proc = spawn(process.execPath, [SELF, ...args], { stdio: ["ignore", "ignore", "pipe"] });
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

const leftovers = (dir) => readdirSync(dir).filter((f) => f !== `${RUN_ID}.json`);
const runFile = (dir) => path.join(dir, `${RUN_ID}.json`);

console.log("— a shorter rewrite —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    await store.writeRun(dir, body(0, true));
    await store.writeRun(dir, body(1, false));
    check("the file parses after a shorter rewrite", parses(runFile(dir)), true);
    check("it holds the shorter body", (await store.readRun(dir, RUN_ID)).writer, 1);
    check("no temp file is left beside it", leftovers(dir).join(","), "");
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— overlapping writers —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "collector-atomic-"));
    await store.writeRun(dir, body(0, true));
    let torn = 0;
    let reads = 0;
    let done = false;
    // Read the whole time the writers run: a reader must never see a mixed file either.
    const poll = (async () => {
        while (!done) {
            reads++;
            if (!parses(runFile(dir))) torn++;
            await new Promise((r) => setTimeout(r, 2));
        }
    })();
    const results = await Promise.all([1, 2, 3, 4].map((i) => child(["write", dir, String(i), "40"])));
    done = true;
    await poll;
    const errors = results.filter((r) => r.code !== 0);
    check("every writer finished without an error", errors.length, 0);
    if (errors.length) console.log(errors.map((r) => (r.stderr.split("\n").find((l) => /Error/.test(l)) || r.stderr).trim()).join("\n"));
    check(`no read of ${reads} saw a torn file`, torn, 0);
    check("the file parses once they are done", parses(runFile(dir)), true);
    check("no temp file is left beside it", leftovers(dir).join(","), "");
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

console.log(`\n${failures ? `${failures} failing` : "all passing"}`);
process.exit(failures ? 1 : 0);
