# Delivery Surface Dashboard

```meta
type: features
related: [".devbook/domain/context-map.md#delivery-surface-dashboard"]
```

> Three capability groups, whole, plus the one thing no other surface here does: measure.

**This context keeps `features.md` rather than `skills.md`, because it ships no skills.** Its
whole surface is an MCP server's tools and three pages; there is nothing a person invokes by name.

## Track a Run

```meta
type: feature
related: [".devbook/domain/delivery-surface-dashboard/domain.md#run-record", ".devbook/domain/delivery/domain.md#run-started"]
```

Answer the lifecycle group — open, start, record the prompt, set the context, update a stage,
finish, list, get — and keep the result on disk, keyed by worktree, outside the repository. A
run survives a session restart and never shows up in `git status`.

### Reattach to a Parked Run

```meta
type: sub-feature
related: [".devbook/domain/delivery-surface-dashboard/domain.md#handoff-marker"]
```

Pick a handed-off run up where it stopped rather than opening a second beside it. Both a parked
run and an abandoned one look idle; the handoff marker is the only thing that tells them apart.

### Read Idleness and Title From the Run

```meta
type: sub-feature
```

Derive whether a run has stalled and what to call it from where its output has landed, rather
than storing either as status. A list of parallel sessions is then readable at a glance without
anyone having to name them.

## Watch a Run Live

```meta
type: feature
related: [".devbook/domain/delivery-surface-dashboard/domain.md#viewer"]
```

Show the run list, each run's stages with status and output, QA scenarios with their evidence
inline, and the tool-activity and context panels. Rendered inline where the host implements MCP
Apps, and on a loopback origin where it does not — one page file either way.

### Render a Diagram or a Document

```meta
type: sub-feature
related: [".devbook/domain/delivery-surface-dashboard/domain.md#view"]
```

Answer the render group: Mermaid rendered live and pannable, Markdown rendered as formatted
HTML, both with push-and-replace navigation so a drill-down can be stepped back. A rendered view
is a preview of a file that exists, never a replacement for it.

## Measure the Session

```meta
type: feature
related: [".devbook/domain/delivery-surface-dashboard/domain.md#telemetry-capture", ".devbook/domain/delivery-surface-dashboard/domain.md#telemetry"]
```

Fold tool calls, sub-agent use, and token usage into the run from hook-captured tool events, and
warn when the context gauge crosses its threshold. Nothing asks the agent to count anything,
which is what separates these numbers from an estimate.

This is the one capability outside the contract, and it degrades to nothing rather than to
something wrong: on a host without command hooks the run is tracked in full and the panels are
simply empty.

## Export the Report

```meta
type: feature
related: [".devbook/domain/delivery-surface-dashboard/domain.md#report-export"]
```

Answer the export group: the prompt history, the stage table, each stage's output and links, QA
scenarios with their evidence, monitoring findings, the handoff note, and the summary — as
Markdown, or as self-contained HTML with the evidence inlined so the report survives the
worktree that produced it.
