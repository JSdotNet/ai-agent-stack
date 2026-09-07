# Delivery Surface Dashboard

```meta
type: naming
related: [".devbook/domain/context-map.md#delivery-surface-dashboard"]
```

> Four terms. *Surface*, *capability group*, and *MCP server* are kernel vocabulary and are
> defined once in [Plugin Authoring's registry](../plugin-authoring/naming.md).

## Run Record

```meta
type: term
date: 2026-09-08
aliases: [run, run store, run file]
related: [".devbook/domain/delivery-surface-dashboard/domain.md#run-record", ".devbook/domain/delivery/naming.md#run"]
```

One run as this context holds it: one JSON file, outside the repository, keyed by worktree path.

It is deliberately not called *the run*. [Delivery](../delivery/naming.md#run) owns the run; this
is a record of one, and the difference is that nothing here advances it, decides anything about
it, or is consulted before it continues.

## Viewer

```meta
type: term
date: 2026-09-08
aliases: [page, panel, dashboard]
related: [".devbook/domain/delivery-surface-dashboard/domain.md#viewer"]
```

One of the three pages — the run timeline, the diagram viewer, the document viewer — served two
ways from one file: inline where the host implements MCP Apps, and on a loopback origin where it
does not.

Everything a viewer needs beyond the contract's eleven tool names is served over the plugin's own
origin. A twelfth tool would make this implementation stop being swappable for one that declares
exactly the contract.

## Telemetry

```meta
type: term
date: 2026-09-08
aliases: [tool activity, token usage, insight panel]
related: [".devbook/domain/delivery-surface-dashboard/domain.md#telemetry"]
```

Tool calls, sub-agent use, and token usage, captured by a hook running on the host's tool events
and folded into the record.

The word carries one promise: **measured, never self-reported**. A caller that writes these
numbers by hand is publishing an estimate in a field readers take as a measurement, which is
worse than the empty panel a host without command hooks produces.

## Idleness

```meta
type: term
date: 2026-09-08
aliases: [stalled, abandoned]
related: [".devbook/domain/delivery-surface-dashboard/domain.md#handoff-marker"]
```

A run whose session ended or that nothing has advanced for hours. It is derived on read and never
stored, because a stored idleness is indistinguishable from a stale one.

A deliberately parked run is idle by every one of those signals and is not abandoned. The handoff
marker is the only thing that separates them — and separating them is what a later `start_run`
needs in order to reattach to one and refuse the other.
