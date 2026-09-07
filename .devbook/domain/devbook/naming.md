# Devbook

```meta
type: naming
related: [".devbook/domain/context-map.md#devbook"]
```

> The terms this context owns. The kernel vocabulary every plugin shares — plugin, layer,
> stamp, migration, host — stays in
> [Plugin Authoring's registry](../plugin-authoring/naming.md) and is not restated here.

## Chapter

```meta
type: term
date: 2026-09-08
aliases: [section, heading, node]
related: [".devbook/domain/devbook/domain.md#chapter"]
```

One heading that carries a `meta` fence, together with the block and the annotations anchored
inside it. The fence is what makes it addressable: a heading without one is prose belonging to
the chapter above it, and dropping a fence as noise silently removes the chapter from the graph
and from every reference pointing at it.

*Node* is the derived graph's word for the same thing and is used only when talking about the
graph. *Section* is loose English for a heading and is never a claim that the heading is
addressable.

## Meta Block

```meta
type: term
date: 2026-09-08
aliases: [meta fence, metadata block]
related: [".devbook/domain/devbook/domain.md#meta-block"]
```

The fenced `meta` (YAML) block directly under a heading: flat keys, no nesting. It is the only
place a chapter's kind, standing, and relationships are written, and its grammar being flat is
why the extension namespace spells itself `ext.<plugin>.<key>` rather than nesting.

An empty block is a correct block. The fence is the marker, not the content.

## Chapter Address

```meta
type: term
date: 2026-09-08
aliases: [reference, anchor, path#slug]
related: [".devbook/domain/devbook/domain.md#chapter-address"]
```

`<path>#<heading-slug>` for a chapter, `<path>` alone for a file: a repository-relative path
plus a GitHub-style slug of the heading text. There is no stored id anywhere in this
convention, deliberately — the address is what a Markdown viewer already resolves, so it cannot
go quietly out of sync with what is rendered.

## Annotation

```meta
type: term
date: 2026-09-08
aliases: [note, comment, thread]
related: [".devbook/domain/devbook/domain.md#annotation", ".devbook/arc42/09-architecture-decisions.md#comments-are-findings-until-the-fence-lands"]
```

A review note in a second fenced block inside the chapter, beside the passage it is about, with
an author, a quoted anchor, and replies. It is an open loop and not a record: resolving one
means deleting it.

*Comment* is the word the other half of this stack still uses for a single-line finding under
`ext.devbook-collaboration.open-<n>`. The two are the same intent one release apart, and the
migration is one pass.

## Reference Graph

```meta
type: term
date: 2026-09-08
aliases: [graph, graph.json]
related: [".devbook/domain/devbook/domain.md#reference-graph"]
```

Every chapter as a node and every resolved reference field as an edge, derived by walking the
corpus. It answers *what points at this*, which no chapter can hold about itself, and it is the
reason a reference is a schema field rather than an ordinary Markdown link.

## Derived Index

```meta
type: term
date: 2026-09-08
aliases: [_meta, generated index, build output]
related: [".devbook/domain/devbook/domain.md#index-generator", ".devbook/arc42/09-architecture-decisions.md#automation-owns-the-_meta-refresh"]
```

Anything under a `_meta/` folder: the graph, the reading order, and the annotation index,
emitted deterministically so a clean `git diff` proves they are current.

A session never reads one as a source of fact and never regenerates one. Two branches that each
touch one chapter both rewrite the same JSON, and the conflict is only resolvable by re-running
the generator — so the refresh belongs to automation, and the check that runs in a session
writes nothing.

## Adoption

```meta
type: term
date: 2026-09-08
aliases: [adopted folders, scope]
related: [".devbook/domain/devbook/domain.md#devbook-folder", ".devbook/domain/plugin-authoring/naming.md#devbook-folder"]
```

Which of the five folders a repository has taken on, and in which layout. It is partial by
design: the tooling emits scopes for the folders that exist, so a folder nobody adopted has no
index, no rule firing, and no line in a report.

Adoption is the convention's own install and never a flow's job — a folder flow in a repository
that has not adopted the folder stops and says so.

## Reconcile

```meta
type: term
date: 2026-09-08
aliases: [install, upgrade, sync]
related: [".devbook/domain/devbook/domain.md#reconciler", ".devbook/arc42/09-architecture-decisions.md#an-install-is-not-a-sync"]
```

Bringing a repository level with the installed release in one idempotent operation covering
first install, upgrade, a change of adopted folders, and an outstanding migration.

*Sync* is the word to avoid: it suggests two sides converging, and this one only ever moves the
repository toward the release, reporting what a person has customized rather than restoring it.

## Drift Verdict

```meta
type: term
date: 2026-09-08
aliases: [aligned, code-ahead, spec-ahead, conflict, unresolved]
related: [".devbook/domain/devbook/domain.md#spec-converter", ".devbook/domain/devbook/flow.md"]
```

Where a chapter and its implementation stand relative to each other, in five values. `aligned`
reports and stops, `code-ahead` and `spec-ahead` say which side moves, and `conflict` and
`unresolved` both stop and ask — never guess.

The verdict is what makes the two converter directions one subject rather than two. It is
established before anything is written, from source and tests alone.

## Test Reference

```meta
type: term
date: 2026-09-08
aliases: [tests entry, test link]
related: [".devbook/domain/devbook/domain.md#test-reference"]
```

`<level>:<runner>:<selector>` — a test that asserts what the chapter claims, in a form a runner
can be handed. This schema has no field linking a chapter to a source path, and this is the
reason it can have one linking to a test: a test entry that stops resolving fails a run, and a
path that stops resolving fails silently.
