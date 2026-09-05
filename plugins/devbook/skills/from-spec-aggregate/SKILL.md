---
name: from-spec-aggregate
description: 'From-spec direction (build), aggregate kind: turn an agreed but unbuilt aggregate — the root plus its owned entities, value objects, and enums, and the domain events it raises — into a change brief plus a change category, then stop.'
disable-model-invocation: true
---

# Build an aggregate from its chapters

## Purpose

An aggregate is modelled in `.domain/<context>/domain.md` and agreed, and the
application does not implement it — or implements a version of it that falls
short of what the chapters now say. This skill reads the chapters, establishes
precisely what is missing, and produces a **change brief**: outcomes,
invariants, ubiquitous language, out of scope, acceptance checks, plus one
change category.

Then it stops. It does not name a delivery skill, does not pick an
implementation approach, and does not touch a source or test tree.

**The aggregate is built whole, in one brief.** The boundary is the unit of
work: an entity cannot be built before the root that owns its lifetime, a value
object's immutability is only meaningful inside the boundary that holds it, and
an event's trigger is a condition on the root's own transition. Splitting them
into separate briefs would produce work items that cannot land independently. So
one brief covers:

- The aggregate root — `type: aggregate`.
- Every owned `###` sub-chapter — `type: entity`, `type: value-object`,
  `type: enum`.
- Any `## Shared Value Objects` / `## Shared Enums` entry this aggregate needs
  that does not exist yet.
- Every `## <EventName>` chapter — `type: domain-event` — the root is supposed
  to raise.

**Domain services are not part of this brief.** A domain service is defined by
coordinating across boundaries rather than living in one, so it has its own
pair: `from-spec-domain-service`.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target aggregate.** The `type: aggregate` chapter in
  `.domain/<context>/domain.md`, as a `<path>#<heading-slug>` reference or by
  its heading name. Its owned sub-chapters and events come with it.
- **Target bounded context.** Derived from the chapter's path.
- **Repository root.** Default to the current working directory.

If the chapter does not exist, there is nothing to build — the request is either
a modelling task for the `.domain` flow or, if the aggregate is already in code, a
`to-spec-aggregate` pass.

## Chapter status gate

Check `status` before doing anything else, per the protocol's status rules:

- `approved` — proceed. A person has approved this chapter; that is what the
  rung is for.
- `active` — proceed.
- `draft` or `proposed` — stop and confirm. State what the chapter claims and
  that it is not yet agreed, then ask whether to build it as written or settle
  the chapter through the `.domain` flow first.
- `deprecated` — do not build. Report it and stop.

Apply the gate **per chapter**, not once for the aggregate. A root at `active`
with a sub-chapter still at `draft` is the common case, and the answer is to
brief the settled parts and name the unsettled ones as needing a decision — not
to build the draft silently because its parent is agreed.

## Spec-to-code mapping

### The aggregate root

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Heading (canonical name) | A root type whose name resolves to this term through `naming.md` aliases | The context's domain project |
| Identity | An id type and an assignment path — constructor argument, factory, or store-assigned | The root's constructor and factory methods |
| Responsibility | Public methods that let a caller do what the chapter describes, and nothing beyond it | The root's public surface |
| Consistency boundary | One transactional unit: a repository whose granularity is this root, owned collections held inline, other aggregates referenced by id | The repository interface and the persistence mapping |
| Invariants (one row of the `### Invariants` table each) | Enforcement at the row's `Enforced at` point — that constructor or that named transition — on the root itself, never in a caller | Guard clauses on the root itself |
| Lifecycle | The creation path plus exactly the state transitions the chapter allows — and no transition it does not | The mutating methods and any status field |

### Owned entities, value objects, and enums

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Entity identity | An id at the scope the sub-chapter states: globally unique, or unique within this aggregate | The entity's constructor and id type |
| Entity ownership | Held by the root and saved in its transaction — **never given a repository of its own** | The root's owned collections and the repository interface |
| Entity lifecycle | Creation through the root, and removal with the cascade behaviour stated | The root's mutating methods and the persistence mapping |
| Value object equality | Value equality: two instances with the same components are the same value | Any existing `Equals`, `GetHashCode`, or record declaration |
| Value object immutability | No setters; mutation returns a new instance | The type's members, if it exists |
| Validation rules | Construction that rejects every invalid instance, so an invalid one cannot exist | The constructor, factory, or parse path |
| Enum members | Exactly the members the sub-chapter names, and no others | The existing value set, if any |
| Shared placement | One shared type where the chapter is in the shared grouping — not a copy per aggregate | Existing near-duplicates across the context |

