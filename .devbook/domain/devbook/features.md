# Devbook

```meta
type: features
related: [".devbook/domain/context-map.md#devbook"]
```

> What this context lets a repository do, in the language of [naming.md](naming.md). Every one
> of them is observable from outside the plugin: a folder exists or it does not, a reference
> resolves or it does not, a brief was written or it was not.

## Adopt the Convention

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#devbook-folder", ".devbook/domain/devbook/domain.md#reconciler"]
```

Take the convention into a repository: the folders it wants, the rules both hosts apply on a
matching read, the check in CI, and a stamp recording what landed. One idempotent operation
covers first install, upgrade, a change of mind about which folders to keep, and an outstanding
migration.

### Adopt a Subset

```meta
type: sub-feature
```

Take `.domain` and `.arc42` and leave the rest. The tooling emits scopes for the folders that
exist, so a folder nobody adopted costs nothing — no empty index, no rule firing on a path that
is not there.

### Pick a Layout

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#flat-devbook-folders-only"]
```

Put the five folders at the repository root or under one `.devbook/` parent, and never both.
The address is the chapter's real path either way, so nothing else in the convention changes
with the choice.

### Deliver the Rules to Both Hosts

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#a-plugins-rules-reach-a-host-through-the-install", ".devbook/arc42/09-architecture-decisions.md#one-rule-one-wrapper-per-host"]
```

Neither host applies a rule that sits inside a plugin, so the install writes each one into the
repository as one body plus a wrapper per host. From then on the rule fires when either host
opens a matching chapter, with no skill, flow, or hook naming it first.

## Address a Chapter

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#chapter", ".devbook/domain/devbook/domain.md#chapter-address"]
```

Give a heading an address other chapters can point at, and a block that says what kind of thing
it is and where it stands. This is the feature the rest of the convention is built on: without
it there is no node, no edge, and nothing for a reference to resolve to.

### Carry a Meta Block

```meta
type: sub-feature
related: [".devbook/domain/devbook/domain.md#meta-block"]
```

Write the block in the same change as the content. `type` says what the thing is, `status` says
only what is in transition, and every optional field is omitted rather than written empty — so
one state never ends up with two spellings.

### Link a Test Case

```meta
type: sub-feature
related: [".devbook/domain/devbook/domain.md#test-reference"]
```

Name the tests that assert what the chapter claims, in a form a runner can be handed. A chapter
with no `tests` is not untested — it is unlinked, and the absence deliberately carries no
claim.

### Reserve an Extension Namespace

```meta
type: sub-feature
related: [".devbook/domain/plugin-authoring/naming.md#extension-namespace", ".devbook/domain/devbook-collaboration/domain.md#chapter-review"]
```

Let a plugin layered on top keep its own per-chapter state under `ext.<plugin>.<key>`, carried
through untouched and unvalidated. Without it, one remembered fact would cost a schema change,
a contract bump, and a migration in every consuming repository.

## Annotate a Chapter

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#annotation", ".devbook/arc42/09-architecture-decisions.md#comments-are-findings-until-the-fence-lands"]
```

Leave a review note in the chapter, beside the passage it is about, with an author, replies, and
a quoted anchor. Markdown stays canonical, so the note inherits position as its anchor and git
as its history — and resolving one means deleting it, because an open loop that survives its
resolution is a record nobody asked for.

One writer only: the annotations tool is the sole editor of a fence, and every caller imports
the same functions rather than reaching for a regular expression of its own.

## Derive the Indexes

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#reference-graph", ".devbook/domain/devbook/domain.md#index-generator"]
```

Walk the corpus and write the reference graph, the reading order, and the annotation index —
per repository and per adopted folder. Deterministic output is the point: a clean `git diff` is
the proof that what is committed matches what the chapters say.

### Check References

```meta
type: sub-feature
```

Fail on a reference that does not resolve, and warn on everything a reader can still work
around. That split is what lets the check run on every pull request without becoming something
people learn to ignore.

### Render the Graph

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#devbooks-canvas-carries-no-surface-word", ".devbook/arc42/09-architecture-decisions.md#devbook-still-ships-the-graph-canvas"]
```

Open the same graph the generator writes, as a canvas: chapters as nodes, references as edges,
and a chapter beside its parsed block. It imports the generator's own modules, which is why the
live view and the committed index cannot disagree.

## Convert Between Chapter and Code

```meta
type: feature
related: [".devbook/domain/devbook/domain.md#spec-converter", ".devbook/domain/devbook/naming.md#drift-verdict"]
```

Cross the boundary between what is written and what is built, in either direction, over five
kinds. The chapter is the spec, which is what the `spec` in each skill name refers to.

### Capture From Code

```meta
type: sub-feature
```

Read an implementation and its unit tests and write the chapter that was missing, thin, or
stale. Source and tests are the only evidence; comments, TODOs, and disabled tests are not. The
feature pass runs the application, because reading a controller tells you a route exists while
using the feature tells you what the product lets someone do.

### Brief From a Chapter

```meta
type: sub-feature
```

Turn an agreed chapter into a change brief — outcomes, invariants, ubiquitous language, out of
scope, acceptance checks — plus a change category, then stop. It reads code to establish what
is already there so the brief asks only for the delta, and it never names the flow that picks
the brief up.

## Migrate the Contract

```meta
type: feature
related: [".devbook/domain/plugin-authoring/naming.md#migration", ".devbook/arc42/tdr/3-devbook-rename-has-no-migration.md"]
```

Ship each breaking change to the schema as an immutable, idempotent migration whose `--check`
exits non-zero while work remains. Presence in the repository's ledger decides whether one
runs, never a comparison of version numbers — which is what makes re-running safe and a skipped
release replayable in order.
