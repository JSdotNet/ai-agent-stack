# Devbook Config

```meta
type: naming
related: [".devbook/domain/context-map.md#devbook-config"]
```

> Four terms. The kernel vocabulary — plugin, layer, stamp, migration — is defined once in
> [Plugin Authoring's registry](../plugin-authoring/naming.md), and the stack config's four keys
> belong to [Delivery](../delivery/naming.md#stack-config).

## Engine Key

```meta
type: term
date: 2026-09-08
aliases: [bindings, extensions, policy, gates]
related: [".devbook/domain/devbook-config/domain.md#engine-configuration", ".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key"]
```

One of the four top-level keys of `.devbook/config.json` that the engine owns and this context
writes. Everything else in that file is a `components.<name>` stamp belonging to the component
that materialized it.

The word marks the boundary rather than the file: one file, two kinds of key, and nobody writes
another owner's.

## Scope Verdict

```meta
type: term
date: 2026-09-08
aliases: [reconcile, blocked, frozen, adoptable, available, out-of-scope]
related: [".devbook/domain/devbook-config/domain.md#scope-verdict"]
```

What an update does with one component, derived from three orthogonal facts: installed on this
machine, enabled in this checkout, stamped in this repository.

`blocked` carries the rule the whole vocabulary exists for. A stamp is shared and installed-ness
is personal, so a component this machine lacks is skipped and left stamped — dropping the entry
would un-adopt it for everyone on the next commit.

## Report

```meta
type: term
date: 2026-09-08
aliases: [stack report, read-only report]
related: [".devbook/domain/devbook-config/domain.md#stack-report", ".devbook/domain/devbook-config/domain.md#fact-source"]
```

The read-only model behind every answer this context gives, printing the path behind each fact and
naming the files that were absent as well as the ones that were read.

Naming the source is what makes an answer checkable rather than authoritative, and it is why an
empty table here reads as *this file was not there* rather than as *there is nothing*.

## Adoption Drift

```meta
type: term
date: 2026-09-08
aliases: [.ai drift]
related: [".devbook/domain/devbook-config/domain.md#adoption-drift"]
```

Where the adoption record no longer matches what is installed, enabled, and wired. It is a
report and never an edit: the derivable half of that folder goes stale on every upgrade and is
what the report already prints, while the half that rates whether people actually work that way
is on no disk anywhere.

Reporting drift is inside this context's subject; writing the chapter is a flow's.