Two failure modes have to be forbidden in writing, because both are the default
outcome otherwise:

- **Giving an owned entity its own repository.** This is the single most common
  way an aggregate boundary is lost during implementation. The brief must say
  the entity gets no store of its own.
- **Copying a shared value object per aggregate.** Where the chapter places a
  type in the shared grouping, the brief must say **one type, shared**.

A primitive standing in for a value object — a `string` where the chapter says a
value object, an `int` where it says an enum — is the usual finding, and it
makes the category `change to existing behaviour` rather than
`new functionality`. List where the primitive currently appears; replacing it is
the bulk of the work and the brief is useless without that list.

### Domain events raised by this aggregate

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Trigger | A publication site at exactly the condition the chapter names — not broader, not narrower | The root method the chapter attributes it to |
| Payload | Every field the chapter names, with the shape it states, and no undeclared extras | The existing event type, if any |
| Consumers | Each named consumer subscribed and handling the event | Handler registrations and bus subscriptions |
| Published language rules | The stability and evolution rules the chapter states, honoured by the payload shape | Any existing versioning or schema handling |
| Dispatch mechanism | A dispatch path that can actually deliver what the rules promise | Existing dispatcher, outbox, or broker wiring |

Raising the event is rarely the whole change. Say explicitly which named
consumers must also be subscribed, and which are out of scope — an event with no
subscriber changes nothing observable, so a brief that stops at publication
describes work that cannot be accepted.

A missing payload field on an event that is already published is a **contract
change**, not an addition. Say so: existing consumers may need to tolerate it,
and that is part of the work.

An invariant the chapter states and the code does not enforce is the
highest-value line in the brief, and the one most likely to be dropped if it is
not written out. Never summarize the invariants as "as per the chapter".

The chapter's `### Invariants` table makes this mechanical. Carry each row into
the brief as its own invariant, quoting the `Rule` text rather than paraphrasing
it, and carry that row's `Enforced at` value with it — that is what says whether
the guard clause belongs in the constructor or in one transition, and it is
precisely the part an implementer cannot recover from the code. A row whose
`Evidence` is a passing test selector is already enforced: verify it and drop it
from the ask rather than briefing work that is done. A row whose `Evidence` is
`untested` still needs its acceptance check even where the guard clause already
exists — an unasserted rule is one refactor from being gone.

A row with `open` in `Enforced at` is **not briefed**. Nobody has agreed that
rule yet, so there is nothing to build from it and no acceptance check to derive.
Name it in the brief as needing a decision, exactly as the status gate names an
unsettled sub-chapter, and leave it out of the invariants list.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `devbook-domain.instructions.md`, and
   `devbook-chapter-metadata.instructions.md`. Read the target `##` chapter,
   every `###` sub-chapter under it, every event chapter it raises, the shared
   groupings it draws from, the context's `naming.md`, and `dependencies.md` for
   the cross-context relationships and published-language entries involved. Do
   not read the whole `.domain` folder.

2. **Apply the status gate.** Above, per chapter. Do not proceed past a `draft`,
   `proposed`, or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the aggregate exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists, including the tests.** Where a counterpart
   resolved, read it and its unit tests closely enough to say exactly which of
   the chapters' claims it already satisfies. A passing test asserting an
   invariant is evidence that invariant already holds, and asking for it again
   is noise in the brief. A disabled test asserting it, or a TODO promising it,
   is not — treat that rule as unbuilt. Look for the concept held as a bare
   primitive as well as under its own type.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts
   **per chapter** — the root, each sub-chapter, and each event can drift
   independently. `spec-ahead` is the case this skill exists for. On `aligned`,
   stop and say so. On `code-ahead`, hand that chapter's scope to
   `to-spec-aggregate`; it is stale, not unbuilt. On `conflict`, stop and ask. A
   conflict never becomes a `defect` brief on this skill's own authority; only a
   person decides which side is wrong.

6. **Extract the ubiquitous language.** Collect the canonical terms the change
   must use from the chapters and from `naming.md`, each with its `aliases`, so
   an implementation reuses existing surface names instead of inventing a new
   synonym. Include the root's term, every owned type's term, every enum
   member's term, each event's term and payload field terms, and the terms of
   any aggregate referenced by id.

7. **Draw the out-of-scope boundary.** Name what this change deliberately does
   not do: sibling aggregates in the same `domain.md`, any domain service that
   coordinates this aggregate, the `features.md` chapters that would consume it,
   cross-context integration in `dependencies.md`, consumer-side business
   behaviour beyond subscribing to an event, and any sub-chapter left unsettled
   by the status gate. An unstated boundary is the one that gets crossed.

