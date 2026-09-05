---
name: flow-architecture
description: 'Run general architecture work. Uses the arc42:arc42 agent directly plus `jsdotnet-guidelines-mcpserver` for governed asset guidance before edits.'
---

# Flow: Architecture Work

Execute a general architecture workflow for requests that need the `arc42` agent but do not fit a single specialized arc42, ADR, or TDR flow. Architecture blueprints run here too, through the agent's `architecture-blueprint-generator` skill.

## Input Expectations

- Architecture objective and expected output type (guidance, proposal, comparison, decision framing, or documentation update).
- Scope of affected systems or plugins.
- Whether governed asset constraints apply.

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

### Stage 1: Goal & Guideline Retrieval
- **Clarify the architecture objective** and expected output
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, and governed asset constraints
- **Capture repository constraints** that affect governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `arc42:arc42`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: Architecture Investigation
- **Inspect the current repository context** and affected architecture surfaces
- **Identify suitable output shape** such as guidance, proposal, comparison, decision framing, or documentation update
- **Call out assumptions, risks, and open questions**
- **Align recommendations** with the retrieved guidance context

**Agents:** `arc42:arc42`

### Stage 3: Drafting & Review
- **Draft the requested architecture outcome** in Markdown
- **Check internal consistency** across scope, constraints, risks, and traceability
- **Prepare a review-ready result** with explicit follow-up actions when needed

**Agents:** `arc42:arc42`

### Final Phases (Shared)

After Drafting & Review, this skill runs the shared closing phases defined once in
`instructions/flow-phases.instructions.md` (documentation/config tier), in order:

1. **Personal Validation** — hand back to the user (no agent); present the drafted
   artifacts and any review for the user to approve.
2. **Create Pull Request** — only after explicit user approval (mark skipped when there is
   no change set).
3. **Work Item Update** — when the session was started from a GitHub issue, add a
   comment to that issue with the captured result and QA report; otherwise skip.
4. **Summary** — emit the run summary.

See `instructions/flow-phases.instructions.md` for the full phase definitions;
update that file to change these phases for every flow.

## Usage Pattern

```text
Invoke: flow-architecture
- Goal: evaluate and document the architecture impact of a plugin boundary change
- Scope: "architecture and delivery plugins"
- Output: proposal with risks, trade-offs, and recommended follow-up artifacts
- Use `jsdotnet-guidelines-mcpserver` before governed asset edits
```

## Output Expectations

- Architecture outcome drafted in Markdown.
- Assumptions, risks, and open questions called out.
- Recommendations aligned with retrieved guidance context.
- Internal consistency verified across scope, constraints, and traceability.
- Review-ready result prepared with explicit follow-up actions.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. With no surface bound, skip these calls, say so once, and continue — file
artifacts remain the source of truth.

- Call `start_run` with `skillId: "flow-architecture"` and these stages: Goal & Guideline
  Retrieval, Architecture Investigation, Drafting & Review, Personal Validation, Create
  Pull Request, Work Item Update, Summary.
- During **Drafting & Review**, also open/update the `render_markdown` surface operation with
  the drafted Markdown result, and the `render_diagram` surface operation if the result
  includes Mermaid diagrams, per `instructions/surface-contract.instructions.md`. Optional;
  skip gracefully if not installed.
