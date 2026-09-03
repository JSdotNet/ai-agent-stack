// Markdown report for a collected run.
//
// One format, and it is the one that needs no viewer: a Markdown file reads in a terminal,
// in a pull request, and in whatever renders it later. A self-contained HTML report with
// evidence inlined is a rendering job, and rendering is the half of the surface contract
// this implementation deliberately does not answer.
//
// The report says only what was recorded. There are no token or timing columns beyond the
// timestamps the calls themselves carried: nothing here observes a session, so a column of
// zeroes would read as a measurement rather than as an absence.

import { effectiveEndedAtMs } from "./idle.mjs";

function fmtDuration(ms) {
    if (ms === null || ms === undefined || !Number.isFinite(Number(ms))) return "n/a";
    const totalSec = Math.round(Number(ms) / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function stageElapsedMs(stage) {
    if (!stage) return null;
    if (Number.isFinite(Number(stage.durationMs))) return Number(stage.durationMs);
    if (!stage.startedAt) return null;
    const started = new Date(stage.startedAt).getTime();
    if (!Number.isFinite(started)) return null;
    const endedAt = stage.completedAt || stage.updatedAt;
    if (!endedAt) return null;
    const ended = new Date(endedAt).getTime();
    return Number.isFinite(ended) ? Math.max(0, ended - started) : null;
}

function runElapsedMs(run) {
    const started = run.startedAt ? new Date(run.startedAt).getTime() : NaN;
    const ended = effectiveEndedAtMs(run);
    if (!Number.isFinite(started) || !Number.isFinite(ended)) return null;
    return Math.max(0, ended - started);
}

function safeLinks(links) {
    if (!Array.isArray(links)) return [];
    return links.filter((link) => link && typeof link.url === "string" && /^(https?:\/\/|\/)/i.test(link.url));
}

// A stage named for the work item is hidden when no work item was ever attached: a report
// that lists it as "pending" implies something is owed that never existed.
function isWorkItemUpdateStage(stage) {
    return /^work item update$/i.test(String((stage && stage.name) || "").trim());
}

function hasWorkItem(run) {
    const item = run && run.workItem;
    return Boolean(item && (item.url || item.number || item.issueNumber));
}

function visibleStages(run) {
    return (run.stages || [])
        .map((stage, index) => ({ stage, index }))
        .filter(({ stage }) => !isWorkItemUpdateStage(stage) || hasWorkItem(run));
}

function stageDoneCount(run, stage) {
    const direct = Number(stage && stage.doneCount);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const byName = run && run.phaseDoneCounts && Number(run.phaseDoneCounts[(stage && stage.name) || ""]);
    return Number.isFinite(byName) && byName > 0 ? byName : 0;
}

function promptEntries(run) {
    const prompts = Array.isArray(run && run.promptHistory) ? run.promptHistory.slice() : [];
    if (!prompts.length && run && run.originalPrompt) {
        prompts.push({ kind: "initial", label: "Initial prompt", prompt: run.originalPrompt, createdAt: run.startedAt });
    }
    return prompts.filter((p) => p && p.prompt);
}

export function renderReportMarkdown(run) {
    const lines = [];

    lines.push(`# ${run.title}`);
    lines.push("");
    lines.push(`- **Skill:** \`${run.skillId}\``);
    lines.push(`- **Status:** ${run.status}`);
    lines.push(`- **Started:** ${run.startedAt}`);
    lines.push(`- **Updated:** ${run.updatedAt}`);
    lines.push(`- **Elapsed:** ${fmtDuration(runElapsedMs(run))}`);
    if (run.changeKind) lines.push(`- **Change kind:** ${run.changeKind}`);
    if (run.approval && run.approval.state) {
        const decidedAt = run.approval.decidedAt ? ` (${run.approval.decidedAt})` : "";
        const note = run.approval.note ? ` — ${run.approval.note}` : "";
        lines.push(`- **Approval:** ${run.approval.state}${decidedAt}${note}`);
    }
    if (hasWorkItem(run)) {
        const item = run.workItem;
        const label = item.title || item.number || item.url;
        lines.push(`- **Work item:** ${item.url ? `[${label}](${item.url})` : label}`);
    }
    if (run.handoff && run.handoff.pending) {
        lines.push(`- **Handed off:** at \`${run.handoff.stage || "unknown stage"}\`, ${run.handoff.at}`);
    }
    lines.push("");

    const prompts = promptEntries(run);
    if (prompts.length) {
        lines.push("## Prompt History");
        lines.push("");
        prompts.forEach((prompt, index) => {
            const fallback = prompt.kind === "initial" ? "Initial prompt" : `Follow-up prompt ${index + 1}`;
            const timestamp = prompt.createdAt ? ` — ${prompt.createdAt}` : "";
            lines.push(`### ${index + 1}. ${prompt.label || fallback}${timestamp}`);
            lines.push("");
            lines.push("```text");
            lines.push(prompt.prompt);
            lines.push("```");
            lines.push("");
        });
    }

    lines.push("## Stages");
    lines.push("");
    lines.push("| # | Stage | Status | Done | Elapsed | Agents |");
    lines.push("| - | ----- | ------ | ---- | ------- | ------ |");
    visibleStages(run).forEach(({ stage }, visibleIndex) => {
        lines.push(
            `| ${visibleIndex + 1} | ${stage.name} | ${stage.status} | ${stageDoneCount(run, stage) || "-"} | ${fmtDuration(stageElapsedMs(stage))} | ${(stage.agents || []).join(", ") || "-"} |`
        );
    });
    lines.push("");

    const withOutput = visibleStages(run).filter(({ stage }) => stage.output || safeLinks(stage.links).length);
    if (withOutput.length) {
        lines.push("## Stage Output");
        lines.push("");
        visibleStages(run).forEach(({ stage }, visibleIndex) => {
            if (!stage.output && !safeLinks(stage.links).length) return;
            lines.push(`### ${visibleIndex + 1}. ${stage.name}`);
            lines.push("");
            if (stage.output) {
                lines.push("```text");
                lines.push(stage.output);
                lines.push("```");
                lines.push("");
            }
            const links = safeLinks(stage.links);
            if (links.length) {
                lines.push("Links:");
                links.forEach((link) => lines.push(`- [${link.label || link.url}](${link.url})${link.description ? ` - ${link.description}` : ""}`));
                lines.push("");
            }
        });
    }

    const withQa = visibleStages(run)
        .map(({ stage }) => stage)
        .filter(
            (stage) =>
                (Array.isArray(stage.scenarios) && stage.scenarios.length) ||
                (stage.monitoring && (stage.monitoring.summary || (stage.monitoring.findings || []).length))
        );
    if (withQa.length) {
        lines.push("## QA Results");
        lines.push("");
        withQa.forEach((stage) => {
            lines.push(`### ${stage.name}`);
            lines.push("");
            if (Array.isArray(stage.scenarios) && stage.scenarios.length) {
                lines.push("| Scenario | Status | Evidence | Notes |");
                lines.push("| -------- | ------ | -------- | ----- |");
                stage.scenarios.forEach((s) => {
                    const evidence = (s.evidence || []).map((e) => `${e.type || "file"}: \`${e.path}\``).join("<br>") || "-";
                    lines.push(`| ${s.name} | ${s.status} | ${evidence} | ${s.notes || "-"} |`);
                });
                lines.push("");
            }
            const monitoring = stage.monitoring;
            if (monitoring && (monitoring.summary || (monitoring.findings || []).length)) {
                lines.push("**Runtime monitoring:**");
                lines.push("");
                if (monitoring.summary) {
                    lines.push(monitoring.summary);
                    lines.push("");
                }
                if ((monitoring.findings || []).length) {
                    lines.push("| Level | Resource | Message | Timestamp |");
                    lines.push("| ----- | -------- | ------- | --------- |");
                    monitoring.findings.forEach((f) => {
                        lines.push(`| ${f.level || "info"} | ${f.resource || "-"} | ${f.message} | ${f.timestamp || "-"} |`);
                    });
                    lines.push("");
                }
            }
        });
    }

    if (run.handoff && run.handoff.note) {
        lines.push("## Handoff");
        lines.push("");
        lines.push(run.handoff.note);
        lines.push("");
    }

    if (run.summary) {
        lines.push("## Summary");
        lines.push("");
        lines.push(run.summary);
        lines.push("");
    }

    // Evidence is referenced by path, not embedded: this surface records where a file is,
    // and the file itself stays in the worktree that produced it.
    return lines.join("\n");
}
