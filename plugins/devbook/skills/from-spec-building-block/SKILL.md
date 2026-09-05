---
name: from-spec-building-block
description: 'From-spec direction (build), building-block kind: turn an agreed but unbuilt structure in .arc42/05-building-block-view.md into a change brief plus a change category, then stop.'
disable-model-invocation: true
---

# Build the building block view in code

## Purpose

`.arc42/05-building-block-view.md` describes a decomposition that is agreed and
the solution does not have — a block that does not exist, a responsibility split
that has not happened, or a dependency direction the code violates. This skill
reads the chapter and produces a **change brief**: outcomes, invariants,
ubiquitous language, out of scope, acceptance checks, plus one change category.

Then it stops. It does not name a delivery skill, does not choose a project
layout or a refactoring sequence, and does not touch a source or test tree.

A structural brief's invariants are almost entirely about **dependency
direction** — which block may reference which. That is the part a delivery pass
cannot recover from the code, since the code is precisely what does not satisfy
it yet, and it is checkable, which makes it the heart of the acceptance checks.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target chapter or section.** `.arc42/05-building-block-view.md`, or one `##`
  section of it, as a `<path>#<heading-slug>` reference.
- **Repository root.** Default to the current working directory.

The status gate applies to the chapter's own `status`. `.arc42` uses `draft`,
`proposed`, `active`, `deprecated`; a structural change is expensive to reverse,
so confirm before building from anything below `active`.

## Chapter status gate

Check `status` before doing anything else, per the protocol's status rules:

- `approved` — proceed. A person has approved this chapter; that is what the
  rung is for.
- `active` — proceed.
- `draft` or `proposed` — stop and confirm. State what the chapter claims and
  that it is not yet agreed, then ask whether to build it as written or settle
  the chapter through the `.arc42` flow first.
- `deprecated` — do not build. Report it and stop.

## Spec-to-code mapping

What each part of the view has to become, and where to look to see whether it is
already there:

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Level 1 blocks | Each documented unit existing and running independently | The solution's runnable projects and the AppHost or compose declarations |
| Level 2 blocks | Each documented module existing as a unit others depend on | The current projects, namespaces, and feature folders |
| Responsibilities | Each block owning what the chapter assigns it, and not owning what it assigns elsewhere | The current public surfaces and what depends on them |
| Interfaces | The documented reach path existing: route, contract, public API, or injected abstraction | The current API surfaces and contracts |
| Dependencies between blocks | Only the documented edges, in the documented direction | Every current project, package, and client reference crossing a block line |
| Diagram | The real dependency graph matching the drawn one | The reference graph as it stands |

The acceptance checks for a structural brief are mostly **negative and
mechanical**: block A does not reference block B; nothing outside block C
reaches its internals; the reference graph has no cycle. Those are assertable by
an architecture test or a reference check, and they are what keeps the structure
from eroding after the change lands. State them as checks, not as prose.

Where the change is a move or a split rather than an addition, the category is
`change to existing behaviour` and the brief must list the current locations.
"Extract the module" without the list is not actionable.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `devbook-arc42.instructions.md`, and
   `devbook-chapter-metadata.instructions.md`. Read the target chapter or
   section, `03-context-and-scope.md` for the system boundary, and
   `09-architecture-decisions.md` for the decisions that constrain the
   structure.

2. **Apply the status gate.** Above. Do not proceed past a `draft`, `proposed`,
   or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Establish the current structure: the projects,
   the references, the dependency-container registrations, and the existing
   architecture tests, if any. List every current location of anything the
   chapter says must move. The brief must not ask for work that is already done.
   Apply the protocol's evidence rules: a passing test is evidence the rule
   holds; a disabled test or a TODO promising it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `to-spec-building-block`; the
   chapter is stale, not unbuilt. On `conflict`, stop and ask — a conflict never
   becomes a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** Use the block names the chapter uses,
   and the `.domain` bounded context terms the blocks align with, so a new
   project or namespace is named as the architecture names it rather than
   inventing a third vocabulary.

7. **Draw the out-of-scope boundary.** Name what this change does not do:
   behaviour changes of any kind, the deployment topology in
   `07-deployment-view.md`, package or version choices, and other sections of
   the view not in this pass. An unstated boundary is the one that gets crossed.

8. **Derive the acceptance checks.** State each documented dependency edge as a
   positive check and each absent edge as a negative one, assertable by an
   architecture or reference test, plus a no-cycle check on the reference graph.
   State what the tests must establish; do not write them.

9. **Emit the change brief and stop.** Assemble the five parts and the change
   category per the protocol. Then stop. Do not open a source file for editing,
   do not create a test, do not name a delivery orchestration.

10. **Report.** Close with the protocol's report table, one row per chapter in
    scope, with the brief attached.

## Output expectations

- Exactly one change category: `new functionality`,
  `change to existing behaviour`, or `defect`, with the reasoning for it.
- **Outcomes**, **invariants**, **ubiquitous language**, **out of scope**, and
  **acceptance checks**, as the protocol defines them.
- The target structure stated as blocks with responsibilities and permitted
  dependency edges.
- Negative acceptance checks — which block must not reference which — assertable
  as architecture or reference tests.
- A no-cycle check on the reference graph.
- Every current location of anything that must move, listed, when the change is
  a move or a split.
- An explicit statement that behaviour does not change, where the brief is
  purely structural.
- The protocol's report table, with the verdict and the evidence behind it.
- No change to any file in the repository.

## Do not

- Do not edit source code, test code, project files, or infrastructure files.
  This skill emits a brief.
- Do not name a code-side delivery or orchestration skill of any kind. The brief
  stops at the brief; which flow picks it up is the user's decision, made after
  reading it.
- Do not edit the chapter. Building a chapter does not change it — if the
  chapter is wrong, that is a `conflict` or a `code-ahead` verdict, not an edit.
- Do not build from a `draft` or `proposed` chapter without explicit
  confirmation, and never from a `deprecated` one.
- Do not turn a `conflict` into a `defect` brief. Stop and ask which side is
  wrong.
- Do not ask for work that already exists — read the counterpart first.
- Do not treat a TODO, a comment, or a disabled test as proof that something is
  already built.
- Do not brief a behaviour change alongside a structural one. Say explicitly
  that behaviour is unchanged, and keep it that way.
- Do not omit the negative dependency checks. Without them the structure erodes.
- Do not brief "extract the module" without listing the current locations.
- Do not choose the project layout, the folder names, or the refactoring order.
  The brief states the target structure and the checks.
- Do not brief deployment topology. No skill in this plugin covers it; route it
  through the `.arc42` flow.
- Do not brief package or version changes. Those go through the repository
  package-update workflow and are recorded in `.tech`.
