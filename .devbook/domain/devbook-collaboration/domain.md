# Devbook Collaboration

```meta
index: root
type: domain
related: [".devbook/domain/context-map.md#devbook-collaboration", ".devbook/arc42/adr/7-approved-is-a-status-rung.md"]
```

What this context is responsible for: that a chapter always says who owes the next move, and
that an approval on it was chosen by a person in the session that wrote it.

Inside the boundary: the review request, the reviewer, the findings that are still open, the
verdict, the approval decision, and the sweep that reports what is waiting on whom.

Outside it: what a chapter says, what its folder's rules are, and the schema the state is
stored in — all [Devbook](../devbook/domain.md)'s. This context adds no field to that schema
and needs no release of it: everything it remembers lives in the `ext` namespace devbook
reserves and never interprets.

## Chapter Review

```meta
type: aggregate
related: [".devbook/domain/devbook-collaboration/domain.md#review-pass", ".devbook/domain/devbook/domain.md#meta-block"]
```

One chapter's position in a review, held entirely in `ext.devbook-collaboration.*` keys inside
that chapter's own block. It is the consistency boundary because those keys are only ever
consistent together: a state without a reviewer says nobody owes anything, and a reviewer
without findings after `changes-requested` says the review was never written down.

Its lifecycle is deliberately short. The state exists to be cleared — an approved chapter
carries the decision and not the road to it — so the resting shape of a chapter in this context
is no keys at all.

### Invariants

| Rule | Enforced at | Evidence |
|---|---|---|
| Every remembered fact lives under `ext.devbook-collaboration.`, and this context writes no other field except devbook's `approved` rung | all mutations | untested |
| A chapter in `requested` or `changes-requested` names exactly one reviewer | `chapter-handoff()`, `chapter-review()` | untested |
| A `changes-requested` verdict carries at least one `open-<n>` finding | `chapter-review()` | untested |
| Findings are numbered from 1 with no gaps, one line each | `chapter-review()` | untested |
| Approval clears every key in this namespace in the same change that writes the rung | `chapter-approve()` | untested |
| No skill here writes `approved` without a person choosing it in that session | `chapter-approve()` | untested |
| Review state is never read as chapter content | convention | open — the rule is installed into the repository; nothing checks a reader obeyed it |

### Finding

```meta
type: entity
aliases: [open-n, comment, objection]
```

One unresolved objection, as one key — `open-1`, `open-2` — rather than an entry in a list. It
has identity within the review because it is resolved individually, and the flat key is what
lets it be removed without rewriting its siblings, in a block grammar that has no nesting.

One line is the whole budget. A finding that needs a paragraph is a review comment about the
chapter's content, and belongs in an [annotation](../devbook/domain.md#annotation) beside the
passage it is about.

### Reviewer

```meta
type: value-object
aliases: [assignee, owner]
```

One handle, name, or role — never a list. Two reviewers is two review passes, because a state
that says "awaiting someone" cannot tell you which of them the chapter is actually waiting for.

### Review State

```meta
type: enum
related: [".devbook/domain/devbook-collaboration/domain.md#review-pass"]
```

`requested`, `changes-requested`, `cleared`. Three values, each naming who owes the next move:
the reviewer, the author, and nobody. There is no `in-progress` — a review nobody has recorded
a verdict on is still `requested`, and inventing a fourth value would let a chapter sit in a
state that obliges no one.

## Approval

```meta
type: domain-service
aliases: [sign-off, agreed]
related: [".devbook/arc42/adr/7-approved-is-a-status-rung.md"]
```

The decision that writes devbook's own `approved` rung, with `approved-by` and `approved-at`,
and clears this context's namespace in the same change.

Invocation semantics: command-invoked, and never anything else. It is the one operation here
that writes a field this context does not own, so it runs only where a person chose it in that
session — not from a schedule, not as a consequence of a cleared review, and not on the
strength of a conversation a later session cannot read.

The behaviour does not live on the [Chapter Review](#chapter-review) aggregate because its
output leaves that aggregate entirely: the review state is deleted and a devbook field is set,
which is a coordination across two owners rather than a transition of one.

## Review Queue

```meta
type: domain-service
related: [".devbook/domain/devbook-collaboration/domain.md#review-pass"]
```

Sweeps the adopted folders and reports what is awaiting whom, and which approvals have gone
stale — an approval that no longer stands because the content moved under it.

Invocation semantics: query-oriented, and it writes nothing at all. It is a read across every
chapter in the repository rather than an operation on one, which is why it is a service and not
a method: no single [Chapter Review](#chapter-review) can answer *who is blocked right now*.

## Chapter Approved

```meta
type: domain-event
related: [".devbook/domain/devbook/domain.md#chapter", ".devbook/domain/devbook-collaboration/domain.md#approval"]
```

Published when a person approves a chapter. It is the one fact this context states in somebody
else's language: it is written into devbook's `status`, `approved-by`, and `approved-at`
fields, lands in git like any other change, and travels with the content rather than sitting in
flow configuration or in somebody's memory.

### Payload

- `status` — the shared `approved` rung, on top of whatever ladder the folder defines
- `approved-by` — one person, handle, or team; never a list
- `approved-at` — the day they approved it, `YYYY-MM-DD`

### Consumers

- **[Devbook](../devbook/domain.md)** — the rung is its field, and its check reports an
  approval that is unsigned or undated, or a record left behind on a chapter no longer claiming
  the rung.
- **[Delivery](../delivery/domain.md)** — a flow's approval gate reads whether a chapter it is
  about to build from was agreed, and never writes the rung itself.
- **Any reader of the chapter** — which is the point of recording it in the chapter rather than
  anywhere else.

### Published language rules

- **The rung is never a resting value and is never omitted to mean itself.** A chapter states
  it while the approval stands and drops back to its ordinary rung the moment the content
  changes.
- **`approved-by` and `approved-at` are written and deleted in the same change as the rung.**
  Either the approval is current and the status says so, or it has lapsed and the record comes
  out with it.
- **An approval is of what was read, not of the heading.** Nothing may re-assert it from a
  previous approval, a cleared review, or a version comparison.

## Ubiquitous Language

```meta
type: ubiquitous-language
```

> The terms this context owns that are not chapters above. A term naming an aggregate, service,
> event, or field carries its aliases on that chapter instead. Both of these keep two nearby ideas
> apart: a review is not an approval, and cleared is not agreed.

### Review Pass

```meta
type: term
date: 2026-09-08
aliases: [review, review state, review cycle]
related: [".devbook/domain/devbook-collaboration/domain.md#chapter-review", ".devbook/domain/devbook-collaboration/flow.md"]
```

One chapter's trip through `requested`, `changes-requested`, and `cleared`, held as keys in
that chapter's own block. Each value names who owes the next move — the reviewer, the author,
nobody — which is the only question the state exists to answer.

There is no fourth value for work in progress. A review nobody has recorded a verdict on is
still `requested`, and a state that obliges no one is a state that hides a stall.

### Stale Approval

```meta
type: term
date: 2026-09-08
aliases: [lapsed approval]
related: [".devbook/domain/devbook-collaboration/domain.md#review-queue"]
```

An approval still written on a chapter whose content has moved under it. It is a reporting
concept rather than a state: nothing transitions a chapter into it, and the queue sweep is what
surfaces it, because a chapter cannot notice its own approval has expired.
