# Devbook

```meta
type: skills
related: [".devbook/domain/context-map.md#devbook"]
```

> Fourteen skills: three that own the convention in a repository, and eleven that cross the
> boundary between a chapter and the code implementing it. None of them is a flow — this context
> ships the shape and the check, and the procedure for carrying a change belongs to the engine.

## install

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#reconciler", ".devbook/domain/devbook/flow.md"]
```

Bring a repository level with the installed release in one idempotent operation: detect, resolve,
plan, migrate, materialize, stamp and verify. First install, an upgrade, a change in which folders
are adopted, and an outstanding migration are the same run, and the stamp says which.

It is the only writer of everything it materializes — the rules and their per-host wrappers, the CI
workflows, the tooling, and one marker-fenced section of the repository's agent instructions.

### Leave a Customized File Alone

```meta
type: sub-feature
```

A materialized file that changed underneath is reported and left, never overwritten. An edit inside
a marker-fenced section makes the next reconcile skip the section, which is what the markers exist
for.

## devbook-check

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#reconciler", ".devbook/domain/devbook/domain.md#index-generator"]
```

The check-only half of the same protocol. It asks the same three questions — does the Markdown
satisfy the schema, is the migration ledger current, does the stamp still describe what is on disk
— then repairs what it can prove and hands every other write back.

Two writers for one file is how a reconcile stops being idempotent, which is why this half is
deliberately narrow.

## devbook-tech-update

```meta
type: feature
related: [".devbook/domain/delivery/skills.md#flow-tech"]
```

Refresh a repository's technology graph from deterministic package inventories, then analyse the
repository for what appears in no package manifest — runtimes, services, platforms, protocols,
tooling — and hand the authoring to the folder's own write path.

## to-spec-aggregate

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter", ".devbook/domain/devbook/flow.md"]
```

Read an implemented aggregate and write the chapter that was missing, thin, or stale — the root and
every entity, value object, and enum it owns, the shared groupings, and the events it raises.

The aggregate is the unit and not its parts: a consistency boundary decided twice is a boundary
decided differently.

## to-spec-domain-service

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

The deliberate exception to that rule. A domain service is defined by coordinating across
boundaries rather than living in one, so it keeps its own pass and owns the events it raises
itself.

## to-spec-feature

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

Read a shipped capability and write its chapter — and this is the one capture pass that **runs the
application**. Reading a controller tells you a route exists; using the feature tells you what the
product lets someone do, in what order, with what wording.

Screenshots are report evidence and are never committed into a devbook folder.

## to-spec-building-block

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

Read what a component actually is and write its building-block chapter in the architecture folder.

## to-spec-design-component

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

Read an implemented UI component and write its entry in the design folder's component library.

## from-spec-aggregate

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

Turn an agreed but unbuilt aggregate chapter into a change brief — outcomes, invariants, ubiquitous
language, out of scope, acceptance checks — plus a change category, then stop. It never edits a
source or test tree.

### Read Code Without Changing It

```meta
type: sub-feature
related: [".devbook/domain/devbook/domain.md#drift-verdict"]
```

Establishing what already exists is what lets the brief ask only for the delta, and it is how the
change category is decided: new functionality, a change to existing behaviour, or a defect.

## from-spec-domain-service

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

The same, for a domain service and the events it raises.

## from-spec-feature

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

The same, for a feature or sub-feature chapter. Which flow picks the brief up is the user's
decision, taken after reading it — no skill here names a code-side flow.

## from-spec-building-block

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

The same, for an agreed building-block chapter.

## from-spec-design-component

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter"]
```

The same, for an agreed design component.
