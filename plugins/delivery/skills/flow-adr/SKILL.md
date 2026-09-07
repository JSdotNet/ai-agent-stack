---
name: flow-adr
description: 'Run ADR creation. Routes decision documentation to the `architecture` role, grounded first in the repository guidelines and existing ADR context.'
---

# Flow: Architectural Decision Record

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

- Decision statement and affected scope.
- Goal for the ADR — the trade-offs to capture, the downstream updates to name.
- Whether existing ADRs or recommendations should be referenced.

## Stage 1: Decision Context Retrieval

- Clarify the decision statement and affected scope.
- Retrieve standards, governed asset constraints, and existing decision context from the
  repository's own instruction files and the MCP servers bound to `spec` — **MCP Server
  Strategy** in `instructions/flow-execution-model.instructions.md`.
- Capture the constraints and decision drivers that govern the change.

**Agents:** the `architecture` role

## Stage 2: ADR Drafting

- Document the context and the competing alternatives.
- Record the selected option with its rationale and trade-offs.
- Capture consequences, risks, and rollback notes.
- Link the draft to the retrieved guideline and ADR context.

**Agents:** the `architecture` role

## Stage 3: Traceability Review

- Check naming and status consistency against existing ADRs.
- Identify dependent blueprint, arc42, or TDR updates.
- Leave the ADR review-ready, with its follow-up actions explicit.

**Agents:** the `architecture` role

## Final Phases (Shared)

Documentation/config tier of `instructions/flow-phases.instructions.md`, in order: Personal
Validation → Create Pull Request → Work Item Update → Summary. That file defines them; change
them there, for every flow.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`. With no
surface bound, skip the calls, say so once, and continue — file artifacts remain the source
of truth.

- `start_run` with `skillId: "flow-adr"` and stages: Decision Context Retrieval, ADR
  Drafting, Traceability Review, Personal Validation, Create Pull Request, Work Item Update,
  Summary.
- During ADR Drafting, open/update `render_markdown` with the drafted ADR.
