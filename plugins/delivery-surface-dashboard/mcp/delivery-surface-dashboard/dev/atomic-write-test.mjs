// Check that a run file is always whole JSON, however its writers overlap.
//
// The MCP server and the telemetry hook are separate processes, and the hook runs once per
// tool event, so parallel tool calls give several hook processes at once. A run file once
// came back as a complete object followed by the tail of a longer, older one: two writers had
// truncated and filled the same temp file from offset 0, and the rename published the mix.
// This drives writeRun and withRunFileLock from child processes the way those writers do.
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as store from "../store.mjs";

const RUN_ID = "run-atomic-test";
const SELF = fileURLToPath(import.meta.url);

// A long and a short body for the same run, so an overlap that mixes them leaves a tail.
function body(i, long) {
    return { id: RUN_ID, writer: i, padding: long ? "x".repeat(20000) : "", counter: 0 };
}

// Child modes: `write <dir> <i> <n>` rewrites the run n times, alternating long and short;
// `increment <dir> <n>` adds one to the counter n times under the cross-process lock.
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

const leftovers = (dir) => readdirSync(dir).filter((f) => f !== `${RUN_ID}.json`);
const runFile = (dir) => path.join(dir, `${RUN_ID}.json`);

console.log("— a shorter rewrite —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "dashboard-atomic-"));
    await store.writeRun(dir, body(0, true));
    await store.writeRun(dir, body(1, false));
    check("the file parses after a shorter rewrite", parses(runFile(dir)), true);
    check("it holds the shorter body", (await store.readRun(dir, RUN_ID)).writer, 1);
    check("no temp or lock file is left beside it", leftovers(dir).join(","), "");
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— overlapping writers —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "dashboard-atomic-"));
    await store.writeRun(dir, body(0, true));
    let torn = 0;
    let reads = 0;
    let done = false;
    // Read the whole time the writers run: a reader must never see a mixed file either.
    const poll = (async () => {
        while (!done) {
            reads++;
            if (readsTorn(runFile(dir))) torn++;
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
    check("no temp or lock file is left beside it", leftovers(dir).join(","), "");
    rmSync(dir, { recursive: true, force: true });
}

console.log("\n— overlapping read-modify-write —");
{
    const dir = mkdtempSync(path.join(tmpdir(), "dashboard-atomic-"));
    await store.writeRun(dir, body(0, false));
    if (typeof store.withRunFileLock !== "function") {
        check("store exports withRunFileLock", typeof store.withRunFileLock, "function");
    } else {
        const results = await Promise.all([1, 2, 3, 4].map(() => child(["increment", dir, "25"])));
        check("every writer finished without an error", results.filter((r) => r.code !== 0).length, 0);
        check("no increment is lost across processes", (await store.readRun(dir, RUN_ID)).counter, 100);
        check("no temp or lock file is left beside it", leftovers(dir).join(","), "");
    }
    rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${failures ? `${failures} failing` : "all passing"}`);
process.exit(failures ? 1 : 0);
