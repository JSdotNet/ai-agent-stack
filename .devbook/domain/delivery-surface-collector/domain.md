# Delivery Surface Collector

```meta
index: root
type: domain
related: [".devbook/domain/context-map.md#delivery-surface-collector", ".devbook/arc42/09-architecture-decisions.md#a-surface-declares-only-the-contracts-tool-names"]
```

What this context is responsible for: that a run nobody watched is still legible afterwards —
which stages ran, how many times, what a person decided at each gate, what the evidence was, and
whether the run was handed off or abandoned.

Inside the boundary: the run store, the handoff round trip a resumed session depends on, and the
Markdown report. It answers two of the three capability groups.

Outside it: rendering, deliberately, and everything about what produced the run. It declares no
dependency and names no engine.

## Run Record

```meta
type: aggregate
related: [".devbook/domain/delivery-surface-collector/naming.md#run-record", ".devbook/domain/delivery-surface-dashboard/domain.md#run-record"]
```

One run kept for later rather than shown now: stages with status, output and repeat count, gate
decisions, QA scenarios with their evidence paths, and the handoff marker. One JSON file per run,
outside the repository, keyed by worktree path.

The selection is the design. What earns its keep in a session nobody watched is the half that
outlives the session — which is why lifecycle and export are answered here and render is not.

### Invariants

| Rule | Enforced at | Evidence |
|---|---|---|
| One record per run, keyed by worktree; a parked run is reattached to rather than duplicated | `start_run()` | `unit:node:plugins/delivery-surface-collector/mcp/delivery-surface-collector/dev/collector-test.mjs` |
| A stage finishing twice is recorded twice | `update_stage()` | `unit:node:plugins/delivery-surface-collector/mcp/delivery-surface-collector/dev/collector-test.mjs` |
| The gate decision is recorded, so a resumed session re-runs the gate rather than trusting a conversation it cannot read | `update_stage()` | untested |
| No token counts, no per-stage cost, no context gauge — nothing here observes a session | all mutations | `unit:node:plugins/delivery-surface-collector/mcp/delivery-surface-collector/dev/collector-test.mjs` |
| Idleness is derived on read and never stored | `get_run()`, `list_runs()` | untested |
| The declared tool surface is exactly the two answered groups' names, and the render names are absent | server start | `unit:node:plugins/delivery-surface-collector/mcp/delivery-surface-collector/dev/collector-test.mjs` |
| The record survives a session restart and never appears in `git status` | store | untested |

### Stage Record

```meta
type: entity
```

One stage as recorded: name, status, output, links, and how many times it finished. The repeat
count matters more here than anywhere else — a stage repeated after a revise decision is the one
thing a report written days later cannot reconstruct from anything else.

### QA Scenario

```meta
type: entity
```

One validation scenario with its status and evidence paths. The report cites the path; the
screenshot stays in the worktree that produced it, which is the trade this surface makes by
writing Markdown and not HTML.

### Handoff Marker

```meta
type: value-object
related: [".devbook/domain/delivery-surface-dashboard/domain.md#handoff-marker", ".devbook/domain/fleet/naming.md#park"]
```

The note a deliberately handed-off run leaves behind, and the difference between a run to
reattach to and one to close. A parked run and an abandoned run are idle by identical signals;
only one carries this.

That distinction is exactly what `start_run` needs in order to resume one and refuse the other,
and it is the reason a marker is a stored value while idleness is derived.

## Report Export

```meta
type: domain-service
related: [".devbook/domain/delivery-surface-collector/naming.md#headless"]
```

Writes the run's report from what was recorded: prompt history, the stage table, each stage's
output and links, QA scenarios with their evidence paths, monitoring findings, the handoff note,
and the summary.

Invocation semantics: command-invoked, at the end of a run or long after it. **Markdown, and only
Markdown.** A self-contained HTML report with evidence inlined is a rendering job, and rendering
is the half this surface does not answer — so asking for another format still writes Markdown and
says so in the result rather than failing the run over a file extension.
