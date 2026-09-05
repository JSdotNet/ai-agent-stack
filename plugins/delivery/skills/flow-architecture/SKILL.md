---
name: flow-architecture
description: 'Run general architecture work. Uses the arc42:arc42 agent directly plus `jsdotnet-guidelines-mcpserver` for governed asset guidance before edits.'
---

# Flow: Architecture Work

For architecture requests that need the `arc42` agent but fit no single arc42, ADR, or TDR
flow. Blueprints run here too, through the agent's `architecture-blueprint-generator` skill.

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

- Architecture objective, and the output type expected — guidance, proposal, comparison,
  decision framing, or documentation update.
- Scope of affected systems or plugins.
- Whether governed asset constraints apply.

## Stage 1: Goal & Guideline Retrieval

- Clarify the objective and the expected output.
- Query `jsdotnet-guidelines-mcpserver` for standards and governed asset constraints.
- Capture the repository constraints that affect governed plugin or guidance assets.
- Stop for MCP setup when the guideline tools are unavailable.

**Agents:** `arc42:arc42` — **MCP:** `jsdotnet-guidelines-mcpserver`

## Stage 2: Architecture Investigation

- Inspect the current repository context and the affected architecture surfaces.
- Settle the output shape.
- Call out assumptions, risks, and open questions.
- Align the recommendations with the retrieved guidance.

**Agents:** `arc42:arc42`

## Stage 3: Drafting & Review

- Draft the requested outcome in Markdown.
- Check it holds together across scope, constraints, risks, and traceability.
- Leave it review-ready, with follow-up actions explicit where they exist.

**Agents:** `arc42:arc42`

## Final Phases (Shared)

Documentation/config tier of `instructions/flow-phases.instructions.md`, in order: Personal
Validation → Create Pull Request → Work Item Update → Summary. That file defines them; change
them there, for every flow.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`. With no
surface bound, skip the calls, say so once, and continue — file artifacts remain the source
of truth.

- `start_run` with `skillId: "flow-architecture"` and stages: Goal & Guideline Retrieval,
  Architecture Investigation, Drafting & Review, Personal Validation, Create Pull Request,
  Work Item Update, Summary.
- During Drafting & Review, open/update `render_markdown` with the drafted result, and
  `render_diagram` when it carries Mermaid diagrams.
