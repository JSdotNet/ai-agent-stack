---
name: from-spec-design-component
description: 'From-spec direction (build), design-component kind: turn an agreed but unadopted component guideline in .design/component-libraries.md into a change brief plus a change category, then stop.'
disable-model-invocation: true
---

# Build a component guideline in code

## Purpose

`.design/component-libraries.md` records an agreed component recommendation the
product does not follow — a library not adopted, components hand-rolled where
the guideline says use the library, or hard-coded values where the token files
declare tokens. This skill reads the chapter and produces a **change brief**:
outcomes, invariants, ubiquitous language, out of scope, acceptance checks, plus
one change category.

Then it stops. It does not name a delivery skill, does not design a component,
and does not touch a source or test tree. **It also never adds, removes, or pins
a dependency** — that goes through the repository package-update workflow, and
the adopted result is recorded in `.tech`. A brief may state that a package is
required; it does not install it.

Where the repository has an authoritative design source, that source is the
authority behind the guideline, and the brief carries its rules through rather
than reinterpreting them.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target chapter.** The component chapter in `.design/component-libraries.md`,
  as a `<path>#<heading-slug>` reference.
- **Channel in scope.** Which front end this brief covers. The chapter records a
  recommendation per channel; a brief covers one at a time.
- **Repository root.** Default to the current working directory.

The status gate applies with `.design`'s ladder: `draft`, `active`,
`deprecated`, plus the shared `approved` rung. There is no `proposed`. A `draft` chapter needs confirmation
before a brief; a `deprecated` one is not built.

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
| Recommended library, per channel | The recommended library used for new and converted components in that channel | The front-end manifests and the import sites |
| Components in use | Library components used where the guideline says to use them, replacing hand-rolled equivalents | The hand-rolled components and their usage sites |
| Token usage | Every color, type, and spacing value referencing a declared token — no hard-coded literals | `color-scheme.md` and `typography-and-layout.md` against the styling in code |
| Known gaps | Gaps handled as the chapter says: an accepted hand-rolled component, or an accepted deviation | The current workarounds |
| Keyboard equivalence | Every pointer-only interaction operable without a pointer | `interaction-guidelines.md` against the current interaction code |
| Accessibility thresholds | The thresholds in `accessibility.md` met by the components as used | Contrast, focus handling, and labelling in the current code |

Component adoption is nearly always a **change to existing behaviour**, not new
functionality: something already renders, and the guideline asks it to render
through the library and its tokens instead. So the brief has to list the
replacement sites. "Adopt the library" without that list is not actionable.

The token and accessibility rules are the **invariants** here, and they are the
part most easily dropped: keyboard equivalence for every pointer-only
interaction, and every value referencing a declared token rather than a literal.
Write them out as invariants, with the token names.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `devbook-design.instructions.md`, and
   `devbook-chapter-metadata.instructions.md`. Read the target chapter,
   `color-scheme.md`, `typography-and-layout.md`, `interaction-guidelines.md`,
   and `accessibility.md`.

2. **Apply the status gate.** Above. Do not proceed past a `draft` or
   `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Find the current implementation: the
   hand-rolled components, the hard-coded values, and the pointer-only
   interactions. List every replacement site, since that list is the brief's
   substance. The brief must not ask for work that is already done. Apply the
   protocol's evidence rules: a passing test is evidence the rule holds; a
   disabled test or a TODO promising it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `to-spec-design-component`;
   the chapter is stale, not unbuilt. On `conflict`, stop and ask — a conflict
   never becomes a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** Use the component and token names the
   `.design` chapters declare, and the domain terms from
   `.domain/<context>/naming.md` for any user-facing copy, so the implementation
   does not introduce a third vocabulary.

7. **Draw the out-of-scope boundary.** Name what this change does not do: other
   channels, dependency changes (package-update workflow, recorded in `.tech`),
   visual redesign beyond what the guideline states, and wireframes or
   prototypes, which `.design` does not hold. An unstated boundary is the one
   that gets crossed.

8. **Derive the acceptance checks.** State checks a test or a lint rule can
   assert — no hard-coded value where a token is declared, every pointer-only
   interaction reachable by keyboard, the accessibility thresholds met, and the
   hand-rolled component no longer imported at the replacement sites. State what
   the tests must establish; do not write them.

9. **Emit the change brief and stop.** Assemble the five parts and the change
   category per the protocol. Then stop. Do not open a source file for editing,
   do not create a test, do not name a delivery orchestration.

10. **Report.** Close with the protocol's report table, one row per chapter in
    scope, with the brief attached.

## Do not

- Do not edit the chapter. Building a chapter does not change it — if the
  chapter is wrong, that is a `conflict` or a `code-ahead` verdict, not an edit.
- Do not add, remove, or pin a dependency. Name the requirement; the change goes
  through the package-update workflow and is recorded in `.tech`.
- Do not brief "adopt the library" without listing the replacement sites.
- Do not drop the token and keyboard-equivalence invariants. They are the rules
  the guideline exists to enforce.
- Do not design a component, a screen, or a visual treatment. The brief states
  the guideline and its checks.
- Do not brief a visual redesign beyond what the chapter states.
- Do not reinterpret a rule that came from the authoritative design source.
  Carry it through.
- Do not brief more than one channel at a time.
- Do not produce a wireframe or prototype. `.design` is guideline level only.

