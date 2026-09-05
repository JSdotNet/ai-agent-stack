---
name: flow-tdr
description: 'Run technical debt record creation. Uses the arc42:arc42 agent for debt documentation plus `jsdotnet-guidelines-mcpserver` to ground the record in project guidance and related decisions.'
---

# Flow: Technical Debt Record

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

- Debt item description and affected scope.
- Goal for the TDR — the impact to capture, the remediation path to name.
- Whether related ADRs or recommendations should be referenced.

## Stage 1: Debt Context Retrieval

- Clarify the debt item and affected scope.
- Query `jsdotnet-guidelines-mcpserver` for standards, ADR context, and governed asset
  constraints.
- Capture the remediation boundaries for governed plugin or guidance assets.
- Stop for MCP setup when the guideline tools are unavailable.

**Agents:** `arc42:arc42` — **MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 2: TDR Drafting

- Describe the debt's origin and its current impact.
- Capture severity, ownership, and the remediation window.
- Link the record to the retrieved guidance and related architecture artifacts.
- Document the follow-up work that reduces or retires the debt.

**Agents:** `arc42:arc42` — **Skills:** `create-technical-debt-record`

## Stage 3: Risk & Follow-Up Review

- Check the impact statements across delivery, quality, and operations.
- Identify related ADR, blueprint, or arc42 follow-up.
- Leave the TDR review-ready, with an actionable remediation path.

**Agents:** `arc42:arc42`

## Final Phases (Shared)

Documentation/config tier of `instructions/flow-phases.instructions.md`, in order: Personal
Validation → Create Pull Request → Work Item Update → Summary. That file defines them; change
them there, for every flow.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`. With no
surface bound, skip the calls, say so once, and continue — file artifacts remain the source
of truth.

- `start_run` with `skillId: "flow-tdr"` and stages: Debt Context Retrieval, TDR Drafting,
  Risk & Follow-Up Review, Personal Validation, Create Pull Request, Work Item Update,
  Summary.
- During TDR Drafting, open/update `render_markdown` with the drafted TDR.
