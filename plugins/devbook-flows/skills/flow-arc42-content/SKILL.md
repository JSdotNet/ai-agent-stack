---
name: flow-arc42-content
description: 'Run direct content edits to .arc42/ chapters — refreshing an existing chapter, section, or diagram. Use for updates to .arc42/<nn>-<name>.md content, structure, or diagrams, including small one-line corrections. Enforces knowledge-arc42.instructions.md structure and knowledge-chapter-metadata.instructions.md metadata blocks. DO NOT USE FOR: authoring a decision record (use flow-adr), a technical debt record (use flow-tdr), a full blueprint refresh or a multi-chapter architecture initiative (use flow-architecture or flow-arc42).'
---

# Flow: arc42 Content Edits (`.arc42/`)

Route direct `.arc42/` chapter edits through this skill so routine content
refreshes carry the required chapter-metadata blocks and follow the standard
chapter set, instead of being hand-edited. This skill is intentionally narrow:
it covers editing existing chapter content and diagrams. Route to the paired
plugin skill instead when the task is one of those specific flows:

- New or updated Architecture Decision Record: `flow-adr`.
- New or updated Technical Debt Record: `flow-tdr`.
- Full architecture blueprint generation or refresh: `flow-architecture`.
- Multi-section architecture initiative spanning several chapters and guideline
  retrieval: `flow-architecture` or `flow-arc42`.

## Input Expectations

- Target chapter(s): one or more of `01-introduction-and-goals.md` through
  `12-glossary.md`.
- Change goal (e.g. update a runtime view diagram, refresh quality
  requirements, add a glossary term).
- Whether the change touches an existing ADR/TDR link (link out, don't
  restate) rather than introducing new decision content.

If the target chapter or the change goal is not stated, derive it in Stage 1
from the request and the repository contents, and continue.

## Workflow Stages

> Agent transitions follow the shared rule in `flow-phases.instructions.md`, shipped by
> the `delivery` plugin: cross-plugin agents are recommended, not required, and internal
> transitions continue without separate user approval until Personal Validation. A role
> bound in `.github/ai-agent-stack.json` resolves before the agent named below.
>
> Model choice per stage follows `flow-model-selection.instructions.md` (category
> defaults, overridable via personal global model selection). A category model applies
> only where the stage is delegated with an `Agent` call; an inline stage runs on the
> session's model.

### Stage 1: Context Loading

- Load `knowledge-arc42.instructions.md` and
  `knowledge-chapter-metadata.instructions.md` (task-scoped, not baseline
  context).
- Load only the target chapter file(s) — not the whole `.arc42/` folder.
- Check `09-architecture-decisions.md` / `11-risks-and-technical-debt.md` for
  existing ADR/TDR links relevant to the change instead of duplicating their
  content inline.
- If the scope was not given, derive the target chapter(s) and the change goal
  here and state them before continuing.

**Agents:** none (context loading only)

### Stage 2: Content Drafting

- Hand off to `arc42:arc42` for the actual content: prefer Mermaid
  diagrams over long prose for building-block and runtime views.
- Keep the glossary aligned with the ubiquitous language defined per bounded
  context in `.domain/`, when the repository has adopted that folder.
- Only create a chapter file when it has real content — do not scaffold
  empty placeholders.

**Agents:** `arc42:arc42`

### Stage 3: Metadata Enforcement

- Add or update the chapter metadata block (`status` optional; `related`,
  `issue`, `effort`, `roadmap` optional) on the file's top-level chapter
  heading and on any independently trackable `##` section inside it.
- Because an `.arc42` file is always exactly one top-level chapter, that
  chapter's metadata block also serves as the file-level block — do not add
  a duplicate.
- Set `status` from this folder's allowed values: `draft`, `proposed`,
  `deprecated` (no `done`, and no `depends-on` field in this folder — use
  `related` for cross-references). `active` is the resting value and is written
  by **omitting the field**; a settled chapter with no relations is left with an
  empty `meta` fence, which stays — it is what makes the heading addressable.
- Never write `status: approved`, `approved-by`, or `approved-at`. That rung is
  the approval gate's to write and a person's to decide; an authoring skill that
  sets it approves its own work.
- If a chapter heading or file was renamed or moved, update every `related`
  entry elsewhere that references its old `<path>#<heading-slug>` or
  `<path>`.

**Agents:** `arc42:arc42`

### Stage 4: Consistency Review

- Confirm no ADR/TDR content was restated instead of linked.
- Confirm diagrams use Mermaid rather than prose where feasible.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/knowledge-meta/build.mjs --scope .arc42`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `devbook-check`.
- Summarize changed chapters/sections for the user.

**Agents:** `arc42:arc42`

### Final Phases (Shared)

This is a documentation/config flow: after the last stage it runs the shared closing
phases defined in `flow-phases.instructions.md` (`delivery` plugin), in order —
**Personal Validation → Create Pull Request → Work Item Update → Summary**. A bridge
plugin's flow names its own tier; the engine never names a skill above it.

## Usage Pattern

```text
Invoke: flow-arc42-content
- Chapter: 06-runtime-view.md
- Goal: refresh the checkout runtime sequence diagram after the refunds change
```

## Output Expectations

- `.arc42/<nn>-<name>.md` updated following the standard chapter set and
  template in `knowledge-arc42.instructions.md`.
- Every touched chapter/section carries a correct metadata block per
  `knowledge-chapter-metadata.instructions.md`.
- ADR/TDR content linked rather than duplicated.
- Changed paths summarized for the user.

## Surface Reporting

This flow reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the **Reporting Contract** in
`surface-contract.instructions.md` (`delivery` plugin) for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create
Pull Request gating. With no surface bound, skip these calls, say so once, and continue —
the `.arc42/` files stay the source of truth.

- Call `start_run` with `skillId: "flow-arc42-content"` and these stages: Context
  Loading, Content Drafting, Metadata Enforcement, Consistency Review, Personal
  Validation, Create Pull Request, Work Item Update, Summary.
- During **Content Drafting**, call `render_markdown` with the drafted chapter
  content. Optional; skip when no bound surface provides
  `delivery.surface.render@1`.

## Reference

- `knowledge-arc42.instructions.md` and `knowledge-chapter-metadata.instructions.md` — the
  structure and metadata rules, shipped by the `devbook` plugin.
- `flow-phases.instructions.md`, `flow-model-selection.instructions.md`, and
  `surface-contract.instructions.md` — the shared phase, model, and surface
  contracts, shipped by the `delivery` plugin.
- `devbook`'s `assets/routing-snippet.md` — optional repository-local
  context-loading and routing policy; a flow ships procedure, not routing policy.
