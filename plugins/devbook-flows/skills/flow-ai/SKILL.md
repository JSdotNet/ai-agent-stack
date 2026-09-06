---
name: flow-ai
description: 'Run changes to .ai/ — the record of how this project develops with AI: which practice, agent, skill, hook, model, or guardrail is used at which stage of the development flow, the concepts underneath them, and how far adoption has got. Use for any create/update of .ai/adoption-map.md, a stage file, or concepts.md, including adding a usage, promoting or retiring an adoption status, and adding a stage. Enforces devbook-ai.instructions.md structure and devbook-chapter-metadata.instructions.md metadata blocks, and keeps the adoption map in sync with the stage files. DO NOT USE FOR: registering the tool itself with its version and vendor (use flow-tech), or AI shipped inside the product (use flow-arc42-content, flow-domain, or flow-tech).'
---

# Flow: AI Knowledge (`.ai/`)

Route every `.ai/` change through this skill instead of editing the folder
directly, so the record of how the team works with AI stays consistent with the
technology registry in `.tech/` and with the knowledge-folder structure and
metadata conventions.

`.ai` is organized by the **development flow**: a stage file per position in how
the work actually happens, and a chapter per thing used there. The single
question every chapter answers is "at this point in how we work, what do we use
AI for, and is that real yet?".

## Input Expectations

- Target scope: `adoption-map.md`, one or more stage files, or `concepts.md`.
  Stage names are repository-specific — read `adoption-map.md`'s stage table to
  find the stages this repository actually uses.
- Change goal (e.g. record a new usage, promote a `trial` to `adopted`, retire a
  practice, add a stage, add a concept).
- Whether the tool underneath the usage is already registered in `.tech/`.

If the scope or goal is not stated, derive it in Stage 1 from the request and
the existing `.ai/` contents, and continue.

Agent transitions follow `flow-phases.instructions.md` and per-stage model choice
`flow-model-selection.instructions.md`, both shipped by the `delivery` plugin. A role
bound in `.github/ai-agent-stack.json` resolves before the agent a stage names.

## Stage 1: Context Loading

- Load `devbook-ai.instructions.md` and
  `devbook-chapter-metadata.instructions.md` (task-scoped, not baseline
  context).
- Load `.ai/adoption-map.md` plus only the stage files in scope.
- Load `.tech/tooling.md` (or the layer file registering the tool) only when the
  change involves a tool that has to be linked with `depends-on`.
- If the scope was not given, derive the target files here and state them
  before continuing.

**Agents:** none (context loading only)

## Stage 2: Placement & Boundary Check

Three questions, in this order, before anything is written:

1. **Is this a `.ai` fact at all?** A tool with a vendor and a version is a
   `.tech` chapter. A decision about how we work is a `.ai` chapter. AI shipped
   inside the product is `.arc42`/`.domain`/`.tech`. Route it away rather than
   writing it here.
2. **Which stage?** The stage where the usage is *used*, not where the tool is
   configured. A usage that genuinely differs across stages is several chapters,
   one per stage; one idea applied throughout is a `concept` in `concepts.md`
   carrying a `stage` list.
3. **Is the tool registered?** If the chapter needs a `depends-on` into `.tech`
   and the technology has no chapter there, hand off to `flow-tech` first and
   come back — an unresolved `depends-on` fails the check.

State the placement decision and its reasoning before authoring.

**Agents:** `spec-builder:spec-builder` when the change concerns harness assets
themselves — an agent, skill, plugin, hook, or workflow this repository owns.
Otherwise none.

## Stage 3: Authoring & Metadata Enforcement

- Draft or update chapters using the chapter template in
  `devbook-ai.instructions.md`; keep each chapter short.
- Fill **Adopted by** and **Evidence** honestly. These are the two lines that
  keep `status` from becoming a wish list; `none yet` is a legitimate and useful
  value.
- Add or update the chapter metadata block on every touched chapter: `status`
  and `type` required; `depends-on`, `stage`, `related`, `issue`, `effort`,
  `roadmap`, `date`, `tests` optional and omitted when empty.
- Set `status` from this folder's ladder: `candidate`, `trial`, `adopted`,
  `hold`, `retired`. A demotion is a normal, valuable edit — never soften one.
- Never write `status: approved`, `approved-by`, or `approved-at`. That rung is
  the approval gate's to write and a person's to decide; an authoring skill that
  sets it approves its own work.
- Omit `stage` in a stage file; set it on `concepts.md` chapters.
- Retire rather than delete: a usage that was dropped keeps its chapter, with
  `status: retired` and a sentence on why.
- Update the file-level metadata block on every touched file.

**Agents:** `spec-builder:spec-builder` (harness assets) or none.

## Stage 4: Map Sync & Review

- Update `adoption-map.md` so its stage table and Mermaid diagram match the
  stage files and their chapters exactly.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/devbook-meta/build.mjs --scope .ai`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `devbook-check`.
- Confirm every `depends-on` resolves to an existing `.tech` or `.ai` chapter,
  and that no `.tech` chapter was made to point back at `.ai` — that link is
  one-way.
- Confirm every touched chapter and file carries a valid `meta` block, apart from
  the intentional no-meta sections of `adoption-map.md`; hand a failure to `devbook-check`.
- Summarize changed files/chapters, and call out every status change explicitly
  — a promotion or demotion is the part of this change a reader cares about.

**Agents:** none

## Final Phases (Shared)

This is a documentation/config flow: after the last stage it runs the shared closing
phases defined in `flow-phases.instructions.md` (`delivery` plugin), in order —
**Personal Validation → Create Pull Request → Work Item Update → Summary**. A bridge
plugin's flow names its own tier; the engine never names a skill above it.

## Surface Reporting

Follow the **Reporting Contract** in `surface-contract.instructions.md` (`delivery`
plugin). With no surface bound, skip the calls, say so once, and continue — the files on
disk stay the source of truth.

- `start_run` with `skillId: "flow-ai"` and these stages: Context Loading,
  Placement & Boundary Check, Authoring & Metadata Enforcement, Map Sync & Review,
  Personal Validation, Create Pull Request, Work Item Update, Summary.
- During **Map Sync & Review**, call `render_diagram` with the updated
  `adoption-map.md` diagram. Optional; skip when no bound surface provides
  `delivery.surface.render@1`.

## Reference

- `devbook-ai.instructions.md` and `devbook-chapter-metadata.instructions.md` — the
  structure and metadata rules, shipped by the `devbook` plugin.
- `devbook-tech.instructions.md` — the registry `.ai` links into with
  `depends-on`.
- `devbook`'s `assets/routing-snippet.md` — optional repository-local
  context-loading and routing policy; a flow ships procedure, not routing policy.