8. **Derive the acceptance checks.** Turn each `### Invariants` row and each
   outcome into a statement a test can assert — one check per row, so the two
   counts match and a dropped rule is visible — that constructing the root or an owned type
   with an invalid value is rejected, that a forbidden transition throws, that
   two value objects with equal components are equal, that an owned entity is
   reachable and savable only through its root, that the enum has exactly the
   named members, that the event is raised on the named trigger **and not on the
   near-miss path**, that each named consumer receives it, and that another
   aggregate is reachable only by id. State what the tests must establish; do
   not write them.

9. **Emit the change brief and stop.** Assemble the five parts and the change
   category per the protocol. Then stop. Do not open a source file for editing,
   do not create a test, do not name a delivery orchestration.

10. **Report.** Close with the protocol's report table, one row per chapter in
    scope, with the brief attached.

## Output expectations

- Exactly one change category: `new functionality`,
  `change to existing behaviour`, or `defect`, with the reasoning for it.
- **Outcomes** — what is true once the aggregate is built, in the domain's
  language, observable rather than procedural.
- **Invariants** — one entry per `### Invariants` row, quoted in full, each
  carrying its `Enforced at` point and marked as already enforced (with the
  passing test that shows it) or not yet enforced. `open` rows are listed
  separately as decisions needed, never as invariants to build.
- **Ubiquitous language** — the canonical terms with their `naming.md` aliases,
  covering the root, owned types, enum members, and event payload fields.
- **Out of scope** — the adjacent chapters, services, and contexts this change
  does not touch, named explicitly.
- **Acceptance checks** — one checkable statement per invariant and outcome,
  phrased so a test can assert it.
- One brief for the whole boundary, with a verdict per chapter inside it.
- An explicit statement that no owned entity gets a repository of its own.
- For a shared value object or enum, an explicit "one shared type" instruction.
- Every call site where a concept currently appears as a bare primitive, listed.
- Per event: the trigger as a condition, every payload field, the consumers that
  must be subscribed as part of this change, whether this is a new contract or a
  change to a published one, and the delivery guarantee the rules commit to.
- Sub-chapters blocked by the status gate named as needing a decision, not
  silently built or silently dropped.
- The protocol's report table, with the verdict and the evidence behind it.
- No change to any file in the repository.

## Do not

- Do not edit source code, test code, or project files. This skill emits a
  brief.
- Do not name a code-side delivery or orchestration skill of any kind. The brief
  stops at the brief; which flow picks it up is the user's decision, made after
  reading it.
- Do not edit the chapters. Building a chapter does not change it — if the
  chapter is wrong, that is a `conflict` or a `code-ahead` verdict, not an edit.
- Do not build from a `draft` or `proposed` chapter without explicit
  confirmation, and never from a `deprecated` one.
- Do not apply the status gate once for the whole aggregate. Sub-chapters settle
  independently.
- Do not turn a `conflict` into a `defect` brief. Stop and ask which side is
  wrong.
- Do not summarize the invariants by reference. Write each one out; the
  reference is what gets lost.
- Do not brief an `open` row, and do not resolve one by picking the answer that
  suits the brief. An unsettled rule is a decision to ask for.
- Do not drop a row's `Enforced at` value. "Enforce this invariant" without the
  enforcement point is the paraphrase this table exists to prevent.
- Do not ask for work that already exists — read the counterpart and its passing
  tests first.
- Do not treat a TODO, a comment, or a disabled test as proof that something is
  already built.
- Do not brief a repository, store, or DAO for an entity the chapter places
  inside this aggregate.
- Do not brief a per-aggregate copy of a type the chapter placed in the shared
  grouping.
- Do not add enum members the chapter does not name because the code seems to
  need them. That is a modelling question for the `.domain` flow.
- Do not brief publication of an event without saying which consumers must
  subscribe.
- Do not treat adding a field to an already-published event as an addition. It
  is a contract change.
- Do not choose a representation, a persistence strategy, a dispatch mechanism,
  or a project layout. The brief states what must be true, not how.
- Do not brief a domain service alongside the aggregate. That is
  `from-spec-domain-service` scope.
- Do not extend the pass into `features.md`, `model.md`, `flow.md`, or
  `dependencies.md` — `features.md` is `from-spec-feature` scope, and the rest are
  out of scope for every skill in this plugin.
