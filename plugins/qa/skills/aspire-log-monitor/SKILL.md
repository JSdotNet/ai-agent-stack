---
name: aspire-log-monitor
description: 'Continuously monitor logs and traces of a running Aspire application via the Aspire MCP server while QA/Playwright validation is in progress. Use for the full duration of a test session, not just as a final check.'
compatibility: Requires the Aspire MCP server (`aspire mcp start`, CLI 13.1+).
---

# Aspire Log Monitor — Continuous QA Monitoring

Watch a running Aspire application's logs and traces for the entire duration of a QA test
session, so runtime errors are caught even when the UI under test appears to behave
correctly. (Metrics are not part of this: the server exposes no metrics tool — see
[Available MCP Tools](#available-mcp-tools).)

This skill is a companion to `playwright-validation`: start monitoring before browser
interaction begins, and keep it running until every scenario is finished.

## Prerequisites

The Aspire CLI MCP server must be initialized and running before validation that depends on
resource state, logs, traces, or health evidence:

```bash
aspire mcp init
aspire mcp start
```

If the Aspire MCP tools are not visible in the session after startup, restart the
session/runtime or reload MCP tools before QA begins. If monitoring remains
unavailable, report the missing capability explicitly and do not claim Aspire log/trace or
resource-state evidence was captured.

## Available MCP Tools

| Tool | Description |
|---|---|
| `list_resources` | List all resources with state, endpoints, health, and relationships |
| `list_structured_logs` | Structured logs, optionally filtered to one resource and/or a search term |
| `list_console_logs` | Raw console/stdout output for a named resource (`resourceName` required) |
| `list_traces` | Distributed traces, with duration and whether the trace errored |
| `list_trace_structured_logs` | Structured logs belonging to one trace id — prefer this when investigating a trace |
| `doctor` | Environment diagnostics; works with no AppHost running |
| `list_apphosts` | AppHost connections the server currently sees |

**Resolve the prefix from your own tool list.** These tools ship with this plugin, so they
normally surface as `mcp__plugin_qa_aspire__<tool>`; the same server registered directly in a
repository's own MCP configuration surfaces as `mcp__aspire__<tool>`. The names above are the
bare tool names — prepend whichever prefix your tool list shows.

**These names replaced an earlier `get_*` set** (`get_resources`, `get_resource_logs`,
`get_traces`, `get_console_logs`). An older Aspire CLI may still expose those; check the tool
list rather than assuming either spelling.

**There is no metrics tool.** `get_metrics` is gone and has no `list_*` replacement, so
metric evidence is not available through this server — use the Aspire dashboard for metrics,
and never report metrics as monitored when they were not.

## Workflow

### 1. Establish a Baseline

Before any Playwright interaction:

1. `list_resources` — confirm every required resource is running/healthy.
2. `list_structured_logs` for each resource — note the current log tail and any
   pre-existing warnings so they aren't misattributed to the test run later.
3. Record the baseline timestamp.

### 2. Monitor Continuously During Validation

While `playwright-validation` executes scenarios:

1. After each scenario step (or at minimum after each scenario), re-run
   `list_structured_logs` for the resources involved and diff against the baseline.
2. Watch for new **Error** / **Critical** entries — flag them immediately with the
   scenario/step that triggered them, even if the browser showed a success state.
3. When a request/flow spans multiple services, use `list_traces` to find the trace (it
   reports duration and whether the trace errored), then `list_trace_structured_logs` with
   that trace id to see the logs of every span in it.
4. For a performance question, use the durations `list_traces` reports — this server has no
   metrics tool, so read metrics from the Aspire dashboard instead of claiming a metric check.
5. If a resource becomes unhealthy mid-session, check `list_console_logs` immediately —
   config/dependency errors often appear there before structured logs.

### 3. Summarize at the End

Produce a monitoring summary to include in the QA report:

- New Error/Critical log entries observed, with resource, timestamp, and message.
- Any failed or abnormally slow traces, with the correlated scenario.
- Metric anomalies only if a metrics source was actually available (not this server).
- Or explicitly: "No new errors observed in Aspire logs/traces during this session."

## Log Levels

| Level | When to flag |
|---|---|
| Error / Critical | Always — actionable failures |
| Warning | Note if new since baseline or recurring across scenarios |
| Information | Only relevant for confirming expected lifecycle events |
| Debug | Skip unless actively diagnosing a specific failure |

## Tips

- Keep monitoring active for the whole session — checking logs only once at the end
  can hide errors that were later overwritten by log rotation or buffer limits.
- Cross-reference log/trace timestamps directly against the Playwright evidence
  timestamps to correlate a UI action with its backend effect.
- A scenario that "passes" visually but produces a new Error-level log entry should be
  reported as Fail (or Flaky) with the log entry as evidence, not as Pass.

## Reference

- Aspire MCP docs: `https://learn.microsoft.com/en-us/dotnet/aspire/ai/mcp-server`
- Aspire dashboard: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview`
