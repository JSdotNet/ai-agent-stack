---
name: flow-create-module
description: 'Create a new module in an existing project — from an ad-hoc "we need a module for X" request or an approved module specification through planning, implementation, testing, local run, and monitoring. Use for new modules and for carving an existing area into a module; missing specification, boundaries, or architecture context is derived in Stage 0 rather than being a reason to skip the flow.'
---

# Flow: Create Module

Execute a complete workflow for adding a new module to an existing project using a local-first validation approach.

> **Scope:** This skill covers module work whether or not a prior specification or
> architecture flow ran. When an approved module specification, boundaries, and
> architecture context exist, Stage 0 is a short intake and Stage 1 proceeds as usual.
> When they do not — an ad-hoc request or a small module carved out of existing code —
> Stage 0 derives them from the request and codebase. Missing inputs are a reason to run Stage 0, never a
> reason to skip this skill and implement inline.

## Input Expectations

**Required:**

- Target project name and location.
- Module name, or a one-line description of what the module should do.

**Derived in Stage 0 when absent:**

- Approved module specification or design notes.
- Module purpose and boundaries.
- Public interfaces and expected consumers.
- Dependencies on existing modules or services.
- Acceptance criteria (at least one measurable criterion).
- Runtime validation target (e.g., local run + monitoring).

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

Run this stage first, always. It is a quick intake when an approved module
specification already exists, and a full derivation when it does not.

- **Restate the module's purpose** in one or two sentences, in the user's terms
- **Derive the module boundaries** — what belongs inside it and what stays outside
- **Derive its public interfaces** and expected consumers
- **Derive at least one measurable acceptance criterion** that makes the module
  verifiable
- **Identify dependencies** on existing modules or services and the integration points
  they touch
- **Identify governing instructions** — the repository agent instructions bound to the `repo-instructions` slot, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Record the derived scope and assumptions** in the stage output and continue to Stage 1 unless escalation is required

Escalate instead of continuing when the module is really a separate deployable service,
or when it needs a new architectural decision, a new bounded context, or a cross-cutting
redesign — recommend `flow-create-service`, `flow-adr`, or `flow-architecture` and ask
the user.

**Agents:** the flow-runner owns the decision half; the **Identify** bullets above are
delegated to a read-only search sub-agent per **Splitting Scope Discovery** in
`instructions/flow-execution-model.instructions.md`. `arc42:arc42` only when architectural
impact is suspected.

### Stage 1: Specification Intake
- **Review the module purpose and boundaries recorded in Stage 0**
- **Check the boundary against the existing domain model** where the repository documents
  bounded contexts — a module that spans two contexts is a design problem to raise now, not
  after the code exists
- **Capture public interfaces** and expected consumers, using the owning context's
  ubiquitous language
- **Capture acceptance criteria** and non-functional requirements
- **Identify dependencies** and integration risks

**Agents:** `arc42:arc42`; `domain:domain` when the module
introduces or crosses a bounded context. A module inside one existing context does not need
the domain pass.

### Stage 2: Implementation Planning
- **Map the recorded design** to the existing project structure
- **Define data contracts** and error handling behavior for implementation
- **Plan integration points** with existing modules/services
- **Create an implementation checklist** for incremental delivery

**Agents:** `arc42:arc42`

### Stage 3: Implementation
- **Create module files/folders** in the existing project layout
- **Implement core functionality** using project patterns
- **Add dependency wiring** and configuration updates
- **Keep changes incremental** for easier review

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Module Implementation, this skill runs the shared delivery phases defined once in
`instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new module functionality, so run the full automatic QA validation
   (Playwright checks on the new module's endpoints/flows plus `qa:qa-monitor` runtime
   monitoring, with evidence recorded).
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

With an approved module specification:

```
Run module creation for:
- Project: "Billing.Core"
- Module: "InvoiceRules"
- Purpose: Validate and score invoice policy rules
- Dependencies: Existing pricing and tax modules
- Runtime target: Local run + monitoring
```

Ad-hoc request — Stage 0 derives the rest:

```
Run module creation for:
- Project: "Billing.Core"
- Module: "Something to keep the invoice policy rules out of the pricing code"
```

## Output Expectations

- Module created following project patterns and naming conventions.
- Unit and integration tests passing for module behavior.
- Module wired into project configuration and dependency graph.
- Project runs locally with module enabled.
- Validation evidence recorded (logs, health checks).
- Readiness status documented.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-create-module"` and these stages: Scope Discovery,
  Specification Intake, Implementation Planning, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Scope Discovery**, present the restated module purpose, derived boundaries and
  public interfaces, and derived acceptance criteria as the stage output so the user can
  review them at Personal Validation.
- During **Specification Intake**, also open/update the `render_markdown` surface operation
  with the recorded acceptance criteria, and during **Implementation Planning**, open/update
  `render_markdown` with the module design documentation and `render_diagram`
  (`mermaid-diagram`) with any accompanying Mermaid diagrams, per
  `instructions/surface-contract.instructions.md`. Optional; skip gracefully if not installed.
