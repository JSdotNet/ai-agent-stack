# Delivery Surface Collector

```meta
type: features
related: [".devbook/domain/context-map.md#delivery-surface-collector"]
```

> Two capability groups, and one deliberate absence. Everything here is about what is still true
> after the session has ended.

**This context keeps `features.md` rather than `skills.md`, because it ships no skills** — one
MCP server, no page, and nothing a person invokes by name.

## Record a Run

```meta
type: feature
related: [".devbook/domain/delivery-surface-collector/domain.md#run-record"]
```

Answer the lifecycle group and keep the result on disk, keyed by worktree, outside the
repository. Runs survive a session restart and never show up in `git status`.

### Keep What Outlives the Session

```meta
type: sub-feature
```

Stage status, output, and repeat count; the gate decision a person returned; QA scenarios and
their evidence paths; the handoff marker and its note. Each earns its place by answering a
question a later reader actually has.

### Reattach or Refuse

```meta
type: sub-feature
related: [".devbook/domain/delivery-surface-collector/domain.md#handoff-marker"]
```

Resume a handed-off run and decline an abandoned one. Both look idle by every derived signal; the
marker is the only thing that separates them.

## Answer Nothing for Render

```meta
type: feature
related: [".devbook/domain/delivery-surface-collector/domain.md#headless"]
```

Leave the render tool names absent rather than stubbing them. A caller resolves each capability
group separately, so it finds this one unanswered and renders nowhere — instead of finding a stub
that pretends to have shown someone something.

`open_dashboard` answers with no URL and says the run is being recorded rather than shown. There
is nothing to open, and saying so once is the whole behaviour.

## Report Without Telemetry

```meta
type: feature
related: [".devbook/domain/delivery-surface-collector/domain.md#report-export"]
```

Write the run's Markdown report — prompts, stages, output, QA evidence paths, monitoring
findings, the handoff note, the summary. Asking for another format still writes Markdown and says
so, rather than failing a run over a file extension.

No token counts, no per-stage cost, no context gauge. Nothing here observes a session, so those
numbers would be a column of zeroes reading as a measurement rather than as an absence — and a
caller must never fill them in by hand.
