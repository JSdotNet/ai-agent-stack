# Delivery

```meta
type: naming
related: [".devbook/domain/context-map.md#delivery"]
```

> The terms this context owns. The kernel vocabulary — plugin, layer, role, tracker, surface,
> host slot, extension point, gate — is defined once in
> [Plugin Authoring's registry](../plugin-authoring/naming.md); what appears here is either
> unique to the engine or a refinement that only makes sense inside it.

## Run

```meta
type: term
date: 2026-09-08
aliases: [execution, session run]
related: [".devbook/domain/delivery/domain.md#run"]
```

One execution of one flow over one unit of work, held in one session. It is what a surface
tracks, what a report is written from, and what a resumed session reattaches to.

One item per run, always. A run split across sessions is two runs, and the mechanism that would
split one lives in another context precisely so that this sentence stays true.

## Stage

```meta
type: term
date: 2026-09-08
aliases: [step]
related: [".devbook/domain/delivery/domain.md#stage"]
```

One step of a run, and the unit of resumption: a handed-over run comes back on the stage it
left. A stage is a prompt rather than a program, which is why configuration can choose among
stages and never write one — encoding "apply TDD, escalate when the request needs a new
decision" as JSON either drops the prose or buries paragraphs in strings.

## Flow

```meta
type: term
date: 2026-09-08
aliases: [flow skill, staged procedure]
related: [".devbook/domain/plugin-authoring/naming.md#flow-skill", ".devbook/domain/delivery/domain.md#flow"]
```

A staged procedure for one category of work, `flow-<category>`, run start to finish in one
session and ending at Personal Validation. The prefix is what marks its scope against its
neighbours — `fleet-` spans sessions, `phase-` is a step inside a flow, `schedule-` runs with
nobody watching.

## Phase

```meta
type: term
date: 2026-09-08
aliases: [shared step, phase skill]
related: [".devbook/domain/delivery/domain.md#phase"]
```

A step several flows run identically, defined once and invoked by a flow rather than directly.
Update Base opens every tier and is named by no skill; the closing set differs per tier, so a
flow names its own.

## Tier

```meta
type: term
date: 2026-09-08
aliases: [phase tier, closing tier]
related: [".devbook/domain/delivery/domain.md#phase-tier"]
```

Which closing phases a flow runs — code-modifying or documentation. It follows from the change
kind rather than from preference, and a flow shipped by a higher layer declares its own,
because the engine never enumerates a skill in a layer above it.

## Change Kind

```meta
type: term
date: 2026-09-08
aliases: [change category]
related: [".devbook/domain/delivery/domain.md#change-kind"]
```

What kind of change this run makes: new functionality, a change to existing behaviour, a
defect, a dependency update, or documentation. Resolved once and early, because two separate
decisions depend on it — which tier closes the run, and how deep QA validation goes.

## Flow Runner

```meta
type: term
date: 2026-09-08
aliases: [runner, sequencer]
related: [".devbook/domain/delivery/domain.md#flow-runner"]
```

The one agent this context ships: it sequences the stages, resolves the configuration, tracks
the run, and enforces the gate. It is deliberately not a provider — the thing that enforces a
gate must not be a thing a provider can be.

## Personal Validation

```meta
type: term
date: 2026-09-08
aliases: [the gate, approval gate]
related: [".devbook/domain/plugin-authoring/naming.md#gate", ".devbook/domain/delivery/domain.md#gate"]
```

The mandatory gate every flow ends at, and an instance of the gate pattern rather than a second
mechanism. It uses no agent and no model: it hands control back to the person and waits.

It is the thing [Fleet](../fleet/naming.md#park) trades away and the thing an unattended run
parks at. Wherever a run cannot reach it, something else has to guarantee that nothing merges
unread.

## PR Lane

```meta
type: term
date: 2026-09-08
aliases: [pull-request lane, delivery lane]
related: [".devbook/domain/delivery/domain.md#pull-request-lane"]
```

How a finished change is opened for review: push the branch, level it with its base, fix the
failing checks, score it against the merge-ready checklist. Raising the pull request is the
host's own action rather than a skill.

Also a [host slot](../plugin-authoring/naming.md#host-slot) of the same name, which is what the
`deliver` service reads: unbound, it writes file artifacts and opens nothing.

## Stack Config

```meta
type: term
date: 2026-09-08
aliases: [config.json, delivery config]
related: [".devbook/domain/delivery/domain.md#stack-config", ".devbook/arc42/05-building-block-view.md#stack-config"]
```

`.devbook/config.json` — one file, two kinds of key. `bindings`, `extensions`, `policy`, and
`gates` are this context's; each `components.<name>` stamp belongs to that component's own
install skill. Nobody writes another owner's key.

Reading it is not adopting devbook: the path is a path, and the engine reads it with no devbook
folder present.

## Provider

```meta
type: term
date: 2026-09-08
aliases: [implementation, binding target]
related: [".devbook/domain/delivery/domain.md#extension-point", ".devbook/domain/delivery/domain.md#binding"]
```

Whatever a repository names to fill an extension point. A service has exactly one and a chore
has zero or more; a provider never performs a gate on its own behalf, and a chore's provider
never changes an outcome.

The word is deliberately not *plugin*. What fills a point may be a plugin's skill, a repo-native
skill, or nothing at all, and the point's contract is the same in every case.
