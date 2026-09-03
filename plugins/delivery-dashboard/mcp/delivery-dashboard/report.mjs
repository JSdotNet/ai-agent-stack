// Report generators for delivery-dashboard runs. `renderReportMarkdown` backs the
// `/api/runs/:id/report` download endpoint; `renderReportHtml` backs the
// `/api/runs/:id/report.html` endpoint and produces a single self-contained
// HTML file with evidence images inlined as `data:` URIs.

import { summarizeInsights, summarizeContext } from "./insight.mjs";

function fmtTokens(n) {
    if (n === null || n === undefined || !Number.isFinite(Number(n))) return "n/a";
    const value = Number(n);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(Math.round(value));
}

function fmtDuration(ms) {
    if (ms === null || ms === undefined) return "n/a";
    const totalSec = Math.round(ms / 1000);
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

function safeLinks(links) {
    if (!Array.isArray(links)) return [];
    return links.filter((link) => link && typeof link.url === "string" && /^(https?:\/\/|\/)/i.test(link.url));
}
function summaryCostLine(context) {
    const totals = context && context.totals;
    if (!totals) return "";
    const bits = [`${fmtTokens(totals.tokens)} total token cost`, `${fmtTokens(totals.uncachedTokens)} uncached`, `${totals.modelCalls} model call${totals.modelCalls === 1 ? "" : "s"}`];
    if (totals.reasoningTokens) bits.push(`${fmtTokens(totals.reasoningTokens)} reasoning`);
    if (totals.cacheReadTokens) bits.push(`${fmtTokens(totals.cacheReadTokens)} cache read`);
    return bits.join("; ");
}

function isWorkItemUpdateStage(stage) {
    return /^work item update$/i.test(String((stage && stage.name) || "").trim());
}

function hasWorkItem(run) {
    const item = run && run.workItem;
    return Boolean(item && (item.url || item.number || item.issueNumber));
}

function promptHistoryEntries(run) {
    const prompts = Array.isArray(run && run.promptHistory) ? run.promptHistory.slice() : [];
    if (!prompts.length && run && run.originalPrompt) {
        prompts.push({ kind: "initial", label: "Initial prompt", prompt: run.originalPrompt, createdAt: run.startedAt });
    }
    return prompts.filter((p) => p && p.prompt);
}

function visibleStageEntries(run) {
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
export function renderReportMarkdown(run) {
    const insight = summarizeInsights(run);
    const context = summarizeContext(run);
    const lines = [];
    lines.push(`# ${run.title}`);
    lines.push("");
    lines.push(`- **Skill:** \`${run.skillId}\``);
    lines.push(`- **Status:** ${run.status}`);
    lines.push(`- **Started:** ${run.startedAt}`);
    lines.push(`- **Updated:** ${run.updatedAt}`);
    if (run.changeKind) lines.push(`- **Change kind:** ${run.changeKind}`);
    if (run.approval && run.approval.state) {
        const decidedAt = run.approval.decidedAt ? ` (${run.approval.decidedAt})` : "";
        const note = run.approval.note ? ` — ${run.approval.note}` : "";
        lines.push(`- **Approval:** ${run.approval.state}${decidedAt}${note}`);
    }
    lines.push("");

    const promptHistory = promptHistoryEntries(run);
    if (promptHistory.length) {
        lines.push("## Prompt History");
        lines.push("");
        promptHistory.forEach((prompt, index) => {
            const fallback = prompt.kind === "initial" ? "Initial prompt" : `Follow-up prompt ${index + 1}`;
            const label = prompt.label || fallback;
            const timestamp = prompt.createdAt ? ` — ${prompt.createdAt}` : "";
            lines.push(`### ${index + 1}. ${label}${timestamp}`);
            lines.push("");
            lines.push("```text");
            lines.push(prompt.prompt);
            lines.push("```");
            lines.push("");
        });
    }
    lines.push("## Stages");
    lines.push("");
    lines.push("| # | Stage | Status | Done | Elapsed | Agents (planned) | Agents (used) | MCP Servers | Models |");
    lines.push("| - | ----- | ------ | ---- | ------- | ----------------- | -------------- | ----------- | ------ |");
    visibleStageEntries(run).forEach(({ stage, index }, visibleIndex) => {
        const observed = insight.perStage[index] || { agents: [], mcpServers: [], models: [] };
        lines.push(
            `| ${visibleIndex + 1} | ${stage.name} | ${stage.status} | ${stageDoneCount(run, stage) || "-"} | ${fmtDuration(stageElapsedMs(stage))} | ${(stage.agents || []).join(", ") || "-"} | ${observed.agents.join(", ") || "-"} | ${observed.mcpServers.join(", ") || "-"} | ${observed.models.join(", ") || "-"} |`
        );
    });
    lines.push("");

    const visibleStages = visibleStageEntries(run);
    const stagesWithOutput = visibleStages.filter(({ stage }) => stage.output || safeLinks(stage.links).length);
    if (stagesWithOutput.length) {
        lines.push("## Stage Output");
        lines.push("");
        visibleStages.forEach(({ stage }, visibleIndex) => {
            if (!stage.output && !safeLinks(stage.links).length) return;
            lines.push(`### ${visibleIndex + 1}. ${stage.name}`);
            lines.push("");
            if (stage.output) {
                lines.push("```text");
                lines.push(stage.output);
                lines.push("```");
                lines.push("");
            }
            if (safeLinks(stage.links).length) {
                lines.push("Links:");
                safeLinks(stage.links).forEach((link) => lines.push(`- [${link.label || link.url}](${link.url})${link.description ? ` - ${link.description}` : ""}`));
                lines.push("");
            }
        });
    }
    const stagesWithQa = visibleStageEntries(run).map(({ stage }) => stage).filter(
        (stage) => (Array.isArray(stage.scenarios) && stage.scenarios.length) || (stage.monitoring && (stage.monitoring.summary || (stage.monitoring.findings || []).length))
    );
    if (stagesWithQa.length) {
        lines.push("## QA Results");
        lines.push("");
        stagesWithQa.forEach((stage) => {
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
            if (stage.monitoring && (stage.monitoring.summary || (stage.monitoring.findings || []).length)) {
                lines.push("**Runtime monitoring:**");
                lines.push("");
                if (stage.monitoring.summary) {
                    lines.push(stage.monitoring.summary);
                    lines.push("");
                }
                if ((stage.monitoring.findings || []).length) {
                    lines.push("| Level | Resource | Message | Timestamp |");
                    lines.push("| ----- | -------- | ------- | --------- |");
                    stage.monitoring.findings.forEach((f) => {
                        lines.push(`| ${f.level} | ${f.resource || "-"} | ${f.message} | ${f.timestamp || "-"} |`);
                    });
                    lines.push("");
                }
            }
        });
    }

    if (run.summary) {
        lines.push("## Summary");
        lines.push("");
        lines.push(run.summary);
        lines.push("");
        const costLine = summaryCostLine(context);
        if (costLine) {
            lines.push(`**Total cost:** ${costLine}`);
            lines.push("");
        }
    }

    lines.push("## Insight");
    lines.push("");
    lines.push(`- **Total tool calls:** ${insight.totalCalls}`);
    lines.push(`- **Elapsed time:** ${fmtDuration(insight.elapsedMs)}`);
    lines.push(`- **Measured tool time:** ${fmtDuration(insight.totalToolMs)}`);
    if (insight.thinkingMs !== null) {
        lines.push(`- **Estimated thinking/reasoning time:** ${fmtDuration(insight.thinkingMs)}`);
    }
    lines.push("");
    const categories = Object.entries(insight.byCategory).sort((a, b) => b[1] - a[1]);
    if (categories.length) {
        lines.push("| Category | Time |");
        lines.push("| -------- | ---- |");
        categories.forEach(([category, ms]) => lines.push(`| ${category} | ${fmtDuration(ms)} |`));
        lines.push("");
    }
    if (insight.agentsUsed.length) lines.push(`- **Agents used:** ${insight.agentsUsed.join(", ")}`);
    if (insight.mcpServersUsed.length) lines.push(`- **MCP servers used:** ${insight.mcpServersUsed.join(", ")}`);
    if (insight.modelsUsed.length) lines.push(`- **Models used:** ${insight.modelsUsed.join(", ")}`);
    lines.push("");

    // Context tracking is omitted entirely for runs recorded before it
    // existed (summarizeContext returns null in that case).
    if (context) {
        lines.push("## Context");
        lines.push("");
        if (context.gauge) {
            const g = context.gauge;
            const pct = g.percent === null || g.percent === undefined ? "" : ` (${g.percent}%)`;
            const limit = g.tokenLimit ? ` / ${fmtTokens(g.tokenLimit)}` : "";
            lines.push(`- **Run-level context gauge:** ${fmtTokens(g.currentTokens)}${limit}${pct}`);
            if (g.peakTokens) {
                const peakPct = g.peakPercent === null || g.peakPercent === undefined ? "" : ` (${g.peakPercent}%)`;
                lines.push(`- **Peak context:** ${fmtTokens(g.peakTokens)}${peakPct}`);
            }
            const breakdown = [];
            if (g.systemTokens !== null) breakdown.push(`system ${fmtTokens(g.systemTokens)}`);
            if (g.conversationTokens !== null) breakdown.push(`conversation ${fmtTokens(g.conversationTokens)}`);
            if (g.toolDefinitionsTokens !== null) breakdown.push(`tool definitions ${fmtTokens(g.toolDefinitionsTokens)}`);
            if (breakdown.length) lines.push(`- **Breakdown:** ${breakdown.join(", ")}`);
        }
        if (context.totals) {
            lines.push(`- **Tokens consumed:** ${fmtTokens(context.totals.tokens)} over ${context.totals.modelCalls} model call${context.totals.modelCalls === 1 ? "" : "s"} (${fmtTokens(context.totals.uncachedTokens)} not served from the prompt cache)`);
            if (context.totals.reasoningTokens) lines.push(`- **Reasoning tokens:** ${fmtTokens(context.totals.reasoningTokens)}`);
            if (context.totals.cacheReadTokens || context.totals.cacheWriteTokens) {
                lines.push(`- **Prompt cache:** ${fmtTokens(context.totals.cacheReadTokens)} read, ${fmtTokens(context.totals.cacheWriteTokens)} written`);
            }
            if (context.subAgentTotals) {
                lines.push(`- **Delegated to sub-agents:** ${fmtTokens(context.subAgentTotals.tokens)} over ${context.subAgentTotals.modelCalls} model call${context.subAgentTotals.modelCalls === 1 ? "" : "s"}`);
            }
        }
        if (context.compactionCount) {
            const reasons = Object.entries(context.compactionReasons || {})
                .map(([reason, count]) => `${reason} x${count}`)
                .join(", ");
            lines.push(`- **Compactions:** ${context.compactionCount}${reasons ? ` (${reasons})` : ""}`);
        }
        if (context.truncationCount) {
            lines.push(`- **Truncations:** ${context.truncationCount} (${fmtTokens(context.truncatedTokens)} tokens removed)`);
        }
        lines.push("");

        const stageRows = (run.stages || [])
            .map((stage, i) => ({ stage, i, usage: context.perStage[String(i)] }))
            .filter((row) => row.usage && row.usage.tokens);
        if (stageRows.length) {
            lines.push("**Per-stage token delta:**");
            lines.push("");
            lines.push("| # | Stage | Token delta | Uncached | Input | Output | Reasoning | Model calls | Sub-agent tokens |");
            lines.push("| - | ----- | ----------- | -------- | ----- | ------ | --------- | ----------- | ---------------- |");
            stageRows.forEach(({ stage, i, usage }) => {
                lines.push(
                    `| ${i + 1} | ${stage.name} | ${fmtTokens(usage.tokens)} | ${fmtTokens(usage.uncachedTokens)} | ${fmtTokens(usage.inputTokens)} | ${fmtTokens(usage.outputTokens)} | ${fmtTokens(usage.reasoningTokens)} | ${usage.modelCalls} | ${usage.subAgent && usage.subAgent.tokens ? fmtTokens(usage.subAgent.tokens) : "-"} |`
                );
            });
            lines.push("");
        }
    }

    return lines.join("\n");
}

function escHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
}


function renderInlineMarkdownHtml(value) {
    const raw = String(value ?? "");
    const codeSpans = [];
    const withPlaceholders = raw.replace(/\`([^\`]+)\`/g, (_m, code) => {
        const key = "@@DELIVERY_DASHBOARD_CODE_SPAN_" + codeSpans.length + "@@";
        codeSpans.push("<code>" + escHtml(code) + "</code>");
        return key;
    });
    let html = escHtml(withPlaceholders);
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]+|\/[^\s)]+)\)/g, (_m, label, href) => {
        return "<a href=\"" + escHtml(href) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + label + "</a>";
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    html = html.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    html = html.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
    codeSpans.forEach((span, i) => {
        html = html.replace(new RegExp("@@DELIVERY_DASHBOARD_CODE_SPAN_" + i + "@@", "g"), span);
    });
    return html;
}

function renderMarkdownBlocksHtml(value) {
    const lines = String(value ?? "").replace(/\r\n?/g, "\n").split("\n");
    const parts = [];
    let paragraph = [];
    let listType = null;
    let inCode = false;
    let codeLines = [];

    function closeParagraph() {
        if (!paragraph.length) return;
        parts.push("<p>" + renderInlineMarkdownHtml(paragraph.join(" ").trim()) + "</p>");
        paragraph = [];
    }

    function closeList() {
        if (!listType) return;
        parts.push("</" + listType + ">");
        listType = null;
    }

    function openList(type) {
        if (listType === type) return;
        closeList();
        parts.push("<" + type + ">");
        listType = type;
    }

    function closeCode() {
        parts.push("<pre><code>" + escHtml(codeLines.join("\n")) + "</code></pre>");
        codeLines = [];
        inCode = false;
    }

    lines.forEach((line) => {
        if (/^\s*/.test(line) && line.trim().startsWith(String.fromCharCode(96, 96, 96))) {
            closeParagraph();
            closeList();
            if (inCode) closeCode();
            else {
                inCode = true;
                codeLines = [];
            }
            return;
        }

        if (inCode) {
            codeLines.push(line);
            return;
        }

        if (!line.trim()) {
            closeParagraph();
            closeList();
            return;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            closeParagraph();
            closeList();
            const level = Math.min(6, heading[1].length + 2);
            parts.push("<h" + level + ">" + renderInlineMarkdownHtml(heading[2].trim()) + "</h" + level + ">");
            return;
        }

        const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
        if (unordered) {
            closeParagraph();
            openList("ul");
            parts.push("<li>" + renderInlineMarkdownHtml(unordered[1].trim()) + "</li>");
            return;
        }

        const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
        if (ordered) {
            closeParagraph();
            openList("ol");
            parts.push("<li>" + renderInlineMarkdownHtml(ordered[1].trim()) + "</li>");
            return;
        }

        const quote = line.match(/^>\s?(.+)$/);
        if (quote) {
            closeParagraph();
            closeList();
            parts.push("<blockquote>" + renderInlineMarkdownHtml(quote[1].trim()) + "</blockquote>");
            return;
        }

        closeList();
        paragraph.push(line.trim());
    });

    if (inCode) closeCode();
    closeParagraph();
    closeList();
    return parts.join("");
}

const REPORT_HTML_STYLE = `
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0 auto; max-width: 900px; padding: 32px 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px; line-height: 1.5; color: #1f2328; background: #ffffff; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 28px 0 8px; border-bottom: 1px solid #d0d7de; padding-bottom: 4px; }
  h3 { font-size: 14px; margin: 18px 0 6px; }
  .meta { color: #59636e; font-size: 13px; margin: 0 0 8px; }
  .prompt-meta { color: #59636e; font-size: 12px; margin: -2px 0 6px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 13px; }
  th, td { border: 1px solid #d0d7de; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: rgba(127,127,127,0.08); }
  pre { white-space: pre-wrap; background: rgba(127,127,127,0.08); border-radius: 6px;
    padding: 10px 12px; font-size: 12.5px; overflow-x: auto; }
  .rich-output { background: rgba(127,127,127,0.06); border: 1px solid #d0d7de; border-radius: 8px; padding: 10px 12px; margin: 8px 0; }
  .rich-output :first-child { margin-top: 0; }
  .rich-output :last-child { margin-bottom: 0; }
  .rich-output h3, .rich-output h4, .rich-output h5, .rich-output h6 { margin: 12px 0 6px; line-height: 1.25; }
  .rich-output h3 { font-size: 15px; padding-bottom: 4px; border-bottom: 1px solid #d0d7de; }
  .rich-output h4 { font-size: 14px; }
  .rich-output h5, .rich-output h6 { font-size: 13px; color: #59636e; }
  .rich-output p { margin: 0 0 8px; }
  .rich-output ul, .rich-output ol { margin: 4px 0 10px; padding-left: 24px; }
  .rich-output li { margin: 3px 0; }
  .rich-output code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; background: rgba(127,127,127,0.12); border-radius: 4px; padding: 1px 4px; }
  .rich-output pre code { display: block; padding: 0; background: transparent; white-space: pre; }
  .rich-output blockquote { margin: 8px 0 10px; padding-left: 10px; border-left: 3px solid #d0d7de; color: #59636e; }
  .rich-output a { color: #0969da; text-decoration: none; }
  .rich-output a:hover { text-decoration: underline; }
  .badge { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 12px;
    font-weight: 600; text-transform: uppercase; letter-spacing: .02em; }
  .badge.done { background: rgba(31,136,61,.15); color: #1f883d; }
  .badge.pending { background: rgba(127,127,127,.18); color: #59636e; }
  .badge.in_progress { background: rgba(9,105,218,.15); color: #0969da; }
  .badge.blocked, .badge.cancelled { background: rgba(207,34,46,.15); color: #cf222e; }
  .badge.skipped { background: rgba(127,127,127,.1); color: #59636e; }
  .badge.pass { background: rgba(31,136,61,.15); color: #1f883d; }
  .badge.fail { background: rgba(207,34,46,.15); color: #cf222e; }
  .badge.flaky { background: rgba(191,135,0,.18); color: #9a6700; }
  .scenario { border: 1px solid #d0d7de; border-radius: 8px; padding: 10px 12px; margin: 8px 0; }
  .scenario-head { display: flex; align-items: center; gap: 8px; }
  .scenario-name { font-weight: 600; }
  .scenario-notes { color: #59636e; margin: 4px 0 0; }
  .evidence { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
  .evidence figure { margin: 0; max-width: 320px; }
  .evidence img { max-width: 320px; border-radius: 6px; border: 1px solid #d0d7de; display: block; }
  .evidence figcaption { font-size: 12px; color: #59636e; margin-top: 2px; }
  .evidence .missing { padding: 24px; border: 1px dashed #d0d7de; border-radius: 6px;
    color: #59636e; font-size: 12px; text-align: center; }
  .summary { background: rgba(31,136,61,.08); border-left: 3px solid #1f883d;
    border-radius: 6px; padding: 12px 14px; }
  @media (prefers-color-scheme: dark) {
    body { color: #e6edf3; background: #0d1117; }
    h2 { border-bottom-color: #30363d; }
    th, td { border-color: #30363d; }
    .scenario { border-color: #30363d; }
    .evidence img, .evidence .missing { border-color: #30363d; }
  }`;

// Builds a single self-contained HTML document for a run. `evidenceDataUris`
// maps an evidence `path` to a `data:` URI (or `null` when the file is not an
// image or could not be read); it is supplied by the caller so this module
// stays free of filesystem access.
export function renderReportHtml(run, evidenceDataUris = {}) {
    const insight = summarizeInsights(run);
    const context = summarizeContext(run);
    const parts = [];
    parts.push(`<h1>${escHtml(run.title)}</h1>`);
    const metaBits = [
        `<span class="badge ${escHtml(run.status)}">${escHtml(run.status)}</span>`,
        `<code>${escHtml(run.skillId)}</code>`,
        `started ${escHtml(run.startedAt)}`,
    ];
    if (run.changeKind) metaBits.push(`change: ${escHtml(run.changeKind)}`);
    if (run.approval && run.approval.state) {
        metaBits.push(`approval: ${escHtml(run.approval.state)}`);
    }
    parts.push(`<p class="meta">${metaBits.join(" &middot; ")}</p>`);

    const promptHistory = promptHistoryEntries(run);
    if (promptHistory.length) {
        parts.push("<h2>Prompt History</h2>");
        promptHistory.forEach((prompt, index) => {
            const fallback = prompt.kind === "initial" ? "Initial prompt" : `Follow-up prompt ${index + 1}`;
            const label = prompt.label || fallback;
            parts.push(`<h3>${index + 1}. ${escHtml(label)}</h3>`);
            if (prompt.createdAt) parts.push(`<p class="prompt-meta">${escHtml(prompt.createdAt)}</p>`);
            parts.push(`<pre>${escHtml(prompt.prompt)}</pre>`);
        });
    }

    parts.push("<h2>Stages</h2>");
    parts.push("<table><thead><tr><th>#</th><th>Stage</th><th>Status</th><th>Done</th><th>Elapsed</th><th>Agents (planned)</th><th>Agents (used)</th><th>MCP</th><th>Models</th></tr></thead><tbody>");
    visibleStageEntries(run).forEach(({ stage, index }, visibleIndex) => {
        const observed = insight.perStage[index] || { agents: [], mcpServers: [], models: [] };
        parts.push(
            `<tr><td>${visibleIndex + 1}</td><td>${escHtml(stage.name)}</td>` +
            `<td><span class="badge ${escHtml(stage.status)}">${escHtml(stage.status)}</span></td>` +
            `<td>${escHtml(stageDoneCount(run, stage) || "-")}</td>` +
            `<td>${escHtml(fmtDuration(stageElapsedMs(stage)))}</td>` +
            `<td>${escHtml((stage.agents || []).join(", ") || "-")}</td>` +
            `<td>${escHtml(observed.agents.join(", ") || "-")}</td>` +
            `<td>${escHtml(observed.mcpServers.join(", ") || "-")}</td>` +
            `<td>${escHtml(observed.models.join(", ") || "-")}</td></tr>`
        );
    });
    parts.push("</tbody></table>");

    visibleStageEntries(run).forEach(({ stage }, visibleIndex) => {
        const links = safeLinks(stage.links);
        const hasOutput = Boolean(stage.output) || links.length;
        const hasScenarios = Array.isArray(stage.scenarios) && stage.scenarios.length;
        const hasMonitoring = stage.monitoring && (stage.monitoring.summary || (stage.monitoring.findings || []).length);
        if (!hasOutput && !hasScenarios && !hasMonitoring) return;
        parts.push(`<h3>${visibleIndex + 1}. ${escHtml(stage.name)}</h3>`);
        if (stage.output) parts.push(`<div class="rich-output">${renderMarkdownBlocksHtml(stage.output)}</div>`);
        if (links.length) parts.push(`<div>${links.map((link) => `<a href="${escHtml(link.url)}">${escHtml(link.label || link.url)}</a>${link.description ? ` <span>${escHtml(link.description)}</span>` : ""}`).join("<br />")}</div>`);
        if (hasScenarios) {
            stage.scenarios.forEach((s) => {
                parts.push('<div class="scenario">');
                parts.push(
                    `<div class="scenario-head"><span class="badge ${escHtml(s.status)}">${escHtml(s.status)}</span>` +
                    `<span class="scenario-name">${escHtml(s.name)}</span></div>`
                );
                if (s.notes) parts.push(`<p class="scenario-notes">${escHtml(s.notes)}</p>`);
                const evidence = (s.evidence || []).filter((e) => e && e.path);
                if (evidence.length) {
                    parts.push('<div class="evidence">');
                    evidence.forEach((e) => {
                        const caption = escHtml(e.description || e.path.split(/[\\/]/).pop());
                        const dataUri = evidenceDataUris[e.path];
                        if (dataUri) {
                            parts.push(`<figure><img src="${dataUri}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`);
                        } else {
                            parts.push(`<figure><div class="missing">Evidence unavailable<br>${escHtml(e.type || "file")}: ${caption}</div></figure>`);
                        }
                    });
                    parts.push("</div>");
                }
                parts.push("</div>");
            });
        }
        if (hasMonitoring) {
            if (stage.monitoring.summary) parts.push(`<p>${escHtml(stage.monitoring.summary)}</p>`);
            if ((stage.monitoring.findings || []).length) {
                parts.push("<table><thead><tr><th>Level</th><th>Resource</th><th>Message</th><th>Timestamp</th></tr></thead><tbody>");
                stage.monitoring.findings.forEach((f) => {
                    parts.push(`<tr><td>${escHtml(f.level)}</td><td>${escHtml(f.resource || "-")}</td><td>${escHtml(f.message)}</td><td>${escHtml(f.timestamp || "-")}</td></tr>`);
                });
                parts.push("</tbody></table>");
            }
        }
    });

    if (run.summary) {
        parts.push("<h2>Summary</h2>");
        const costLine = summaryCostLine(context);
        parts.push(
            `<div class="summary rich-output">${renderMarkdownBlocksHtml(run.summary)}` +
            (costLine ? `<p><strong>Total cost:</strong> ${escHtml(costLine)}</p>` : "") + `</div>`
        );
    }

    const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escHtml(run.title)} — run report</title>
<style>${REPORT_HTML_STYLE}</style>
</head>
<body>
${parts.join("\n")}
</body>
</html>`;
    return doc;
}
