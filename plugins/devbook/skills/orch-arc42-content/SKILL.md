---
name: orch-arc42-content
description: 'Orchestrate direct content edits to .arc42/ chapters — refreshing an existing chapter, section, or diagram. Use for updates to .arc42/<nn>-<name>.md content, structure, or diagrams, including small one-line corrections. Enforces knowledge-arc42.instructions.md structure and knowledge-chapter-metadata.instructions.md metadata blocks. DO NOT USE FOR: authoring a decision record (use orch-adr), a technical debt record (use orch-tdr), a full blueprint refresh (use orch-blueprint), or a multi-chapter architecture initiative (use orch-architecture or orch-arc42).'
---

# Orchestrate arc42 Content Edits (`.arc42/`)

Route direct `.arc42/` chapter edits through this skill so routine content
refreshes carry the required chapter-metadata blocks and follow the standard
chapter set, instead of being hand-edited. This skill is intentionally narrow:
it covers editing existing chapter content and diagrams. Route to the paired
plugin skill instead when the task is one of those specific flows:

- New or updated Architecture Decision Record: `orch-adr`.
- New or updated Technical Debt Record: `orch-tdr`.
- Full architecture blueprint generation or refresh: `orch-blueprint`.
- Multi-section architecture initiative spanning several chapters and guideline
  retrieval: `orch-architecture` or `orch-arc42`.

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

> Agent transitions require explicit user approval before switching. Cross-plugin
> agents are recommended, not required — if `architecture:architect` is not
> installed, perform the drafting step directly using the same instruction files
> and continue.

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

- Hand off to `architecture:architect` for the actual content: prefer Mermaid
  diagrams over long prose for building-block and runtime views.
- Keep the glossary aligned with the ubiquitous language defined per bounded
  context in `.domain/`, when the repository has adopted that folder.
- Only create a chapter file when it has real content — do not scaffold
  empty placeholders.

**Agents:** `architecture:architect`

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

**Agents:** `architecture:architect`

### Stage 4: Consistency Review

- Confirm no ADR/TDR content was restated instead of linked.
- Confirm diagrams use Mermaid rather than prose where feasible.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/knowledge-meta/build.mjs --scope .arc42`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `devbook-check`.
- Summarize changed chapters/sections for the user.

**Agents:** `architecture:architect`

## Usage Pattern

```text
Invoke: orch-arc42-content
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

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension shipped
by the `copilot-app` plugin. If the extension is not installed, skip the canvas
calls below and continue through standard chat interaction. Follow the provider-safe
dashboard contract in `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "orch-arc42-content"` and these stages: Context Loading, Content
  Drafting, Metadata Enforcement, Consistency Review.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. drafted chapter
  content, metadata fixes applied, or consistency findings.
- Call `finish_run` with the final status and a summary once the `.arc42/`
  chapter change is complete.
- During **Content Drafting**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted chapter content, per the `copilot-app`
  plugin's `instructions/canvas-usage.instructions.md`. Optional; skip
  gracefully if not installed.

## Reference

- `knowledge-arc42.instructions.md`
- `knowledge-chapter-metadata.instructions.md`
- `assets/routing-snippet.md` — optional repository-local context-loading and
  routing policy; this plugin ships structure rules, not routing policy.
