---
name: flow-domain
description: 'Run changes to .domain/ — bounded-context domain model, features, model and flow diagrams, dependencies, and naming. Use for any create/update/refresh of .domain/context-map.md or a bounded context''s domain.md, features.md, model.md, flow.md, dependencies.md, or naming.md, including small refinements and new context scaffolding. Enforces knowledge-domain.instructions.md structure and templates and knowledge-chapter-metadata.instructions.md metadata blocks before saving.'
---

# Flow: Domain Knowledge (`.domain/`)

Route every `.domain/` change through this skill instead of editing the folder
directly, so bounded-context modeling stays consistent with
`domain:domain`'s expertise and with the knowledge-folder
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

- Hand off to `domain:domain` for the actual modeling
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

**Agents:** `domain:domain`

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

**Agents:** `domain:domain`

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
  `devbook-check`.
- Summarize changed files/chapters for the user.

**Agents:** `domain:domain`

### Final Phases (Shared)

This is a documentation/config flow: after the last stage it runs the shared closing
phases defined in `flow-phases.instructions.md` (`delivery` plugin), in order —
**Personal Validation → Create Pull Request → Work Item Update → Summary**. A bridge
plugin's flow names its own tier; the engine never names a skill above it.

## Usage Pattern

```text
Invoke: flow-domain
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

## Surface Reporting

This flow reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the **Reporting Contract** in
`surface-contract.instructions.md` (`delivery` plugin) for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create
Pull Request gating. With no surface bound, skip these calls, say so once, and continue —
the `.domain/` files stay the source of truth.

- Call `start_run` with `skillId: "flow-domain"` and these stages: Context Loading,
  Domain Modeling, Metadata & Cross-Reference Enforcement, Consistency Review, Personal
  Validation, Create Pull Request, Work Item Update, Summary.
- During **Domain Modeling**, call `render_diagram` with any updated aggregate,
  context-map, or domain-event-flow diagram. Optional; skip when no bound surface
  provides `delivery.surface.render@1`.

## Reference

- `knowledge-domain.instructions.md` and `knowledge-chapter-metadata.instructions.md` — the
  structure and metadata rules, shipped by the `devbook` plugin.
- `flow-phases.instructions.md`, `flow-model-selection.instructions.md`, and
  `surface-contract.instructions.md` — the shared phase, model, and surface
  contracts, shipped by the `delivery` plugin.
- `devbook`'s `assets/routing-snippet.md` — optional repository-local
  context-loading and routing policy; a flow ships procedure, not routing policy.
