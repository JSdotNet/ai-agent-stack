---
name: flow-bug
description: 'Run bug resolution end to end — from an ad-hoc "this is broken" report or a triaged issue through reproduction, root cause analysis, TDD fix implementation (test first), verification, and local runtime validation. Missing reproduction steps, severity, or root cause context is derived in Stage 0 rather than being a reason to skip the flow.'
---

# Flow: Bug Resolution

Execute a complete bug fix workflow from identification through local runtime validation using test-driven development (TDD) approach.

> **Scope:** This skill covers bug work whether or not a written report, triage, or
> reproduction already exists. When they do, Stage 0 is a short intake and Stage 1
> proceeds as usual. When they do not — an ad-hoc "X is broken" observation or an
> unreported defect noticed while working — Stage 0 derives them from the request and codebase. Missing
> inputs are a reason to run Stage 0, never a reason to skip this skill and patch inline.

## Input Expectations

**Required:**

- A description of the broken behavior.

**Derived in Stage 0 when absent:**

- Reproduction steps.
- Existing incident notes, issue details, or other approved bug context.
- Severity level (critical, high, medium, low).
- Affected versions or environments.
- Root cause hypothesis.
- Fix type (hotfix or standard).
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

Run this stage first, always. It is a quick intake when a triaged report already
exists, and a full derivation when it does not.

- **Restate the observed versus expected behavior** in one or two sentences, in the
  user's terms
- **Derive at least one measurable verification criterion** — the condition the
  regression test must prove
- **Identify the suspected code paths** and the integration points they touch
- **Identify governing instructions** — the repository agent instructions bound to the `repo-instructions` slot, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`
- **Record the derived scope and assumptions** in the stage output and continue to Stage 1 unless escalation is required

Escalate instead of continuing when the defect is really a missing feature, or when the
fix needs a new architectural decision or cross-cutting redesign — recommend
`flow-feature`, `flow-adr`, or `flow-architecture` and ask the user.

**Agents:** the flow-runner owns the decision half; the **Identify** bullets above are
delegated to a read-only search sub-agent per **Splitting Scope Discovery** in
`instructions/flow-execution-model.instructions.md`. `arc42:arc42` only when architectural
impact is suspected.

### Stage 1: Bug Intake & Reproduction
- **Reproduce the bug** following provided steps
- **Determine severity** and impact assessment
- **Identify affected versions** and users
- **Create detailed bug report** with logs/traces
- **Assign priority** (critical, high, medium, low)

**Agents:** `csharp-coding:coding`; `qa:qa` when reproduction requires running the
application.

### Stage 2: Root Cause Analysis
- **Debug issue** using logs and diagnostics
- **Identify root cause** in codebase
- **Check for related bugs** (similar patterns)
- **Document findings** for the fix
- **Create minimal reproduction case**

**Agents:** `csharp-coding:coding`

### Stage 3: Implementation
- **Create failing test first** that reproduces the bug
- **Write test case** that fails with current code
- **Implement minimal fix** addressing root cause
- **Make test pass** with the fix
- **Add regression tests** to prevent recurrence
- **Refactor** if needed for code quality
- **Verify fix** doesn't break other functionality

**Agents:** `csharp-coding:coding` (switch to coding agent for TDD implementation)

### Final Phases (Shared)

After Fix Implementation, this skill runs the shared delivery phases defined once in
`instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** — build, unit tests (including the new regression test), and E2E
   tests, run first.
2. **QA Validation** — bug fix, so run targeted QA validation: `qa:qa` re-runs the
   original reproduction steps plus the regression scenario with `qa:qa-monitor` runtime
   monitoring, and records pass/fail plus findings. Capture evidence only when requested
   or when a failure needs supporting artifacts.
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

## Severity Levels & Response Times

| Severity | Description | Response | Local Validation |
|----------|-------------|----------|------------------|
| Critical | System down, data loss, security | Immediate | Immediate local verification |
| High | Major feature broken, significant impact | 2-4 hours | Same day local run + monitoring |
| Medium | Feature degraded, workaround exists | 1-2 days | Local verification in current sprint |
| Low | Minor issue, cosmetic, edge case | 1 week | Local verification in normal cycle |

## Usage Pattern

With a triaged report:

```
Run bug fix for:
- Bug: "Login fails with special characters in password"
- Severity: High (affects 5% of users)
- Affected versions: 2.1.0, 2.1.1
- Root cause: Insufficient input sanitization
- Fix type: Hotfix
- Runtime target: Local run + monitoring
```

Ad-hoc report — Stage 0 derives the rest:

```
Run bug fix for:
- Bug: "Dragging a sub-item onto itself clears the list"
```

## Critical Bug Fast-Track Process

```
1. Fix: Minimal changes, test thoroughly
2. PR: Immediate review (no waiting)
3. Validate: Reproduction test + regression suite
4. Run locally: Verify startup and impacted flows
5. Monitor: Logs/health until stability confirmed
```

## Output Expectations

- Scope restated and recorded in the stage output.
- Root cause documented.
- Failing test created that reproduces the bug.
- Minimal fix implemented; test passes.
- Regression tests added.
- No side effects in existing functionality.
- Local runtime findings recorded (logs, traces, and optional evidence when needed).
- Validation result recorded with pass/fail status.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-bug"` and these stages: Scope Discovery, Bug
  Intake & Reproduction, Root Cause Analysis, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During **Scope Discovery**, present the restated observed versus expected behavior, the
  derived verification criterion, and the suspected code paths as the stage output so the
  user can review them at Personal Validation.
- During **Bug Intake & Reproduction**, also open/update the `render_markdown` surface operation
  with the drafted bug report content, per `instructions/surface-contract.instructions.md`.
  Optional; skip gracefully if not installed.

## Reference

Source skill location: `skills/flow-bug/SKILL.md`
