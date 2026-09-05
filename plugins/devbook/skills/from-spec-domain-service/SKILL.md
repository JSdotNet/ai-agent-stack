---
name: from-spec-domain-service
description: 'From-spec direction (build), domain-service kind: turn an agreed but unbuilt `type: domain-service` chapter in .domain/<context>/domain.md into a change brief plus a change category, then stop.'
disable-model-invocation: true
---

# Build a domain service from its chapter

## Purpose

A domain service, policy, or process manager is modelled in
`.domain/<context>/domain.md` and agreed, and the application does not implement
it — or implements it without the coordination, the invocation path, or the
process state the chapter states. This skill reads the chapter and produces a
**change brief**: outcomes, invariants, ubiquitous language, out of scope,
acceptance checks, plus one change category.

Then it stops. It does not name a delivery skill, does not pick a scheduling or
messaging mechanism, and does not touch a source or test tree.

The invocation semantics in the chapter is the part of this brief that most
constrains delivery: a scheduled service and an event-triggered policy are
different work with different failure modes, and a brief that leaves it implicit
gets built as a plain command handler.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target chapter.** The `type: domain-service` chapter, as a
  `<path>#<heading-slug>` reference or by its heading name.
- **Target bounded context.** Derived from the chapter's path.
- **Repository root.** Default to the current working directory.

## Chapter status gate

Check `status` before anything else, per the protocol's status rules: `approved` and
`active` proceed; `draft` or `proposed` stops to confirm — say what the chapter claims and
that it is not agreed, then ask whether to build it as written or settle it first;
`deprecated` stops.

## Spec-to-code mapping

What each part of the chapter has to become, and where to look to see whether it
is already there:

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Heading (canonical name) | A type whose name resolves to this term through `naming.md` aliases | The context's domain project |
| Responsibility | Methods that accomplish what the chapter describes, and no transaction or transport concerns beyond it | Any existing near-equivalent, including logic inlined in a handler |
| Why not on an aggregate | The behaviour placed in a service rather than pushed onto one root | Whether the logic currently sits inside an aggregate that should not own it |
| Coordinated aggregates and policies | Each named aggregate loaded, mutated, or saved as the chapter states | Existing repository usage at the call sites |
| Invocation semantics | The specific invocation path the chapter names: a command handler, a scheduler registration, a read-only composition, or an event subscription | Existing registrations, routes, schedules, and subscriptions |
| Process state | Persisted in-flight state where the chapter says the process resumes | Any existing saga or correlation store |
| Transactional behaviour | One transaction or several, exactly as the chapter states | Existing transaction boundaries at the call sites |
| Events raised | Each event the service is supposed to publish, raised at the condition its chapter names, carrying every named payload field, with each named consumer subscribed | Existing publication sites, dispatch wiring, and handler registrations |

State the invocation semantics as a requirement in its own right, not as
context. "Event-triggered policy, subscribed to `OrderConfirmed`" is buildable;
"coordinates refunds" is not.

Where the chapter says the service coordinates aggregates in separate
transactions, the brief must say so and must state what happens when the second
one fails. That is the invariant a process manager exists to protect, and it is
the first thing lost when the semantics is left implicit.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `devbook-domain.instructions.md`, and
   `devbook-chapter-metadata.instructions.md`. Read the target chapter, the
   chapters of every aggregate it coordinates, the context's `naming.md`, and
   `dependencies.md` when it reaches across a context boundary.

2. **Apply the status gate.** Above. Do not proceed past a `draft`, `proposed`,
   or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Look for the service, and for the same logic
   inlined in a command handler or an aggregate. Read the registrations, the
   call sites, and the tests. The brief must not ask for work that is already
   done. Apply the protocol's evidence rules: a passing test is evidence the
   rule holds; a disabled test or a TODO promising it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `to-spec-domain-service`; the
   chapter is stale, not unbuilt. On `conflict`, stop and ask — a conflict never
   becomes a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** Collect the service's canonical term,
   the terms of every aggregate it coordinates, and the terms of any event that
   triggers it, each with its `aliases`.

7. **Draw the out-of-scope boundary.** Name what this change does not do: the
   aggregates' own invariants, the application-service layer that will call it,
   and any adjacent policy with its own chapter. An unstated boundary is the one
   that gets crossed.

8. **Derive the acceptance checks.** Turn each commitment into a statement a
   test can assert — that the service is reached by the invocation path the
   chapter names, that each coordinated aggregate is affected as stated, that
   the transactional behaviour holds, and for a process manager that an
   interrupted run resumes. State what the tests must establish; do not write
   them.

9. **Emit the change brief and stop.** Assemble the five parts and the change
   category per the protocol. Then stop. Do not open a source file for editing,
   do not create a test, do not name a delivery orchestration.

10. **Report.** Close with the protocol's report table, one row per chapter in
    scope, with the brief attached.

## Do not

- Do not edit the chapter. Building a chapter does not change it — if the
  chapter is wrong, that is a `conflict` or a `code-ahead` verdict, not an edit.
- Do not leave the invocation semantics implicit. Without it the service gets
  built as a plain command handler.
- Do not brief a `policy.md` file or a separate policy type. Process manager
  behaviour belongs to this service.
- Do not brief transaction control, authorization, or DTO mapping into the
  domain service. Those belong to the application layer.
- Do not choose the scheduler, message broker, or saga library. The brief states
  the semantics and the guarantee.
- Do not omit the failure behaviour when coordination spans transactions.

