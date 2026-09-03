---
name: orch-tech
description: 'Orchestrate changes to .tech/ — the technology graph of platforms, runtimes, frameworks, libraries, packages, services, and tools. Use for any create/update of .tech/technology-graph.md, shared.md, or a layer file, including adding a technology, pinning a version, promoting or retiring a status, or adding a layer. Enforces knowledge-tech.instructions.md structure and knowledge-chapter-metadata.instructions.md metadata blocks, and keeps the graph diagram in sync with depends-on edges.'
---

# Orchestrate Technology Knowledge (`.tech/`)

Route every `.tech/` change through this skill instead of editing the folder
directly, so the technology graph stays consistent with the architecture
decisions recorded in `.arc42/` and with the knowledge-folder structure and
metadata conventions.

## Input Expectations

- Target scope: `technology-graph.md`, `shared.md`, or one or more layer files.
  Layer names are repository-specific — read `technology-graph.md`'s layer table
  to find the layers this repository actually uses.
- Change goal (e.g. add a technology, pin a version, promote a `candidate` to
  `adopted`, retire a technology, add a new layer).
- Whether the change follows a decision already recorded in `.arc42/`, or is
  still an open choice.

If the scope or goal is not stated, derive it in Stage 1 from the request and
the existing `.tech/` contents, and continue.

## Workflow Stages

> Agent transitions require explicit user approval before switching. Cross-plugin
> agents are recommended, not required — if `architecture:architect` is not
> installed, perform the reasoning step directly using the same instruction files
> and continue.

### Stage 1: Context Loading

- Load `knowledge-tech.instructions.md` and
  `knowledge-chapter-metadata.instructions.md` (task-scoped, not baseline
  context).
- Load `.tech/technology-graph.md` plus only the layer files in scope.
- Load the grounding `.arc42` chapters only when the change touches a stack
  decision: typically `04-solution-strategy.md`, `07-deployment-view.md`, and
  `09-architecture-decisions.md`.
- If the scope was not given, derive the target files here and state them
  before continuing.

**Agents:** none (context loading only)

### Stage 2: Technology Reasoning

- Hand off to `architecture:architect` when the change implies a real decision
  (new technology, replacement, or status promotion/demotion).
- Confirm the technology belongs in exactly one layer; anything used by two or
  more layers belongs in `shared.md`.
- If the change is a genuine architecture decision, record it as an ADR first
  (`orch-adr`) and let `.tech` record the outcome with a `related` link.

**Agents:** `architecture:architect`

### Stage 3: Authoring & Metadata Enforcement

- Draft or update chapters using the technology chapter template in
  `knowledge-tech.instructions.md`; keep each chapter short.
- Add or update the chapter metadata block on every touched technology chapter:
  `status` and `type` required; `version`, `depends-on`, `alternatives`,
  `related`, `issue`, `effort`, `roadmap` optional and omitted when empty.
- Set `status` from this folder's ladder: `candidate`, `trial`, `adopted`,
  `hold`, `retired`.
- Never write `status: approved`, `approved-by`, or `approved-at`. That rung is
  the approval gate's to write and a person's to decide; an authoring skill that
  sets it approves its own work.
- Ensure every `depends-on` entry resolves to an existing `.tech` chapter; use
  `related` for `.arc42`/`.domain`/`.design` links instead.
- Update the file-level metadata block on every touched file.

**Agents:** `architecture:architect`

### Stage 4: Graph Sync & Review

- Update the Mermaid diagram in `.tech/technology-graph.md` so its nodes and
  edges match the `depends-on` fields exactly.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/knowledge-meta/build.mjs --scope .tech`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `devbook-check`.
- Update the layer table and "Open questions" section when layers or open
  choices change.
- Verify with the `knowledge-graph` canvas scoped to `.tech`, and with the
  `devbook-canvas` canvas (open the changed file; check the metadata/lint
  panel is clean apart from the intentional no-meta sections of
  `technology-graph.md`).
- Summarize changed files/chapters for the user.

**Agents:** `architecture:architect`

## Usage Pattern

```text
Invoke: orch-tech
- Files: backend.md, technology-graph.md
- Goal: promote ASP.NET Core Minimal APIs from candidate to adopted and pin the version
```

## Output Expectations

- `.tech/` files updated following `knowledge-tech.instructions.md`.
- Every touched chapter and file carries a correct metadata block per
  `knowledge-chapter-metadata.instructions.md`.
- All `depends-on` references resolve, and the graph diagram matches them.
- Changed paths summarized for the user.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension shipped
by the `copilot-app` plugin. If the extension is not installed, skip the canvas
calls below and continue through standard chat interaction. Follow the provider-safe
dashboard contract in `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "orch-tech"` and these stages: Context Loading, Technology
  Reasoning, Authoring & Metadata Enforcement, Graph Sync & Review.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. reasoning outcome,
  metadata fixes applied, or graph-sync verification results.
- Call `finish_run` with the final status and a summary once the `.tech/`
  change is complete.
- During **Graph Sync & Review**, also open/update the `knowledge-graph`
  canvas scoped to `.tech`, per the `copilot-app` plugin's
  `instructions/canvas-usage.instructions.md`. Optional; skip gracefully if
  not installed.

## Reference

- `knowledge-tech.instructions.md`
- `knowledge-chapter-metadata.instructions.md`
- `assets/routing-snippet.md` — optional repository-local context-loading and
  routing policy; this plugin ships structure rules, not routing policy.
