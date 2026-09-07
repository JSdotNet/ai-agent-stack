# Devbook Collaboration

```meta
type: features
related: [".devbook/domain/context-map.md#devbook-collaboration"]
```

> Four things a team can do to a chapter, and one of them writes nothing. Each is observable
> from the chapter itself: open the block and the state says who owes the next move.

## Hand a Chapter to a Reviewer

```meta
type: feature
related: [".devbook/domain/devbook-collaboration/domain.md#chapter-review", ".devbook/domain/devbook-collaboration/naming.md#review-pass"]
```

Name the reviewer, set the state to `requested`, and produce the brief to send them. The value
is that the request survives the conversation it was made in — the next person to open the
chapter sees who it is waiting on, without anyone having to remember.

## Review a Chapter

```meta
type: feature
related: [".devbook/domain/devbook-collaboration/domain.md#finding"]
```

Read a chapter against its folder's rules and its own evidence, and record either
`changes-requested` with one finding per objection or `cleared` with none. A verdict with no
findings behind it is not a review, which is why the two are written in the same change.

### Record a Finding

```meta
type: sub-feature
```

Write one objection as one `open-<n>` key, one line long. It is removed individually when it is
resolved, which is what a flat, numbered key buys over a list entry in a block grammar that
does not nest.

### Clear a Review

```meta
type: sub-feature
```

Say that nothing is outstanding, without saying the chapter is approved. `cleared` obliges
nobody and grants nothing — it is the state that lets a chapter wait for an approver rather
than for a reviewer.

## Approve a Chapter

```meta
type: feature
related: [".devbook/domain/devbook-collaboration/domain.md#approval", ".devbook/domain/devbook-collaboration/domain.md#chapter-approved"]
```

Record that a person read this chapter and approved it, in devbook's own field, and clear this
context's namespace in the same change. An approved chapter carries the decision and not the
road to it.

The decision is the point: it is the gate a chapter passes before it becomes work, kept in the
chapter so it lands in the git history like any other change.

## Report the Queue

```meta
type: feature
related: [".devbook/domain/devbook-collaboration/domain.md#review-queue"]
```

Sweep the adopted folders and say what is awaiting whom, and which approvals have gone stale.
It writes nothing, which is what makes it safe to run at any point — including from a schedule,
where every other skill here would need a person.

## Install the Contract

```meta
type: feature
related: [".devbook/domain/plugin-authoring/naming.md#plugin-rule", ".devbook/arc42/09-architecture-decisions.md#a-plugins-rules-reach-a-host-through-the-install"]
```

Put this context's one rule in the repository, with a wrapper per host, so both hosts apply the
contract whenever either opens a chapter — rather than only when one of the four skills above
names it by path. It is stamped under `components.collaboration` like any other materialized
file.
