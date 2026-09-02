---
name: orch-domain
description: 'Orchestrate changes to .domain/ — bounded-context domain model, features, model and flow diagrams, dependencies, and naming. Use for any create/update/refresh of .domain/context-map.md or a bounded context''s domain.md, features.md, model.md, flow.md, dependencies.md, or naming.md, including small refinements and new context scaffolding. Enforces knowledge-domain.instructions.md structure and templates and knowledge-chapter-metadata.instructions.md metadata blocks before saving.'
---

# Orchestrate Domain Knowledge (`.domain/`)

Route every `.domain/` change through this skill instead of editing the folder
directly, so bounded-context modeling stays consistent with
`domain-design:domain-architect`'s expertise and with the knowledge-folder
structure and metadata conventions.

## Input Expectations

- Target scope: root `context-map.md`, or one bounded context (existing or
  new) and which of its files (`domain.md`, `features.md`, `model.md`,
  `flow.md`, `dependencies.md`, `naming.md`) are in scope.
- Change goal (e.g. new aggregate, refined feature breakdown, new
  cross-context dependency, term/alias cleanup).
- Whether this is new bounded-context scaffolding or a refinement of an
  existing context.

If the scope or goal is not stated, derive it in Stage 1 from the request and
the existing `.domain/` contents, and continue.

## Workflow Stages

> Agent transitions require explicit user approval before switching. Cross-plugin
> agents are recommended, not required — if `domain-design:domain-architect` is
> not installed, perform the modeling step directly using the same instruction
> files and continue.

### Stage 1: Context Loading

- Load `knowledge-domain.instructions.md` and
  `knowledge-chapter-metadata.instructions.md` (task-scoped, not baseline
  context).
- Load only the relevant bounded-context files already in `.domain/` (not the
  whole folder) plus `.domain/context-map.md` for cross-context relationships.
- Note existing `related`/`depends-on`/`aliases` entries that the change may
  need to update elsewhere.
- If the scope was not given, derive the target context and files here and
  state them before continuing.

**Agents:** none (context loading only)

### Stage 2: Domain Modeling

- Hand off to `domain-design:domain-architect` for the actual modeling
  decisions: aggregate boundaries, invariants, domain services, domain
  events, feature breakdown, or naming/alias resolution.
- Record every aggregate's rules in its `### Invariants` table, one row per
  rule, with the `Enforced at` point named. A rule the session could not settle
  stays as an `open` row carrying the question — do not resolve a hot spot by
  choosing an answer for the domain expert, and do not drop it to make the table
  look finished.
- Draft or refresh content using the exact templates in
  `knowledge-domain.instructions.md` (`domain.md`, `features.md`, `model.md`,
  `flow.md`, `dependencies.md`, `naming.md`).
- Keep `model.md` structural (Mermaid class diagram) and `flow.md`
  lifecycle/process-oriented (Mermaid state/sequence diagrams) — do not mix
  the two.

**Agents:** `domain-design:domain-architect`

### Stage 3: Metadata & Cross-Reference Enforcement

- Add or update the chapter metadata block (`type` required, `status`
  optional;
  `related`, `issue`, `effort`, `roadmap` optional) on every new/edited
  Aggregate, Entity, Value Object, Enum, Domain Service, Domain Event, Shared
  Value Objects/Enums, Feature/Sub-feature, or Term chapter.
- Add or update the file-level metadata block on every touched file,
  including `context-map.md`, `model.md`, `flow.md`, and `dependencies.md`
  (which carry a file-level block only, no per-chapter blocks).
- Set `status` from this folder's allowed values: `draft`, `proposed`,
  `deprecated` (no `done`). `active` is the resting value and is written by
  **omitting the field** — remove the line when a chapter settles, and never
  write `status: active`.
- Never write `status: approved`, `approved-by`, or `approved-at`. That rung is
  the approval gate's to write and a person's to decide; an authoring skill that
  sets it approves its own work.
- Set `type` from this folder's value sets in
  `knowledge-domain.instructions.md`, and confirm the heading carries the name
  only — no `Aggregate:`, `Feature:`, `Sub-feature:`, or `Term:` prefix, and no
  `Domain:`/`Features:`/`Naming:` prefix on a file title.
- Update `depends-on` on `features.md` chapters and `aliases`/`related` on
  `naming.md` terms as needed; omit empty optional fields per the
  omit-when-empty rule.
- If a chapter heading or file was renamed or moved, update every `related`,
  or `depends-on` entry elsewhere that references its old
  `<path>#<heading-slug>` or `<path>`.

**Agents:** `domain-design:domain-architect`

### Stage 4: Consistency Review

- Confirm `naming.md` aliases still resolve to the correct canonical chapter
  via `related`.
- Confirm `dependencies.md` uses explicit DDD relationship terminology (ACL,
  Customer/Supplier, Partnership, OHS + Published Language) for every row.
- Confirm no new top-level metadata field was invented without updating
  `knowledge-chapter-metadata.instructions.md` or
  `knowledge-domain.instructions.md` first.
- Regenerate the derived index when the repository ships the generator:
  `node .github/tools/knowledge-meta/build.mjs --scope .domain`, and confirm it
  reports no broken references. If it reports problems, hand off to
  `knowledge-base-validate`.
- Summarize changed files/chapters for the user.

**Agents:** `domain-design:domain-architect`

## Usage Pattern

```text
Invoke: orch-domain
- Context: order-management
- Files: domain.md, features.md
- Goal: add a new "Split Order" aggregate behavior and its feature entry
```

## Output Expectations

- `.domain/` files updated following the exact templates in
  `knowledge-domain.instructions.md`.
- Every touched chapter and file carries a correct metadata block per
  `knowledge-chapter-metadata.instructions.md`.
- Cross-references (`related`, `depends-on`, `aliases`) kept in sync across
  the changed and any dependent files.
- Changed paths summarized for the user.

## Canvas Interface

This skill reports progress through the `orch-dashboard` canvas extension shipped
by the `copilot-app` plugin. If the extension is not installed, skip the canvas
calls below and continue through standard chat interaction. Follow the provider-safe
dashboard contract in `plugins/copilot-app/instructions/orch-shared-phases.instructions.md`;
prefer `extensionId: "plugin:copilot-app:orch-dashboard"` when opening or inspecting the
canvas.

- Open the dashboard per the shared contract, then call `start_run` with
  `skillId: "orch-domain"` and these stages: Context Loading, Domain
  Modeling, Metadata & Cross-Reference Enforcement, Consistency Review.
- Before each stage, call `update_stage` with `status: "in_progress"`.
- After each stage, call `update_stage` again with `status: "done"` (or
  `"blocked"`/`"skipped"`) and an `output` summary — e.g. modeling
  decisions, metadata fixes applied, or consistency findings.
- Call `finish_run` with the final status and a summary once the `.domain/`
  change is complete.
- During **Domain Modeling**, also open/update `mermaid-diagram` with any
  updated aggregate/context-map/event-flow diagram, per the `copilot-app`
  plugin's `instructions/canvas-usage.instructions.md`. Optional; skip
  gracefully if not installed.

## Reference

- `knowledge-domain.instructions.md`
- `knowledge-chapter-metadata.instructions.md`
- `assets/routing-snippet.md` — optional repository-local context-loading and
  routing policy; this plugin ships structure rules, not routing policy.
