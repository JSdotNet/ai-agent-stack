---
name: flow-aspire-update
description: 'Run .NET Aspire upgrades with a plan-first workflow. Creates and refines an upgrade plan, performs staged updates, enables new Aspire features, and validates runtime behavior with recorded results.'
---

# Flow: Aspire Update

Execute a complete Aspire update workflow using dashboard, starting with a plan, refining it, then implementing and adopting new features safely.

> **Scope:** This skill derives its own upgrade scope. Stage 1 (Upgrade Intake &
> Baseline) inventories the current Aspire stack, captures the baseline, and defines the
> success criteria; Stage 2 (Plan Refinement) turns that into the batched upgrade path —
> so a request as small as "move us to the latest Aspire" is in scope. When an approved
> upgrade scope or maintenance directive already exists, those stages align to
> it instead of deriving from scratch.
>
> Escalate only when the upgrade forces a new architectural decision, or when adopting a
> new Aspire capability changes the target architecture. Recommend `flow-adr` or
> `flow-architecture` and ask the user.

## Input Expectations

**Required:**

- Repository or project name.

**Derived in Stages 1–2 when absent:**

- Approved upgrade scope or maintenance directive.
- Current Aspire version.
- Target Aspire version.
- Success criteria for upgrade completion and feature adoption.
- New Aspire features to adopt (if any).
- Constraints (e.g., preserve local developer workflow stability).

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

### Stage 1: Upgrade Intake & Baseline
- **Inventory current Aspire stack** (packages, SDK constraints, AppHost integrations)
- **Capture baseline behavior** (build, tests, runtime health) before any package changes
- **Determine the upgrade scope** — current and target versions, and rollback boundaries —
  aligning to an approved scope where one exists and deriving it from the inventory where
  one does not
- **Define success criteria** for upgrade completion and feature adoption
- **Record the derived scope and success criteria** in the stage output before Stage 3 changes
  anything

**Baseline gate:** a green baseline is required before upgrading, so that post-upgrade
failures are attributable. If the baseline is red, record the failing build, tests, or
health checks as pre-existing, then either fix them first within this run or agree with
the user to proceed with the known-red items explicitly excluded from the upgrade's
success criteria. Do not decline the request and do not upgrade over an unrecorded red
baseline.

**Agents:** `csharp-coding:coding`

### Stage 2: Plan Refinement
- **Review release notes and breaking changes** for target Aspire versions
- **Refine plan** with risk controls, migration notes, and dependency ordering
- **Split work into execution batches** (low-risk first, high-risk last)
- **Finalize feature-adoption plan** for new Aspire capabilities to enable

**Agents:** `arc42:arc42`

### Stage 3: Implementation
- **Apply package updates in batches**
- **Upgrade AppHost integrations** and related service references
- **Resolve breaking changes** in configuration and wiring
- **Keep changes incremental** and reversible per batch

**Agents:** `csharp-coding:coding`  
**Skills Used:** `aspire`, `nuget-manager`

### Stage 4: New Feature Adoption
- **Enable selected Aspire features** from the refined plan
- **Adopt feature configuration** in AppHost and service projects
- **Add or update telemetry/health setup** when required by new features
- **Record enabled features** and expected operational impact in dashboard stage output

**Agents:** `csharp-coding:coding`, `arc42:arc42`  
**Skills Used:** `aspire`, `open-telemetry`

### Final Phases (Shared)

After New Feature Adoption, this skill runs the shared delivery phases defined once in
`instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests, and E2E tests, run first (post-upgrade
   compilation and regression checks).
2. **QA Validation** — framework upgrade, so run QA validation focused on startup health
   plus Playwright smoke checks on the critical paths affected by the upgrade and adopted
   features, with `qa:qa-monitor` runtime monitoring. Capture evidence only for adopted
   new functionality or when failure analysis needs it.
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

With an agreed upgrade scope:

```
Run Aspire update for:
- Repository: "Orders.Platform"
- Current Aspire: 9.x
- Target Aspire: 9.latest
- New features to adopt: improved telemetry defaults, updated service discovery configuration
- Constraints: preserve local developer workflow stability
- Output: refined upgrade plan + validation recording report
```

Ad-hoc request — Stages 1–2 derive the rest:

```
Run Aspire update for:
- Repository: "Orders.Platform"
- "Get us onto the latest Aspire"
```

## Definition of Done Checklist

- [ ] Baseline inventory completed and baseline state recorded (green, or red with the
      pre-existing failures agreed and excluded)
- [ ] Initial update plan created
- [ ] Plan refined with risks and batch sequencing
- [ ] Aspire packages and integrations upgraded
- [ ] Selected new Aspire features enabled
- [ ] Build and tests pass after upgrade
- [ ] Runtime health validated on updated AppHost
- [ ] Validation findings recorded and report published; attach capture only for adopted new functionality or when needed for failures

## Output Expectations

- Baseline inventory documented.
- Update plan created and refined with risk controls.
- Aspire packages and integrations upgraded.
- Selected new features enabled and configured.
- Build and tests pass after upgrade.
- Runtime health validated on updated AppHost.
- Validation findings recorded and report published, with capture attached only when applicable.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-aspire-update"` and these stages: Upgrade Intake &
  Baseline, Plan Refinement, Implementation, New Feature Adoption, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Plan Refinement**, also open/update the `render_markdown` surface operation with
  the refined upgrade plan, per `instructions/surface-contract.instructions.md`. Optional; skip
  gracefully if not installed.
