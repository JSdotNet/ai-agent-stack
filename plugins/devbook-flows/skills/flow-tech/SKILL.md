---
name: flow-tech
description: 'Run changes to .tech/ — the technology graph of platforms, runtimes, frameworks, libraries, packages, services, and tools. Use for any create/update of .tech/technology-graph.md, shared.md, or a layer file, including adding a technology, pinning a version, promoting or retiring a status, or adding a layer. Enforces devbook-tech.instructions.md structure and devbook-chapter-metadata.instructions.md metadata blocks, and keeps the graph diagram in sync with depends-on edges.'
---

# Flow: Technology Knowledge (`.tech/`)

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

- Load `devbook-tech.instructions.md` and
  `devbook-chapter-metadata.instructions.md` (task-scoped, not baseline
  context).
- Load `.tech/technology-graph.md` plus only the layer files in scope.
- Load the grounding `.arc42` chapters only when the change touches a stack
  decision: typically `04-solution-strategy.md`, `07-deployment-view.md`, and
  `09-architecture-decisions.md`.
- If the scope was not given, derive the target files here and state them
  before continuing.

**Agents:** none (context loading only)

### Stage 2: Technology Reasoning

- Hand off to `arc42:arc42` when the change implies a real decision
  (new technology, replacement, or status promotion/demotion).
- Confirm the technology belongs in exactly one layer; anything used by two or
  more layers belongs in `shared.md`.
- If the change is a genuine architecture decision, record it as an ADR first
  (`flow-adr`) and let `.tech` record the outcome with a `related` link.

**Agents:** `arc42:arc42`

### Stage 3: Authoring & Metadata Enforcement

- Draft or update chapters using the technology chapter template in
  `devbook-tech.instructions.md`; keep each chapter short.
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

**Agents:** `arc42:arc42`

### Stage 4: Graph Sync & Review

- Update the Mermaid diagram in `.tech/technology-graph.md` so its nodes and
  edges match the `depends-on` fields exactly.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/devbook-meta/build.mjs --scope .tech`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `devbook-check`.
- Update the layer table and "Open questions" section when layers or open
  choices change.
- Confirm every touched chapter and file carries a valid `meta` block, apart from
  the intentional no-meta sections of `technology-graph.md`; hand a failure to `devbook-check`.
- Summarize changed files/chapters for the user.

**Agents:** `arc42:arc42`

### Final Phases (Shared)

This is a documentation/config flow: after the last stage it runs the shared closing
phases defined in `flow-phases.instructions.md` (`delivery` plugin), in order —
**Personal Validation → Create Pull Request → Work Item Update → Summary**. A bridge
plugin's flow names its own tier; the engine never names a skill above it.

## Usage Pattern

```text
Invoke: flow-tech
- Files: backend.md, technology-graph.md
- Goal: promote ASP.NET Core Minimal APIs from candidate to adopted and pin the version
```

## Output Expectations

- `.tech/` files updated following `devbook-tech.instructions.md`.
- Every touched chapter and file carries a correct metadata block per
  `devbook-chapter-metadata.instructions.md`.
- All `depends-on` references resolve, and the graph diagram matches them.
- Changed paths summarized for the user.

## Surface Reporting

This flow reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the **Reporting Contract** in
`surface-contract.instructions.md` (`delivery` plugin) for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create
Pull Request gating. With no surface bound, skip these calls, say so once, and continue —
the `.tech/` files stay the source of truth.

- Call `start_run` with `skillId: "flow-tech"` and these stages: Context Loading,
  Technology Reasoning, Authoring & Metadata Enforcement, Graph Sync & Review, Personal
  Validation, Create Pull Request, Work Item Update, Summary.
- During **Graph Sync & Review**, call `render_diagram` with the updated
  `technology-graph.md` diagram. Optional; skip when no bound surface provides
  `delivery.surface.render@1`.

## Reference

- `devbook-tech.instructions.md` and `devbook-chapter-metadata.instructions.md` — the
  structure and metadata rules, shipped by the `devbook` plugin.
- `flow-phases.instructions.md`, `flow-model-selection.instructions.md`, and
  `surface-contract.instructions.md` — the shared phase, model, and surface
  contracts, shipped by the `delivery` plugin.
- `devbook`'s `assets/routing-snippet.md` — optional repository-local
  context-loading and routing policy; a flow ships procedure, not routing policy.
