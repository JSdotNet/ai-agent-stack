---
name: flow-create-mvp
description: 'Run Minimum Viable Product (MVP) creation — from an ad-hoc product idea or an approved MVP specification through planning, implementation, testing, local run, and monitoring with agent handoffs. Use for a first runnable product increment of any size; missing scope, feature priorities, or architecture context is derived in Stage 0 rather than being a reason to skip the flow.'
---

# Flow: Create MVP

Execute a complete MVP development workflow from planning through local run and monitoring using coordinated agents, reported through the bound surface.

> **Scope:** This skill covers MVP work whether or not a prior product or architecture
> flow ran. When an approved MVP scope, priority order, and architecture exist,
> Stage 0 is a short intake and Stage 1 proceeds as usual. When they do not — a product
> idea described in a sentence or two — Stage 0 derives them from the request and codebase. Missing
> inputs are a reason to run Stage 0, never a reason to skip this skill and implement
> inline.

## Input Expectations

**Required:**

- Project name, or a one-line description of the product idea.

**Derived in Stage 0 when absent:**

- Approved MVP specification or roadmap scope.
- Core features list with priority order.
- Acceptance criteria per core feature (at least one measurable criterion each).
- Target timeline or sprint allocation.
- Runtime validation target (e.g., local or cloud run + monitoring).
- Optional constraints (team size, technology preferences).

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/flow-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and internal transitions continue without separate user approval until
> Personal Validation.
>
> Model choice per stage follows `instructions/flow-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection). A category model
> applies only where the stage is delegated with an `Agent` call; an inline stage runs on
> the session's model.

### Stage 0: Scope Discovery

Run this stage first, always. It is a quick intake when an approved MVP scope
already exists, and a full derivation when it does not.

- **Restate the product outcome** the MVP must deliver, in one or two sentences, in the
  user's terms
- **Derive the core feature list** and cut it to the smallest set that makes the product
  usable; name what is deliberately out of scope
- **Derive a priority and delivery order** across those features
- **Derive at least one measurable acceptance criterion** per core feature
- **Identify the target codebase or greenfield starting point**, dependencies, and risks
- **Identify governing instructions** — the repository agent instructions bound to the `repo-instructions` slot, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Record the derived scope and assumptions** in the stage output and continue to Stage 1 unless escalation is required

Escalate instead of continuing when the product direction itself is the open question, or
when the MVP needs a new architectural decision or a documented target architecture before
implementation — recommend `flow-architecture` or `flow-adr` and ask the user. Product-definition work at that level belongs there, not here.

**Agents:** the flow-runner owns the decision half; the **Identify** bullets above are
delegated to a read-only search sub-agent per **Splitting Scope Discovery** in
`instructions/flow-execution-model.instructions.md`. `arc42:arc42` when the target architecture
needs shaping.

### Stage 1: MVP Scope Intake
- **Review the MVP scope recorded in Stage 0** and its acceptance criteria
- **Establish the initial domain vocabulary** — the handful of core concepts the MVP is about,
  named once here so the implementation does not invent competing terms per feature
- **Record feature priorities** and delivery order
- **Identify dependencies** and risks
- **Record the validation target** for the implementation run

**Agents:** `arc42:arc42`; `domain:domain` when the MVP defines a
new domain rather than extending a documented one. Keep it to the vocabulary and the context
boundaries — full domain modeling belongs to `flow-domain`.

### Stage 2: Implementation Planning
- **Break the recorded MVP into implementation slices**
- **Map API contracts and data models** to the current codebase
- **Plan integration points** with external services
- **Define the local runtime validation strategy**

**Agents:** `arc42:arc42`

### Stage 3: Implementation
- **Implement core features** using TDD approach
- **Build API endpoints** and services
- **Integrate UI/Frontend** (if applicable)

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once
in `instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new MVP functionality, so run the full automatic QA validation
   (Playwright smoke tests on core user flows plus `qa:qa-monitor` runtime monitoring,
   with evidence recorded).
3. **Personal Validation** — hand back to the user (no agent); present the code review and
   the recorded QA review, and start the application for the user to review.
4. **Create Pull Request** — only after explicit user approval.
5. **Documentation Update** — after the pull request exists, check whether the repository's
   governed documentation is now stale and, if so, update it and commit onto the PR branch;
   a clean no-op when nothing needs changing.
6. **Work Item Update** — when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
7. **Summary** — emit the run summary.

See `instructions/flow-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every flow.

## Usage Pattern

With an approved MVP scope:

```
Run MVP creation for:
- Project: "ReportingEngine"
- Core features:
  * User authentication
  * Report generation
  * Report export (PDF/Excel)
  * Basic scheduling
- Target: 4-week timeline
- Runtime target: Local or cloud run + monitoring
```

Ad-hoc product idea — Stage 0 derives the rest:

```
Run MVP creation for:
- Project: "Something that lets our users build and export their own reports"
```

## Feature Breakdown Example

```
Epic: "Reporting Engine MVP"
├── User Authentication
│   ├── Story: Implement JWT auth
│   ├── Story: Add login/logout endpoints
│   └── Story: Create admin panel
├── Report Generation
│   ├── Story: Build report template engine
│   ├── Story: Implement data querying
│   └── Story: Add report preview
├── Export Capabilities
│   ├── Story: PDF export
│   └── Story: Excel export
└── Scheduling
    ├── Story: Background job scheduler
    └── Story: Report delivery email
```

## Output Expectations

- MVP scope defined with prioritized feature breakdown.
- Architecture documented with API contracts and data models.
- Core features implemented with TDD approach.
- Unit and integration tests passing.
- All services start locally and report healthy status.
- Smoke tests pass on core user flows.
- Runtime readiness status recorded with evidence.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-create-mvp"` and these stages: Scope Discovery,
  MVP Scope Intake, Implementation Planning, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Scope Discovery**, present the restated product outcome, derived core feature
  list with priority order, and derived acceptance criteria as the stage output so the
  user can review them at Personal Validation.
- During **MVP Scope Intake**, also open/update `render_markdown`
  (`markdown-preview`) with the recorded MVP scope, and during **Implementation Planning**,
  open/update `render_markdown` with the architecture documentation and `render_diagram`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/surface-contract.instructions.md`. Optional; skip gracefully if not installed.
