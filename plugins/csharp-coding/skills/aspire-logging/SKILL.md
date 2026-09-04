---
name: aspire-logging
description: 'Retrieve and analyze structured logs from running Aspire applications via the Aspire MCP server. Use when diagnosing errors, investigating slow requests, or reviewing service output during local development.'
compatibility: Requires Aspire MCP server (`aspire mcp start` with CLI 13.1+).
---

# Aspire Logging — Retrieve Logs via Aspire MCP

Query structured logs, traces, and resource state from a running Aspire application using the Aspire MCP server.

## Prerequisites

The Aspire CLI MCP server must be running:

```bash
aspire mcp start
```

Or configure it for your AI assistant:

```bash
aspire mcp init
```

## Available MCP Tools

| Tool | Description |
|---|---|
| `list_resources` | All resources (services, containers, databases) with state, endpoints, health, relationships |
| `list_structured_logs` | Structured logs, optionally filtered to one resource and/or a search term |
| `list_console_logs` | Raw stdout/stderr for a named resource (`resourceName` required) |
| `list_traces` | Distributed traces, with duration and whether the trace errored |
| `list_trace_structured_logs` | Structured logs for every span of one trace id |
| `doctor` | Environment diagnostics; works with no AppHost running |
| `list_apphosts` / `select_apphost` | AppHost connections the server sees, and which one to target |
| `execute_resource_command` | Run a resource command such as `start`, `stop`, `restart` |

Two things to know before calling any of them:

- **The names above replaced an earlier `get_*` set** (`get_resources`, `get_resource_logs`,
  `get_traces`, `get_console_logs`), and `get_metrics` is gone with no replacement — this
  server exposes **no metrics tool**. Read metrics from the Aspire dashboard instead. An older
  Aspire CLI may still expose the `get_*` names, so check your tool list rather than assuming
  either spelling.
- **The prefix depends on how the server was registered.** Registered directly in a
  repository's MCP configuration the tools surface as `mcp__aspire__<tool>`; provided by a
  plugin they are namespaced with it, e.g. `mcp__plugin_qa_aspire__<tool>` from the `qa`
  plugin. The names in this skill are bare — take the prefix from your tool list.

## Workflow

### 1. List Running Resources

```
Tool: list_resources
```

Returns resource names, types (project/container/executable), endpoints, and health state. Use the resource name in subsequent calls.

### 2. Get Structured Logs

```
Tool: list_structured_logs
resourceName: "my-api"
search: "timeout"
```

Returns structured log entries with timestamp, level, message, and properties. Both arguments are optional: omit `resourceName` for logs across all resources, and use `search` for a full-text filter over log text, attributes, names, source, and ids.

### 3. Get Console Output

```
Tool: list_console_logs
resourceName: "my-worker"
```

Returns raw stdout/stderr — useful for startup errors or unstructured output, and the first place to look when a resource is not running. `resourceName` is required here. Console logs also carry the output of resource commands (`start`, `stop`, `restart`).

### 4. Get Traces

```
Tool: list_traces
resourceName: "my-api"
```

Returns the traces with their ids, participating resources, duration, and whether an error occurred. To drill into one request path, take its id and call `list_trace_structured_logs` with `traceId` — prefer that over per-resource logs when investigating a trace, because it returns the logs of every span in order.

### 5. Metrics — Not Available Through MCP

There is no metrics tool on this server. For latency or throughput questions, use the
durations `list_traces` reports, or open the Aspire dashboard's metrics view. Do not report a
metric check that was not performed.

## Diagnostic Workflow

When investigating an issue:

1. `list_resources` — confirm which services are running and healthy.
2. `list_structured_logs` for the failing service — find error messages and stack traces.
3. `list_traces` — find the failing request across services, then `list_trace_structured_logs`
   with its trace id for the logs of every span.
4. `list_console_logs` — check startup failures or missing config.
5. For latency spikes or saturation, read trace durations, or the dashboard's metrics view —
   there is no metrics tool.

## Log Levels

| Level | When to check |
|---|---|
| Error / Critical | Always — these are actionable failures |
| Warning | Intermittent issues, degraded state, retries |
| Information | Normal lifecycle events, request handling |
| Debug | Detailed internal state (verbose — filter carefully) |

## Tips

- Cross-reference log timestamps with trace spans to pinpoint where latency is introduced.
- Use trace IDs from logs to pull the full distributed trace across services.
- When an Aspire resource is in a degraded or stopped state, check console logs first — config errors often surface there before structured logs are emitted.

## Reference

- Aspire MCP docs: `https://learn.microsoft.com/en-us/dotnet/aspire/ai/mcp-server`
- Aspire dashboard: `https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview`
