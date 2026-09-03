// Shared state resolution for the delivery-dashboard MCP server and its telemetry hook.
//
// Unlike the GitHub Copilot canvas extension this is ported from, the writers here live in
// *different processes*: the MCP server owns the tool calls, while Claude Code runs the
// hook script once per hook event. Anything both sides need — where runs live, which run
// is active, which stage is in progress — therefore lives on disk instead of in module
// scope.
//
// Layout under the state directory:
//
//   runs/<runId>.json          one tracked run (see store.mjs)
//   active.json                { runId, stage: { index, name } } — the run receiving telemetry
//   telemetry/<sessionId>.json hook bookkeeping: pending tool starts, transcript cursor

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

// Claude Code sets CLAUDE_PROJECT_DIR for hooks; MCP servers start in the project
// directory. Both resolve to the same tree, which is also where QA evidence paths are
// resolved from.
export function projectDir() {
    return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// The git worktree root the agent operates in. QA evidence paths (`.wip/qa/...`,
// `.qa-evidence/...`) are relative to this, and the evidence route refuses anything that
// resolves outside it.
let cachedWorktreeRoot;
export function worktreeRoot() {
    if (cachedWorktreeRoot !== undefined) return cachedWorktreeRoot;
    const start = projectDir();
    try {
        const output = execFileSync("git", ["rev-parse", "--show-toplevel"], {
            cwd: start,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        // git reports POSIX separators even on Windows; resolve() gives the platform form
        // the evidence containment check compares against.
        cachedWorktreeRoot = output ? path.resolve(output) : start;
    } catch {
        cachedWorktreeRoot = start;
    }
    return cachedWorktreeRoot || start;
}

// Run state deliberately does NOT live in the repository: a worktree is often thrown away
// after a pull request, and run files are not something a team wants in `git status`. It
// is keyed by project path instead, so every session working on the same checkout sees
// the same runs.
export function stateDir() {
    if (process.env.DELIVERY_DASHBOARD_STATE_DIR) {
        return path.resolve(process.env.DELIVERY_DASHBOARD_STATE_DIR);
    }
    const root = worktreeRoot();
    const slug = path.basename(root).replace(/[^a-zA-Z0-9._-]/g, "-") || "project";
    const hash = createHash("sha1").update(root.toLowerCase()).digest("hex").slice(0, 8);
    const home = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
    return path.join(home, "delivery-dashboard", `${slug}-${hash}`);
}

export function runsDir() {
    return path.join(stateDir(), "runs");
}

function activeFile() {
    return path.join(stateDir(), "active.json");
}

export async function readActive() {
    try {
        return JSON.parse(await readFile(activeFile(), "utf8"));
    } catch {
        return { runId: null, stage: null };
    }
}

export async function writeActive(active) {
    await mkdir(stateDir(), { recursive: true });
    await writeFile(activeFile(), JSON.stringify(active, null, 2), "utf8");
}

// Per-session hook bookkeeping. Kept separate from run files so a corrupt or stale cursor
// can never damage recorded run state.
export function telemetryFile(sessionId) {
    const safe = String(sessionId || "default").replace(/[^a-zA-Z0-9._-]/g, "-");
    return path.join(stateDir(), "telemetry", `${safe}.json`);
}

export async function readTelemetry(sessionId) {
    try {
        return JSON.parse(await readFile(telemetryFile(sessionId), "utf8"));
    } catch {
        // `subAgentOffsets` is a per-file cursor map for the sibling subagents/ transcripts
        // (see telemetry-hook.mjs), keyed by absolute path.
        return { pendingTools: {}, transcriptOffset: 0, transcriptPath: null, subAgentOffsets: {} };
    }
}

export async function writeTelemetry(sessionId, data) {
    const file = telemetryFile(sessionId);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data, null, 2), "utf8");
}
