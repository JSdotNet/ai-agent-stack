---
name: orch-design
description: 'Orchestrate changes to .design/ — UX principles, color tokens, typography and layout, interaction guidelines, accessibility, and component libraries. Use for any create/update/refresh of .design/README.md, design-principles.md, color-scheme.md, typography-and-layout.md, interaction-guidelines.md, accessibility.md, component-libraries.md, or another guideline file, including small rule additions. Grounds guidance in the repository''s authoritative design source and enforces knowledge-design.instructions.md structure and knowledge-chapter-metadata.instructions.md metadata blocks before saving. DO NOT USE FOR: wireframes, user flows, prototypes, and UI reviews (use ux-design:ux-designer), UI implementation (use orch-feature or orch-bug), or UI dependency changes (use orch-update-packages).'
---

# Orchestrate Design Knowledge (`.design/`)

Route every `.design/` change through this skill instead of editing the folder
directly, so UX guidance stays grounded in the repository's authoritative design
source, consistent with `ux-design:ux-designer`'s expertise, and aligned with the
knowledge-folder structure and metadata conventions.

## Input Expectations

- Target scope: which `.design/` file(s) are in scope.
- Change goal (e.g. refresh the palette from the design source, add an
  interaction rule, re-evaluate a component library for a channel).
- Whether the change is a new guideline or a refinement of an existing one.

If the scope or goal is not stated, derive it in Stage 1 from the request and
the existing `.design/` contents, and continue.

## Non-Goals

- Wireframes, user flows, prototypes, and UI reviews — route those to
  `ux-design:ux-designer` directly (`ux-wireframe`, `ux-user-flow`,
  `ux-design-review`).
- UI implementation — route to `orch-feature` / `orch-bug`, which *consult*
  `.design/`.
- Adding or pinning UI dependencies — route to `orch-update-packages`.

## Workflow Stages

> Agent transitions require explicit user approval before switching. Cross-plugin
> agents are recommended, not required — if `ux-design:ux-designer` is not
> installed, perform the design step directly using the same instruction files
> and continue.

### Stage 1: Context Loading

- Load `knowledge-design.instructions.md` and
  `knowledge-chapter-metadata.instructions.md` (task-scoped, not baseline
  context).
- Load only the relevant `.design/` file(s), not the whole folder.
- Load `.arc42/` chapters only when the change depends on a documented
  constraint or stack decision — typically
  `.arc42/02-constraints.md#technical-constraints` and
  `.arc42/04-solution-strategy.md#technology-choices`.
- If the scope was not given, derive the target files here and state them
  before continuing.

**Agents:** none (context loading only)

### Stage 2: Authoritative Grounding

- Identify the repository's authoritative design source — a design-system MCP
  server, a published design system, or a brand specification — and query it for
  the guidance in scope, and for the color scheme and design tokens whenever
  `color-scheme.md` or `typography-and-layout.md` is touched.
- Materialize those values into the repository as concrete tokens; do not leave
  a bare link to the source.
- If the repository has no authoritative source, or the source is unavailable,
  say so explicitly, mark the affected chapters `status: draft`, and record the
  gap in the chapter.

**Agents:** none (retrieval only)

### Stage 3: Design Authoring

- Hand off to `ux-design:ux-designer` for the actual design decisions.
- Draft or refresh content following the structure and folder rules in
  `knowledge-design.instructions.md`.
- Apply the repository's own standing product rules on every edit — theme
  policy, save/auto-save behavior, canonical content format, and input
  affordances — when `.design/` or another governing document defines them. Do
  not import rules from another product.
- Keep rules prescriptive and testable; prefer tables and token names over
  prose, and reference tokens instead of repeating raw values.

**Agents:** `ux-design:ux-designer`

### Stage 4: Metadata & Cross-Reference Enforcement

- Add or update the file-level metadata block on every touched file and the
  chapter metadata block on every new/edited `##` chapter.
- Set `status` from this folder's allowed values: `draft` or `deprecated`.
  `active` is the resting value and is written by **omitting the field**; a
  settled chapter is left with an empty `meta` fence, which stays — it is what
  makes the heading addressable.
- Keep `related` entries pointing at valid `<path>#<heading-slug>` or `<path>`
  targets, and omit empty optional fields per the omit-when-empty rule.
- If a chapter heading or file was renamed or moved, update every `related`
  entry elsewhere (including in `.arc42/`) that references its
  old reference.

**Agents:** `ux-design:ux-designer`

### Stage 5: Consistency Review

- Confirm the edit did not contradict the repository's own standing design
  rules, and that any rule it changes was changed deliberately.
- Confirm every pointer- or gesture-based rule has a documented keyboard
  alternative and an announced state change in `accessibility.md`.
- Confirm tokens are declared once and referenced elsewhere, and that
  per-stack mapping guidance did not fork into divergent designs.
- Confirm no new top-level metadata field was invented without updating
  `knowledge-chapter-metadata.instructions.md` or
  `knowledge-design.instructions.md` first.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/knowledge-meta/build.mjs --scope .design`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `knowledge-base-validate`.
- Summarize changed files/chapters for the user.

**Agents:** `ux-design:ux-designer`

## Usage Pattern

```text
Invoke: orch-design
- Files: color-scheme.md, interaction-guidelines.md
- Goal: refresh the palette from the design source and add the
  drag-and-drop chapter-reorder rules
```

## Output Expectations

- `.design/` files updated following `knowledge-design.instructions.md`.
- Color and typography tokens traceable to the authoritative design source, or
  explicitly marked `draft` when no source was reachable.
- Every touched chapter and file carries a correct metadata block per
  `knowledge-chapter-metadata.instructions.md`.
- Cross-references kept in sync across the changed and any dependent files.
- Changed paths summarized for the user.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension shipped
by the `copilot-app` plugin. If the extension is not installed, skip the canvas
calls below and continue through standard chat interaction. Follow the provider-safe
dashboard contract in `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "orch-design"` and these stages: Context Loading, Authoritative
  Grounding, Design Authoring, Metadata & Cross-Reference Enforcement,
  Consistency Review.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. grounding sources
  used, drafted design content, or metadata/consistency findings.
- Call `finish_run` with the final status and a summary once the `.design/`
  change is complete.
- During **Design Authoring**, also open/update `markdown-canvas`
  (`markdown-preview`) with the drafted guideline content, per the
  `copilot-app` plugin's `instructions/canvas-usage.instructions.md`. Optional;
  skip gracefully if not installed.

## Reference

- `knowledge-design.instructions.md`
- `knowledge-chapter-metadata.instructions.md`
- `assets/routing-snippet.md` — optional repository-local context-loading and
  routing policy; this plugin ships structure rules, not routing policy.
