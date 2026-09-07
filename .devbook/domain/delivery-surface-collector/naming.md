# Delivery Surface Collector

```meta
type: naming
related: [".devbook/domain/context-map.md#delivery-surface-collector"]
```

> Three terms. The kernel vocabulary — surface, MCP server, capability group — is defined once in
> [Plugin Authoring's registry](../plugin-authoring/naming.md).

## Run Record

```meta
type: term
date: 2026-09-08
aliases: [run, run store, run file]
related: [".devbook/domain/delivery-surface-collector/domain.md#run-record", ".devbook/domain/delivery-surface-dashboard/naming.md#run-record"]
```

One run kept for later: one JSON file, outside the repository, keyed by worktree path. The same
term the [dashboard](../delivery-surface-dashboard/naming.md#run-record) uses, holding the same
thing minus the telemetry — which is what one contract with two implementations is supposed to
look like.

## Headless

```meta
type: term
date: 2026-09-08
aliases: [no page, recorded rather than watched]
related: [".devbook/domain/delivery-surface-collector/domain.md#report-export"]
```

Recorded rather than shown: no page, no port, nothing rendered. `open_dashboard` answers with no
URL and says so once.

It is a property of this implementation and never a degraded state. For a scheduled run, an
unattended worker, or a terminal nobody is looking at, headless is the correct answer and a live
page would be the wrong one.

## Unanswered Group

```meta
type: term
date: 2026-09-08
aliases: [absent capability, not implemented]
related: [".devbook/arc42/09-architecture-decisions.md#a-surface-declares-only-the-contracts-tool-names"]
```

A capability group whose tool names this surface does not declare, so a caller resolving it finds
nothing.

Deliberately distinct from a stub. An unanswered group means the caller renders nowhere and knows
it; a stub means the caller believes a person saw something. That difference is why declaring a
name you do not implement is forbidden rather than discouraged.
