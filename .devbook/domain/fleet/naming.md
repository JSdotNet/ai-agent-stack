# Fleet

```meta
type: naming
related: [".devbook/domain/context-map.md#fleet"]
```

> Five words carry the whole shape. The kernel vocabulary — plugin, layer, tracker, gate — is
> defined once in [Plugin Authoring's registry](../plugin-authoring/naming.md).

## Sweep

```meta
type: term
date: 2026-09-08
aliases: [issue sweep, triage pass, fan-out]
related: [".devbook/domain/fleet/domain.md#sweep", ".devbook/domain/plugin-authoring/naming.md#fleet-skill"]
```

One pass over a backlog that triages it, claims what it picks, dispatches workers, waits, and
writes the brief. The session running it is held open throughout, and it can see none of the
sessions it started.

A sweep is not a flow and never becomes one: it owns no run, holds no gate, and its unit is a
queue rather than an item.

## Worker

```meta
type: term
date: 2026-09-08
aliases: [background session, resolver]
related: [".devbook/domain/fleet/domain.md#worker"]
```

One spawned session resolving one item in its own worktree. It cannot talk to the sweep or to
another worker, so everything it has to say it writes to a file — including that it failed.

## Park

```meta
type: term
date: 2026-09-08
aliases: [handoff, needs-validation]
related: [".devbook/domain/fleet/domain.md#worker-run", ".devbook/domain/delivery/naming.md#personal-validation"]
```

What a worker does when its change cannot prove itself: commit it, leave it in its worktree,
label the item `needs-validation`, and write a brief naming exactly what a person has to look at.

Parking is what an unattended run does wherever a gate would be. It is neither approval nor
failure, and the distinction matters — a parked change is finished work waiting on a judgement,
not broken work waiting on a fix.

## Claim

```meta
type: term
date: 2026-09-08
aliases: [pickup, in-progress]
related: [".devbook/domain/fleet/domain.md#pickup-state", ".devbook/domain/fleet/domain.md#issue-claimed"]
```

Taking an item for this sweep, recorded as a label on the tracker rather than in this context's
own files. The tracker is the transport because a claim has to be legible to a person who has
never heard of this plugin — a claim only the coordination folder knows about is not a claim.

## Triage Verdict

```meta
type: term
date: 2026-09-08
aliases: [relevance judgement]
related: [".devbook/domain/fleet/domain.md#triage-verdict"]
```

What one pass concluded about one item: pickable, colliding with work in flight, stale enough to
propose for closure, or excluded because its body carries text addressed to an agent.

A verdict is recomputed every sweep and remembered by none. The one thing that carries over is a
closure proposal nobody answered, which is recorded as unanswered and re-proposed — never read
as declined.

## Brief

```meta
type: term
date: 2026-09-08
aliases: [report, morning brief]
related: [".devbook/domain/fleet/domain.md#brief"]
```

The report a sweep writes once its workers finish: picked up, skipped and why, proposed for
closure, and how each worker ended. It is written from the manifest and the result files rather
than from memory, which is what makes a past sweep re-readable long after every session involved
has ended.
