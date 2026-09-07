# Delivery Schedule

```meta
type: naming
related: [".devbook/domain/context-map.md#delivery-schedule"]
```

> Four words carry the shape, plus the term the whole context is named for. The kernel
> vocabulary is defined once in
> [Plugin Authoring's registry](../plugin-authoring/naming.md).

## Schedule

```meta
type: term
date: 2026-09-08
aliases: [routine, automation, trigger, cron entry]
related: [".devbook/domain/delivery-schedule/domain.md#schedule", ".devbook/domain/plugin-authoring/naming.md#schedule"]
```

A trigger that fires a procedure the stack already ships, in a cloud session that starts with
nothing but the repository: a cadence, a target, the plugins that target needs, and a
self-contained prompt.

**A schedule is a trigger and never a procedure.** The entry point is what runs; the schedule is
what asks.

Both hosts ship the capability under their own name — Routines in Claude Code, Automations in the
GitHub Copilot app — and neither is adopted, because adopting one would name a host.

## Entry Point

```meta
type: term
date: 2026-09-08
aliases: [schedule skill, schedulable procedure]
related: [".devbook/domain/delivery-schedule/domain.md#entry-point"]
```

A `schedule-*` skill that picks its own input, so it needs no person to hand it one. That single
property is what makes it schedulable: a procedure needing an argument needs a person, and a
person is what an unattended run does not have.

Every entry point is also runnable by hand, which is how one is tested before a cadence is
trusted.

## Catalog

```meta
type: term
date: 2026-09-08
aliases: [schedule catalog, trigger files]
related: [".devbook/domain/delivery-schedule/domain.md#schedule", ".devbook/domain/delivery-schedule/domain.md#catalog-check"]
```

The set of schedule files this plugin ships — the defaults, readable as defaults. A repository
selects from it and overrides a cadence in its own stamp rather than by editing the file, so an
upgrade can move a shipped default without silently reverting or silently keeping somebody's
choice.

## Preamble

```meta
type: term
date: 2026-09-08
aliases: [unattended rules]
related: [".devbook/domain/delivery-schedule/domain.md#prompt"]
```

The unattended rules every prompt starts with, stated once in one file: park rather than pass a
gate, never merge or approve or close or delete, publish as a pull request or a labelled issue,
update what the last run left open, carry nothing personal into the repository.

One file rather than six copies, because this is the most safety-critical prose in the plugin and
six copies drift.

## Scheduler

```meta
type: term
date: 2026-09-08
aliases: [the host's scheduler]
related: [".devbook/domain/delivery-schedule/domain.md#scheduler-resolution", ".devbook/tech/hosts.md#scheduled-cloud-sessions"]
```

Whatever the live session exposes that turns a name, a cron expression, a repository, and a
prompt into a scheduled session. It is resolved by capability and never named, and **absent is a
normal outcome** — the operation reports it and changes nothing.

The scheduler is also where everything personal lives: the environment, the model, and the entry
ids. Matching by name is what makes writing any of that into the repository unnecessary.
