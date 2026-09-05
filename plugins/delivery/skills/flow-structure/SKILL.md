---
name: flow-structure
description: 'Run existing repository structure and layout refactors. Use for folder moves, project or solution layout corrections, test/harness placement, and reference updates. Do not use for initial scaffolding (use flow-repo or flow-project), new modules/services (use flow-create-module or flow-create-service), or architecture documentation only (use flow-architecture, flow-adr, or flow-arc42).'
---

# Flow: Structure Refactor

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

Required: the structure or layout change — a folder move, project relocation, solution
organization fix, or test/harness placement change.

Derived in Stage 0 when absent: the target layout rule, the affected surfaces, the
verification criteria, and the runtime validation target (or the reason QA Validation is
skipped).

## Stage 0: Scope Discovery

Run this stage first, always — a quick intake when approved layout guidance exists, a full
derivation when it does not.

- Restate the structure change in one or two sentences, in the user's terms.
- Derive the target layout rule and the concrete folders or projects that move.
- Derive the verification criteria: expected folder tree, updated references, passing
  architecture tests, a green build.
- Identify the affected surfaces — solution files, project references, package or workspace
  manifests, scripts, CI path filters, documentation links, test fixtures, architecture
  tests, runtime configuration.
- Identify the governing instructions — the repository instructions bound to the
  `repo-instructions` slot, any matching `**/*.instructions.md`, and relevant guidelines or
  ADRs via `jsdotnet-guidelines-mcpserver`.
- Record the derived scope and assumptions in the stage output, then continue to Stage 1.

Escalate instead when the request is a different work type: initial scaffolding routes to
`flow-repo` or `flow-project`; a new architectural decision to `flow-adr`; a cross-cutting
redesign or documentation-only outcome to `flow-architecture` or `flow-arc42`; a new bounded
context, module, or service to `flow-create-module` or `flow-create-service`.

**Agents:** the flow-runner owns the decision half; the identification bullets go to a
read-only search sub-agent per **Splitting Scope Discovery** in
`instructions/flow-execution-model.instructions.md`. `arc42:arc42` when the layout rule needs
architecture interpretation. **MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 1: Structure & Architecture Intake

- Review the scope and target layout rule recorded in Stage 0.
- Map the target layout onto the repository's structure guidance, ADRs, and patterns.
- Identify the compatibility updates required across references, build and test discovery,
  scripts, docs, and CI path filters.
- Define the validation target for the resulting change.

**Agents:** `arc42:arc42` — **MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 2: Refactor Planning

- List the exact moves and renames before touching a file.
- List the reference updates each one forces.
- Sequence the refactor so references land in the same change set as the move.
- Call out the risks: generated files, case-only renames, path-sensitive tooling, files that
  should not move at all.

**Agents:** `arc42:arc42`, `csharp-coding:coding`

## Stage 3: Implementation

- Move or reorganize to the recorded target layout.
- Update every reference found in Stage 2, and any documentation or architecture test that
  encodes the old structure.
- Leave behavior unchanged apart from the layout itself.

**Agents:** `csharp-coding:coding`

## Final Phases (Shared)

Code-modifying tier of `instructions/flow-phases.instructions.md`, in order: Build & Test →
QA Validation → Personal Validation → Create Pull Request → Documentation Update → Work Item
Update → Summary. That file defines them; change them there, for every flow.

A change to existing structure, so QA Validation is targeted at the affected flows — and
skipped with a recorded reason when the repository has no runnable surface.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`. With no
surface bound, skip the calls, say so once, and continue — file artifacts remain the source
of truth.

- `start_run` with `skillId: "flow-structure"` and stages: Scope Discovery, Structure &
  Architecture Intake, Refactor Planning, Implementation, Build & Test, QA Validation,
  Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary.
- During Scope Discovery, put the restated change, the derived target layout, the affected
  surfaces, and the verification criteria in the stage output, so the user can correct them.
- During Structure & Architecture Intake or Refactor Planning, optionally open/update
  `render_markdown` with the structure plan and `render_diagram` with a layout diagram.
