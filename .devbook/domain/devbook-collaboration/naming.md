# Devbook Collaboration

```meta
type: naming
related: [".devbook/domain/context-map.md#devbook-collaboration"]
```

> Five terms, and three of them exist to keep two nearby ideas apart: a review is not an
> approval, a finding is not an annotation, and cleared is not agreed.

## Review Pass

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

## Finding

```meta
type: term
date: 2026-09-08
aliases: [open-n, comment, objection]
related: [".devbook/domain/devbook-collaboration/domain.md#finding", ".devbook/domain/devbook/naming.md#annotation"]
```

One unresolved objection, one line, one flat key numbered from 1. Flat and numbered because the
block grammar does not nest and a finding has to be removable without rewriting its siblings.

*Comment* is the loose word for the same thing and is avoided here, because devbook now ships a
threaded [annotation](../devbook/naming.md#annotation) that is what a comment should be. A
finding is the older, thinner shape; an objection needing a paragraph belongs in a fence beside
the passage.

## Reviewer

```meta
type: term
date: 2026-09-08
aliases: [assignee, owner]
related: [".devbook/domain/devbook-collaboration/domain.md#reviewer"]
```

The one handle, name, or role a chapter is waiting on. Singular by rule: two reviewers is two
passes, because a chapter that is *awaiting someone* cannot tell you who is actually blocking
it.

*Owner* is not this. Whoever wrote the chapter owns it throughout; the reviewer holds only the
next move.

## Approval

```meta
type: term
date: 2026-09-08
aliases: [sign-off, agreed]
related: [".devbook/domain/devbook-collaboration/domain.md#approval", ".devbook/arc42/09-architecture-decisions.md#approved-is-a-status-rung"]
```

A person's recorded decision that they read this chapter and approved it, written as devbook's
own rung with a signature and a date, in the session where the person chose it.

Never inferred, never a consequence of `cleared`, and never re-asserted from a previous
approval. It is of what was read, not of the heading, so it comes off the moment the content
changes.

## Stale Approval

```meta
type: term
date: 2026-09-08
aliases: [lapsed approval]
related: [".devbook/domain/devbook-collaboration/domain.md#review-queue"]
```

An approval still written on a chapter whose content has moved under it. It is a reporting
concept rather than a state: nothing transitions a chapter into it, and the queue sweep is what
surfaces it, because a chapter cannot notice its own approval has expired.
