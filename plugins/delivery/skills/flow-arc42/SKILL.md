---
name: flow-arc42
description: 'Run arc42 architecture documentation. Uses the arc42:arc42 agent for section drafting and `jsdotnet-guidelines-mcpserver` for guideline and ADR grounding before governed asset changes.'
---

# Flow: arc42 Documentation

Guideline retrieval sits in this flow, so the architect agent stays independent of it.

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

- Target system or project name.
- arc42 sections to draft or refresh.
- The documentation goal.
- Whether governed asset constraints apply.

## Stage 1: Context & Guideline Retrieval

- Clarify the target sections and the documentation goal.
- Query `jsdotnet-guidelines-mcpserver` for standards, ADR context, and governed asset
  constraints.
- Collect the repository-specific constraints for governed plugin or guidance assets.
- Stop for MCP setup when the guideline tools are unavailable.

**Agents:** `arc42:arc42` — **MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 2: Section Drafting

- Load the arc42 global instructions and the target section instructions.
- Draft or refresh the target sections, with the assumptions stated.
- Link decisions and constraints to the retrieved guidance.
- Record the open questions that still need user input.

**Agents:** `arc42:arc42` — **Skills:** `architecture-arc42-generator`

## Stage 3: Cross-Section Review

- Check consistency across scope, constraints, quality goals, and risks.
- Highlight the gaps between the current documentation and the retrieved guidance.
- Leave a review-ready update set for the requested sections.

**Agents:** `arc42:arc42`

## Final Phases (Shared)

Documentation/config tier of `instructions/flow-phases.instructions.md`, in order: Personal
Validation → Create Pull Request → Work Item Update → Summary. That file defines them; change
them there, for every flow.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`. With no
surface bound, skip the calls, say so once, and continue — file artifacts remain the source
of truth.

- `start_run` with `skillId: "flow-arc42"` and stages: Context & Guideline Retrieval, Section
  Drafting, Cross-Section Review, Personal Validation, Create Pull Request, Work Item Update,
  Summary.
- During Section Drafting, open/update `render_markdown` with the drafted section content.
