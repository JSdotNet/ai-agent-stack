---
name: flow-project
description: 'Run project scaffolding and development environment setup for an existing repository. Use this skill after flow-repo to initialize the .github folder, coding guidelines, Aspire AppHost, project structure, and local validation. Assumes the repository already exists and is configured.'
---

# Flow: Project Scaffolding

Automate the complete project scaffolding workflow for an existing, configured repository, including automated local validation and testing.

> **Note:** This skill assumes your repository already exists and is configured (README, repository instructions, MCP servers, branch protection, templates). Use `flow-repo` first to create and configure the repository, then use this skill to scaffold the development project inside it.
>
> **Scope:** The target project structure and architecture direction do not need to be
> written down first. When approved structure or architecture notes exist, Stage 3 is a
> short intake. When they do not, Stage 3 derives them from the project type, the
> repository, and the repository guidelines, and records the derived assumptions. Missing
> notes are a reason to run Stage 3, never a reason to stop or to scaffold outside this
> flow.

## Input Expectations

**Required:**

- Repository name (must already exist on GitHub and be configured via `flow-repo`).
- Project type (e.g., ASP.NET Core API with Aspire).

**Derived in Stage 3 when absent:**

- Approved project structure or architecture notes for the scaffold.
- Language and framework preferences.
- Aspire services to include (API, Database, Cache, Worker).

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

### Stage 1: GitHub Folder Setup (Foundation)
- **Initialize `.github/` directory structure** with recommended layouts
- **Generate project guidelines** using `jsdotnet-guidelines-mcpserver`:
  - Coding standards and patterns
  - Git workflow conventions
  - Review guidelines
  - Release procedures
- **Create `.github/instructions/` files** for developer guidance
- **Create the host's repository settings file** for the repository-level plugin combination, and `.github/ai-agent-stack.json` for the flow bindings, extensions, policy, and gates — see **The Stack Config** in `instructions/surface-contract.instructions.md`
- **Create `.claude/flow-context.md`** so later flows know how to start and
  validate this project — see `instructions/flow-repo-context.instructions.md` and the
  template at `resources/flow-context-template.md`. A repository with nothing to run
  declares that explicitly instead of omitting the file.

**Agents:** `csharp-coding:coding`  
**MCP Server:** `jsdotnet-guidelines-mcpserver` for guideline generation

### Stage 2: GitHub Actions Workflows

- **Add CI workflow** to build and test on pull requests and pushes.
- **Add release workflow** for versioning and publishing (if applicable).
- **Add dependency review workflow** for supply-chain security checks.
- **Configure workflow permissions** (least-privilege token scopes).
- **Set up environments** (development, staging, production) with required reviewers if needed.

**Agents:** `csharp-coding:coding`

### Stage 3: Specification & Architecture Intake

Establish the target architecture for the initial setup: read it where it already exists,
derive it from the project type and the repository where it does not.

- **Determine the target architecture** for the initial setup — review approved
  architecture notes when they exist, otherwise derive the structure, service split, and
  technology choices from the project type and repository conventions
- **Load the implementation context** and repository constraints from
  `jsdotnet-guidelines-mcpserver`
- **Determine API contracts** and data model boundaries — use those already agreed,
  and derive the rest at signature level
- **Plan integration points** across services
- **Capture implementation risks and assumptions** for local development
- **Record the resulting architecture direction** before Stage 4 installs
  dependencies or Stage 5 scaffolds anything

Escalate instead of continuing when the project needs a documented target architecture or
a recorded decision in its own right — recommend `flow-architecture`, `flow-arc42`, or
`flow-adr` and ask the user.

**Agents:** `arc42:arc42`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 4: Tooling & Dependencies
- **Install base dependencies** (frameworks, SDKs)
- **Configure build & test pipelines**
- **Set up linting and code quality tools**
- **Configure logging and observability**

**Agents:** `csharp-coding:coding`

### Stage 5: Implementation

This stage combines AppHost creation and initial project scaffolding because they are
interdependent — the example service references AppHost configuration, service
discovery, and health checks.

#### Part A: Aspire AppHost Creation
- **Create AppHost project** for service flow
- **Add integrations** based on project type
- **Wire up service discovery** and health checks
- **Configure the Aspire dashboard** for local development
- **Setup environment configuration** for local development

#### Part B: Initial Project Structure & Services
- **Create project directories** (src/, services/, tests/, docs/)
- **Create example service** demonstrating patterns
- **Wire service to AppHost** with health checks and references
- **Generate boilerplate code** (entry points, core types, AppHost references)
- **Set up testing framework** (xUnit, NUnit, etc.)
- **Create first unit tests** as examples
- **Setup test data fixtures**

**Agents:** `csharp-coding:coding`  
**Skills Used:** `aspire`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases
defined once in `instructions/flow-phases.instructions.md` (code-modifying tier),
in order:

1. **Build & Test** — compile all projects and run the unit and integration/E2E test
   suites, run first; fail fast on build or test errors.
2. **QA Validation** — new runnable scaffold, so run QA validation with capture: start the Aspire
   AppHost, confirm the Aspire dashboard and service health endpoints are green (default
   dashboard `localhost:18888`, or the entry points declared in
   `.claude/flow-context.md` when Stage 1 wrote one) and database connectivity
   works, and run Playwright smoke checks on the example service, with `qa:qa-monitor`
   runtime monitoring and evidence recorded.
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

```
Run project setup for:
- Repository: "MyAwesomeAPI" (already exists on GitHub)
- Type: "ASP.NET Core API with Aspire"
- Language: C#
- Aspire services: API, Database, Cache, Worker
- Setup repository workflows and branch protection
- Validate compilation and running application
```

## Output Expectations

- `.github/` directory fully initialized with instructions, workflows, and the stack config, plus the host's own repository configuration.
- Aspire AppHost and ServiceDefaults projects created.
- Example service wired to AppHost with health checks.
- All projects compile without errors.
- Unit and integration tests passing.
- AppHost starts without errors and the Aspire dashboard is accessible.
- All services report healthy status.
- Runtime validation findings recorded, with capture attached for the new runnable flows.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-project"` and these stages: GitHub Folder Setup
  (Foundation), GitHub Actions Workflows, Specification & Architecture Intake, Tooling &
  Dependencies, Implementation, Build & Test, QA Validation, Personal Validation,
  Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Specification & Architecture Intake**, also open/update `render_markdown`
  (`markdown-preview`) with the reviewed or derived architecture documentation and
  the `render_diagram` surface operation with any accompanying Mermaid diagrams, per
  `instructions/surface-contract.instructions.md`. Optional; skip gracefully if not installed.

## Validation Notes

The build, test, and running-application checks for this scaffold are the shared
**Build & Test** and **QA Validation** phases (see
`instructions/flow-phases.instructions.md`). Project-specific expectations for those
phases:

- Compile the AppHost, service, and test projects and resolve all NuGet dependencies.
- Run unit tests (establish a baseline) and integration tests against the AppHost.
- Start the Aspire AppHost (`aspire run`), confirm the Aspire dashboard initializes (default
  `localhost:18888`), all services report healthy, database connectivity works, and smoke
  tests against the API endpoints pass.
- On failure, record which phase failed with the specific errors and suggested fixes, and
  re-run after fixing.

## Reference

Source skill location: `skills/flow-project/SKILL.md`
