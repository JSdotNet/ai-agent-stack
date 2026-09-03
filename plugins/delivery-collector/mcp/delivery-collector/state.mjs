// Where a collected run lives.
//
// Layout under the state directory:
//
//   runs/<runId>.json          one tracked run (see store.mjs)
//   active.json                { runId, stage: { index, name } } — the run being advanced
//   reports/                   whatever export_report has written
//
// `active.json` exists for the same reason it does in a surface with telemetry: the run a
// resumed session should pick up is a fact about this project, not about a conversation.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

// Claude Code sets CLAUDE_PROJECT_DIR for hooks; MCP servers start in the project
// directory. Both resolve to the same tree.
export function projectDir() {
    return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// The git worktree root. A relative `outputPath` given to export_report resolves against
// it, so a report lands where the caller means rather than where the server happens to run.
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
        // git reports POSIX separators even on Windows; resolve() gives the platform form.
        cachedWorktreeRoot = output ? path.resolve(output) : start;
    } catch {
        cachedWorktreeRoot = start;
    }
    return cachedWorktreeRoot || start;
}

// Run state deliberately does NOT live in the repository: a worktree is often thrown away
// after a pull request, and run files are not something a team wants in `git status`. It is
// keyed by project path instead, so every session working on the same checkout sees the
// same runs.
export function stateDir() {
    if (process.env.DELIVERY_COLLECTOR_STATE_DIR) {
        return path.resolve(process.env.DELIVERY_COLLECTOR_STATE_DIR);
    }
    const root = worktreeRoot();
    const slug = path.basename(root).replace(/[^a-zA-Z0-9._-]/g, "-") || "project";
    const hash = createHash("sha1").update(root.toLowerCase()).digest("hex").slice(0, 8);
    const home = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
    return path.join(home, "delivery-collector", `${slug}-${hash}`);
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
