---
name: flow-architecture
description: 'Run general architecture work. Routes the work to the `architecture` role, grounded in the repository guidelines for governed assets before edits.'
---

# Flow: Architecture Work

For architecture requests that need the `arc42` agent but fit no single arc42, ADR, or TDR
flow.

Agent transitions follow `instructions/flow-phases.instructions.md`; per-stage model choice
follows `instructions/flow-model-selection.instructions.md`.

## Input Expectations

- Architecture objective, and the output type expected — guidance, proposal, comparison,
  decision framing, or documentation update.
- Scope of affected systems or plugins.
- Whether governed asset constraints apply.

## Stage 1: Goal & Guideline Retrieval

- Clarify the objective and the expected output.
- Retrieve standards and governed asset constraints through the guidelines capability, or
  from the repository's own instruction files when none answers — **MCP Server Strategy** in
  `instructions/flow-execution-model.instructions.md`.
- Capture the repository constraints that affect governed plugin or guidance assets.

**Agents:** the `architecture` role — **MCP:** the guidelines capability

## Stage 2: Architecture Investigation

- Inspect the current repository context and the affected architecture surfaces.
- Settle the output shape.
- Call out assumptions, risks, and open questions.
- Align the recommendations with the retrieved guidance.

**Agents:** the `architecture` role

## Stage 3: Drafting & Review

- Draft the requested outcome in Markdown.
- Check it holds together across scope, constraints, risks, and traceability.
- Leave it review-ready, with follow-up actions explicit where they exist.

**Agents:** the `architecture` role

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
