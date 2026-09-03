---
name: aspire-run
description: 'Start and confirm the health of a .NET Aspire-orchestrated application for QA/testing purposes. Use before any runtime validation, browser testing, or exploratory testing session.'
compatibility: Requires the Aspire CLI (`aspire run`) and Aspire MCP server for QA validation that needs resource state, logs, traces, metrics, or health evidence.
---

# Aspire Run — Start the App Under Test

Start a distributed .NET Aspire application and confirm it is healthy before any QA
validation begins. Running through Aspire (rather than a single project) ensures
dependent resources — databases, caches, queues, downstream services — are available
and wired exactly as they would be for a real user.

## When to Use

- Before any Playwright-driven feature validation.
- Before exploratory or regression testing against a local build.
- Whenever a QA report needs to reference a specific running app version/commit.

## Steps

### 1. Locate the AppHost

- Use the AppHost path the caller supplied when there is one. Otherwise look for a project
  ending in `.AppHost` (convention). Ask for the path only when discovery found nothing *and*
  you have a user turn — when an orchestration invoked you (as a sub-agent or a child
  session) there is no user to ask, so return the question and your best candidate to your
  caller instead of stalling.
- Confirm the solution builds: `dotnet build` on the AppHost project if not already built.

### 2. Start the App

```bash
aspire run
```

Or, if the Aspire CLI is not installed/available:

```bash
dotnet run --project <path-to-AppHost>.csproj
```

Run this as a background/async process — QA validation happens against the live app
while it keeps running.

### 3. Confirm Health Before Testing

Prefer the Aspire MCP server when available:

```
Tool: list_resources
```

Wait until every required resource reports a running/healthy state. If a resource is
stuck starting or in a failed state, check `list_console_logs` for that resource before
proceeding — do not start Playwright validation against a partially-started app.

Tool names here are bare. The Aspire server ships with this plugin, so its tools normally
surface as `mcp__plugin_qa_aspire__<tool>` (`mcp__aspire__<tool>` when the server is
registered directly in a repository's own MCP configuration) — take the prefix from your
tool list. If `list_resources` is missing, an older Aspire CLI may still expose the earlier
`get_resources` name; `doctor` diagnoses the environment even with no AppHost running.

Fallback (no MCP server): only allowed for startup-only checks where MCP-backed resource
state, log, trace, metric, or health evidence is not required. For QA validation that
requires Aspire monitoring or evidence, missing Aspire MCP blocks the phase; stop and report
that Aspire MCP must be started/configured before validation can continue — to the user when
you have a user turn, otherwise to your caller as a blocked result.

### 4. Resolve Endpoint URLs

- Read the dashboard/console output for the resource endpoint(s) needed for browser
  testing (e.g. the frontend or API base URL).
- Record the exact URL(s) used — include them in the QA report for reproducibility.

### 5. Keep the App Running for the Whole Session

- Do not stop the app between validation scenarios; restarting changes state and
  invalidates the Aspire log/trace timeline the `aspire-log-monitor` skill depends on.
- Only stop the app after monitoring and Playwright validation are both complete and
  the report has been produced.

### 6. Refresh After Code Changes

When implementation changes are made after an app has already been started for QA or
Personal Validation, refresh the running app before continuing validation:

- Prefer the same running instance when the startup command supports hot reload/watch and
  resource state remains healthy.
- Otherwise stop and restart the app automatically, then wait for healthy/running state.
- Re-resolve endpoint URLs after a restart because ports may change.
- Record whether the refreshed app used hot reload/watch or a full restart.

## Common Failure Modes

| Symptom | Likely Cause | Check |
|---|---|---|
| Resource stuck in "Starting" | Missing dependency (DB/cache container not pulled) | `list_console_logs` for that resource |
| Frontend loads but API calls fail | Service discovery misconfiguration | `ConnectionStrings__*` / `services__*__http__0` env vars |
| App exits immediately | Config/secret missing | Console output at startup, `list_console_logs` |

## Reference

- Aspire CLI docs: `https://aspire.dev`
- Aspire dashboard: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview`
