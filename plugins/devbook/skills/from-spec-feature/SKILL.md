---
name: from-spec-feature
description: 'From-spec direction (build), feature kind: turn an agreed but unbuilt `type: feature` or `type: sub-feature` chapter in .domain/<context>/features.md into a change brief plus a change category, then stop.'
disable-model-invocation: true
---

# Build a feature from its chapter

## Purpose

A capability is described in `.domain/<context>/features.md` and agreed, and the
product does not offer it — or offers part of it, missing sub-features the
chapter names. This skill reads the chapter and produces a **change brief**:
outcomes, invariants, ubiquitous language, out of scope, acceptance checks, plus
one change category.

Then it stops. It does not name a delivery skill, does not design a user
interface or an API, and does not touch a source or test tree.

A feature brief is the one place in this family where the outcomes are the
substance: a feature chapter is written in business language, so what the brief
carries forward is user-observable behaviour, with the invariants coming from
the `domain.md` chapters the feature exercises.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target chapter.** The `type: feature` or `type: sub-feature` chapter, as a
  `<path>#<heading-slug>` reference or by its heading name.
- **Target bounded context.** Derived from the chapter's path.
- **Repository root.** Default to the current working directory.

## Chapter status gate

Check `status` before doing anything else, per the protocol's status rules:

- `active` — proceed.
- `draft` or `proposed` — stop and confirm. State what the chapter claims and
  that it is not yet agreed, then ask whether to build it as written or settle
  the chapter through `orch-domain` first.
- `deprecated` — do not build. Report it and stop.

## Spec-to-code mapping

What each part of the chapter has to become, and where to look to see whether it
is already there:

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Heading (canonical name) | A capability a user can name, reachable in the product | The reachable endpoints, screens, commands, and jobs |
| Capability description | The user-facing behaviour the chapter describes, reachable end to end | Existing partial paths that already deliver some of it |
| Sub-features | Each `type: sub-feature` chapter delivered, or explicitly deferred | Which parts already exist |
| `feature-flag` | The named flag key existing and gating the capability | The application flag catalog and the flag checks in code |
| `depends-on` | Every prerequisite feature already delivered before this one starts | The referenced chapters and their own counterparts |
| `related` domain chapters | The aggregates, events, and services the capability exercises, present and correct | `domain.md` and its counterparts |

Check `depends-on` before anything else. A feature whose prerequisites are
themselves unbuilt cannot be briefed as one change: report the prerequisite
chain and let the user decide the order. Briefing a dependent feature as though
its prerequisites exist produces work that cannot land.

The invariants for a feature brief come from the `related` `domain.md` chapters,
not from the feature chapter itself — `features.md` describes capability, and
the rules live with the model. Pull them in; do not paraphrase them. They are
rows of those chapters' `### Invariants` tables, so quote them row by row with
each row's `Enforced at` point, and leave `open` rows out of the invariants list
— report them as decisions the feature depends on.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-domain.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read the target chapter, its
   `###` sub-feature chapters, every chapter named in `depends-on`, the
   `related` `domain.md` chapters, and the context's `naming.md`.

2. **Apply the status gate.** Above. Do not proceed past a `draft`, `proposed`,
   or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Trace how much of the capability is already
   reachable — endpoints, screens, commands, jobs — and whether the named flag
   key exists. Read the acceptance tests that touch the area. The brief must not
   ask for work that is already done. Apply the protocol's evidence rules: a
   passing test is evidence the rule holds; a disabled test or a TODO promising
   it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `to-spec-feature`; the
   chapter is stale, not unbuilt. On `conflict`, stop and ask — a conflict never
   becomes a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** Collect the capability's canonical term,
   the terms of the aggregates and events it exercises, and the flag key, each
   with its `aliases`, so the implementation names things as the domain names
   them.

7. **Draw the out-of-scope boundary.** Name what this change does not do:
   sub-features the chapter lists but this pass defers, sibling features in the
   same file, and the aggregate modelling work that would be a separate build
   pass. An unstated boundary is the one that gets crossed.

8. **Derive the acceptance checks.** Turn each outcome into a statement a test
   can assert, in user terms — that the capability is reachable, that it behaves
   as described under the flag, that each in-scope sub-feature works, and that
   the invariants from the `related` domain chapters hold. State what the tests
   must establish; do not write them.

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
- The `depends-on` chain checked, with any unbuilt prerequisite reported before
  the brief rather than assumed.
- Outcomes stated as user-observable behaviour in business language.
- Invariants pulled from the `related` `domain.md` chapters, quoted rather than
  paraphrased.
- Each sub-feature marked in scope or deferred, explicitly.
- The feature flag named, with whether it must be created as part of this
  change.
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
- Do not brief a feature whose `depends-on` prerequisites are themselves unbuilt
  without reporting the chain first.
- Do not invent invariants for a feature. They come from the `related`
  `domain.md` chapters.
- Do not design the user interface, the API shape, or the screen flow. The brief
  states the capability and its acceptance checks.
- Do not infer that a feature is delivered because its flag exists, or
  undelivered because it does not.
- Do not silently defer a sub-feature the chapter names. Deferral is stated.
