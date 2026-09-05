---
name: flow-update-packages
description: 'Run dependency and package update workflows. Coordinates safe updates of NuGet packages, npm modules, SDKs, and tools across projects with security scanning, compatibility testing, and local runtime monitoring.'
---

# Flow: Update Packages

Execute a complete package update workflow with validation, testing, and local runtime monitoring, reported through the bound surface.

> **Scope:** This skill derives its own update scope. Stage 1 (Dependency Analysis) and
> Stage 2 (Update Planning) scan the dependency graph, classify what is available, and
> produce the categorized, prioritized update run — so a request as small as "update the
> packages" is in scope. When an approved maintenance directive or update scope already
> exists, those stages align to it instead of deriving from scratch.
>
> Escalate only when the request is really a maintenance *policy* decision — for example
> standing rules on major-version adoption or supported framework baselines. Recommend
> `flow-architecture` for the policy, or `flow-adr` to record it, and ask the user.

## Input Expectations

**Required:**

- Project name and location.

**Derived in Stages 1–2 when absent:**

- Approved update scope or maintenance directive.
- Update scope (security, critical patches, minor, major).
- Testing strategy (core tests, full suite, extended).
- Risk tolerance and rollback boundaries.
- Runtime validation target (e.g., local run + monitoring).
- Notification preferences on completion.

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

### Stage 1: Dependency Analysis
- **Scan all dependencies** for updates available
- **Check security vulnerabilities** (CVE, advisory warnings)
- **Identify breaking changes** in major versions
- **Review changelogs** and release notes

**Agents:** `csharp-coding:coding`

### Stage 2: Update Planning
- **Categorize updates** (security, patch, minor, major)
- **Prioritize critical/security updates** first
- **Plan rollback strategy** for risky updates
- **Record the resulting update run** — the categorized scope, the testing
  strategy, and anything deliberately deferred
- **Coordinate with stakeholders** for major version upgrades

**Agents:** `csharp-coding:coding`

### Stage 3: Implementation
- **Update packages** using appropriate package managers:
  - NuGet: `nuget-manager` skill
  - npm: Package manager commands
  - .NET SDK: `dotnet` CLI
- **Verify lockfiles** and dependency resolution

**Agents:** `csharp-coding:coding`

### Stage 4: Security Validation
- **Run SAST scanning** (Aikido, Snyk, etc.)
- **Check for security advisories** in updated packages
- **Review dependency tree** for transitive vulnerabilities
- **Document any exceptions** to security policy

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Security Validation, this skill runs the shared delivery phases defined once in
`instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first (this covers the
   compatibility and build-pipeline checks for the updated dependencies).
2. **QA Validation** — dependency update with no functional change, so reduce QA to a
   startup-without-errors validation: start the app, confirm healthy Aspire dashboard and health
   endpoints, and confirm no new errors in the logs. Escalate to full Playwright
   validation only when an update introduces new user-facing behavior, and require capture
   only in that case.
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

With an agreed update scope:

```
Run package updates for:
- Project: "PaymentService"
- Update types: Security, critical patches
- Testing: Full integration test suite
- Runtime target: Local run + monitoring
- Notify: On completion with changelog summary
```

Ad-hoc request — Stages 1–2 derive the rest:

```
Run package updates for:
- Project: "PaymentService"
- "Update the packages"
```

## Update Categories

| Category | Urgency | Testing | Local Validation |
|----------|---------|---------|------------------|
| Security patches | Critical | Full suite | Fast-track |
| Bug fix patches | High | Core tests | Standard |
| Minor versions | Medium | Full suite | Staged locally |
| Major versions | Low | Extended | Careful local review |

## Output Expectations

- Dependency scan completed with CVE severity levels.
- Updates categorized and prioritized.
- Packages updated with lockfiles verified.
- Full test suite passing after updates.
- Security scanning completed with no new vulnerabilities.
- Application runs locally with healthy status.
- Changelog summary generated.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-update-packages"` and these stages: Dependency
  Analysis, Update Planning, Implementation, Security Validation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Update Planning**, also open/update the `render_markdown` surface operation with
  the drafted update/rollback plan, per `instructions/surface-contract.instructions.md`.
  Optional; skip gracefully if not installed.
