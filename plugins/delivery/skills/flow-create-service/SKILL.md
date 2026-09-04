---
name: flow-create-service
description: 'Create a new service in an existing project — from an ad-hoc "we need a service for X" request or an approved service specification through service design, implementation, project wiring, testing, local run, and monitoring. Use for new services and for extracting an existing area into its own service; missing specification, responsibilities, or architecture context is derived in Stage 0 rather than being a reason to skip the flow.'
---

# Flow: Create Service in Existing Project

Execute a complete workflow for adding a new service to an existing project, with local run and monitoring as the final readiness gate.

> **Scope:** This skill covers service work whether or not a prior specification or
> architecture flow ran. When an approved service specification, responsibilities,
> and architecture context exist, Stage 0 is a short intake and Stage 1 proceeds as usual.
> When they do not — an ad-hoc request or an extraction from existing code — Stage 0
> derives them from the request and codebase. Missing inputs are a reason to run Stage 0, never a reason
> to skip this skill and implement inline.

## Input Expectations

**Required:**

- Target project name and repository.
- Service name, or a one-line description of what the service should do.

**Derived in Stage 0 when absent:**

- Approved service specification or architecture notes.
- Service responsibilities and ownership boundaries.
- API or messaging contracts for the new service.
- Upstream and downstream dependencies.
- Acceptance criteria and operational expectations.
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

Run this stage first, always. It is a quick intake when an approved service
specification already exists, and a full derivation when it does not.

- **Restate the service's responsibility** in one or two sentences, in the user's terms
- **Derive its ownership boundaries** — what this service owns and what stays with
  existing services
- **Derive its API or messaging contracts** at signature level
- **Derive at least one measurable acceptance criterion** and the operational
  expectations (health, latency, failure behavior)
- **Identify upstream and downstream dependencies** and the integration points they touch
- **Identify governing instructions** — the repository agent instructions bound to the `repo-instructions` slot, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Record the derived scope and assumptions** in the stage output and continue to Stage 1 unless escalation is required

Escalate instead of continuing when the work is really a module inside an existing
service, or when the service boundary itself is an open architectural question — recommend
`flow-create-module`, `flow-adr`, or `flow-architecture` and ask the user.

**Agents:** the flow-runner owns the decision half; the **Identify** bullets above are
delegated to a read-only search sub-agent per **Splitting Scope Discovery** in
`instructions/flow-execution-model.instructions.md`. `arc42:arc42` when the service boundary
needs review.

### Stage 1: Specification Intake
- **Review the service responsibility and boundaries recorded in Stage 0**
- **Check the boundary against the existing domain model** — where the repository documents
  bounded contexts, confirm the service maps to exactly one, and that its contracts use that
  context's ubiquitous language rather than inventing parallel terms
- **Capture API or messaging contracts** for the new service
- **Identify upstream/downstream dependencies**, naming the integration pattern where the
  service talks to another context (anti-corruption layer, shared kernel, published language)
- **Set acceptance criteria** and operational expectations

**Agents:** `arc42:arc42`; `domain:domain` when the service
introduces, splits, or renames a bounded context. A service that sits wholly inside an
existing context does not need the domain pass. Full domain modeling is `flow-domain`'s
work, not this stage's — route there instead of modeling here.

### Stage 2: Implementation Planning
- **Map the recorded design** to the repository structure
- **Plan service discovery and references** for the host project
- **Define configuration model** (env vars, secrets, defaults)
- **Define health checks and observability signals**

**Agents:** `arc42:arc42`

### Stage 3: Implementation
- **Create the new service project** in the existing solution/repository
- **Implement service endpoints/workers** and core logic
- **Wire service into host flow** (for example AppHost/service catalog)
- **Configure dependencies** (database, queue, cache) as needed

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Service Implementation & Wiring, this skill runs the shared delivery phases defined
once in `instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first.
2. **QA Validation** — new service functionality, so run the full automatic QA validation
   (Playwright checks on health endpoints and critical service flows plus `qa:qa-monitor`
   runtime monitoring, with evidence recorded).
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

With an approved service specification:

```
Run new service creation for:
- Project: "Orders.Platform" (existing)
- New service: "NotificationService"
- Responsibilities: Email and webhook notifications
- Integrations: AppHost, message broker, audit logging
- Runtime target: Local run + monitoring
```

Ad-hoc request — Stage 0 derives the rest:

```
Run new service creation for:
- Project: "Orders.Platform"
- New service: "Something that sends the order emails, out of the order API"
```

## Output Expectations

- Service project created and wired into host flow.
- Service endpoints or workers implemented with core logic.
- Unit and integration tests passing.
- Health endpoints validated and critical flows tested.
- Logs and runtime behavior monitored for stability.
- Readiness status recorded with follow-up actions.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-create-service"` and these stages: Scope Discovery,
  Specification Intake, Implementation Planning, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Scope Discovery**, present the restated responsibility, derived boundaries and
  contracts, and derived acceptance criteria as the stage output so the user can review
  or correct them.
- During **Specification Intake**, also open/update `render_markdown`
  (`markdown-preview`) with the recorded service contract, and during
  **Implementation Planning**, open/update `render_markdown` with the design
  documentation and the `render_diagram` surface operation with any accompanying Mermaid
  diagrams, per `instructions/surface-contract.instructions.md`. Optional; skip gracefully if
  not installed.

## Skills Used

- `aspire` (optional) when wiring service resources into AppHost

## Reference

Source skill location: `skills/flow-create-service/SKILL.md`
