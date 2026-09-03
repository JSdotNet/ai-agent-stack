---
name: flow-structure
description: 'Run existing repository structure and layout refactors. Use for folder moves, project or solution layout corrections, test/harness placement, and reference updates. Do not use for initial scaffolding (use flow-repo or flow-project), new modules/services (use flow-create-module or flow-create-service), or architecture documentation only (use flow-architecture, flow-adr, or flow-arc42).'
---

# Flow: Structure Refactor

Execute a focused workflow for structural refactors in an existing repository: folder
layout changes, project or solution organization fixes, test/harness placement, and the
reference updates needed to keep the repository working after the move.

> **Scope:** This skill covers structure and layout changes whether or not a prior
> architecture note exists. When approved structure guidance exists, Stage 0 is a short
> intake and Stage 1 proceeds as usual. When it does not -- an ad-hoc request such as
> "move the harness below src" -- Stage 0 derives the verifiable scope from the request,
> codebase, and applicable guidance. Missing notes are a reason to run Stage 0, never a
> reason to route to initial scaffolding or implement the move inline.

## Input Expectations

**Required:**

- Structure or layout change request, such as a folder move, project relocation, solution
  organization fix, or test/harness placement change.

**Derived in Stage 0 when absent:**

- Target layout rule or desired destination.
- Affected folders, projects, solution files, tests, scripts, CI, documentation, and
  architecture tests.
- Verification criteria proving the structure change is complete.
- Runtime validation target, or a reason QA Validation should be skipped.

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

Run this stage first, always. It is a quick intake when approved layout guidance
already exists, and a full derivation when it does not.

- **Restate the structure change** in one or two sentences, in the user's terms.
- **Derive the target layout rule** and the concrete folders/projects that should move or
  be reorganized.
- **Derive verification criteria** such as expected folder tree, updated references,
  passing architecture tests, or successful build/test commands.
- **Identify affected surfaces** including solution files, project references, package or
  workspace manifests, scripts, CI workflow paths, documentation links, test fixtures,
  architecture tests, and runtime configuration.
- **Identify governing instructions** - the repository agent instructions bound to the `repo-instructions` slot, any matching
  `**/*.instructions.md`, and relevant guidelines or ADRs via
  `jsdotnet-guidelines-mcpserver`.
- **Record the derived scope and assumptions** in the stage output and continue to Stage 1 unless escalation is required.

Escalate instead of continuing when the request needs a different work type:

- Initial repository or project scaffolding routes to `flow-repo` or `flow-project`.
- A new architectural decision routes to `flow-adr`.
- A cross-cutting redesign or documentation-only architecture outcome routes to
  `flow-architecture` or `flow-arc42`.
- A new bounded context, service boundary, module, or service routes to
  `flow-create-module` or `flow-create-service`.

**Agents:** the flow-runner owns the decision half; the **Identify** bullets above are
delegated to a read-only search sub-agent per **Splitting Scope Discovery** in
`instructions/flow-execution-model.instructions.md`. Optionally `arc42:arc42` when the layout rule
needs architecture interpretation.

**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 1: Structure & Architecture Intake

- **Review the recorded scope** and target layout rule from Stage 0.
- **Map the target layout** to repository structure guidance, ADRs, and existing patterns.
- **Identify required compatibility updates** across references, build/test discovery,
  scripts, docs, and CI path filters.
- **Define the validation target** for the resulting structure change.

**Agents:** `arc42:arc42`

**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: Refactor Planning

- **List exact moves and renames** before changing files.
- **List reference updates** required after the move, including solution/project files,
  relative paths, package/workspace manifests, scripts, docs, CI, test fixtures, and
  architecture tests.
- **Sequence the refactor** so references are updated in the same change set as the move.
- **Call out risks** such as generated files, case-only renames, path-sensitive tooling, or
  files that should not move.

**Agents:** `arc42:arc42`, `csharp-coding:coding`

### Stage 3: Implementation

- **Move or reorganize folders/projects** according to the recorded target layout.
- **Update all affected references** discovered in Stage 2.
- **Update documentation or architecture tests** that encode the old structure.
- **Keep behavior unchanged** except for the intended layout change.

**Agents:** `csharp-coding:coding`

### Final Phases (Shared)

After Implementation, this skill runs the shared delivery phases defined once in
`instructions/flow-phases.instructions.md` (code-modifying tier), in order:

1. **Build & Test** - build, unit tests, and E2E tests, run first.
2. **QA Validation** - existing-structure change, so run targeted validation for affected
   flows when the repository has a runnable application; skip with a recorded reason when
   there is no runtime surface.
3. **Personal Validation** - hand back to the user (no agent); present the code review and
   the recorded validation review, and start the application for the user when applicable.
4. **Create Pull Request** - only after explicit user approval.
5. **Documentation Update** - after the pull request exists, check whether the repository's
   governed documentation is now stale and, if so, update it and commit onto the PR branch;
   a clean no-op when nothing needs changing.
6. **Work Item Update** - when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
7. **Summary** - emit the run summary.

See `instructions/flow-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every flow.

## Usage Pattern

Ad-hoc structure refactor -- Stage 0 derives the rest:

```text
Invoke: flow-structure
- Change: "Fix folder structure. harness should be below src"
```

More explicit layout correction:

```text
Invoke: flow-structure
- Change: "Move integration test harness projects under src/harness and update solution references"
- Validation: "Solution loads and all structure/architecture tests pass"
```

## Output Expectations

- Repository structure matches the recorded target layout.
- Moved folders/projects retain working references from solution files, scripts, CI,
  tests, docs, and runtime configuration.
- Architecture tests or documentation that encode folder rules are updated when needed.
- Build/test/validation results are recorded, or skipped with a clear reason when no
  runnable surface exists.
- Personal Validation is completed before any pull request or issue update.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence, the QA Validation
`scenarios`/`monitoring` passthrough, and the Personal Validation → Create Pull Request
gating. With no surface bound, skip these calls, say so once, and continue — file artifacts
remain the source of truth.

- Call `start_run` with `skillId: "flow-structure"` and these stages: Scope Discovery,
  Structure & Architecture Intake, Refactor Planning, Implementation, Build & Test, QA
  Validation, Personal Validation, Create Pull Request, Documentation Update, Work Item
  Update, Summary.
- During **Scope Discovery**, present the restated structure change, derived target layout,
  affected surfaces, and verification criteria as the stage output so the user can review
  or correct them.
- During **Structure & Architecture Intake** or **Refactor Planning**, optionally
  open/update the `render_markdown` surface operation with the recorded structure plan and
  the `render_diagram` surface operation with any accompanying layout diagram, per
  `instructions/surface-contract.instructions.md`. Optional; skip gracefully if not installed.

## Reference

Source skill location: `skills/flow-structure/SKILL.md`
