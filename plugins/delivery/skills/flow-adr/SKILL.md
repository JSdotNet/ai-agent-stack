---
name: flow-adr
description: 'Run ADR creation. Uses the architecture:architect agent for decision documentation plus `jsdotnet-guidelines-mcpserver` to retrieve relevant project guidance and existing ADR context first.'
---

# Flow: Architectural Decision Record

Execute an ADR workflow with upfront MCP-based guidance retrieval and architecture-agent drafting.

## Input Expectations

- Decision statement and affected scope.
- Goal for the ADR (e.g., capture trade-offs, downstream updates).
- Whether existing ADRs or recommendations should be referenced.

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

### Stage 1: Decision Context Retrieval
- **Clarify the decision statement** and affected scope
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, governed asset constraints, and existing decision context
- **Capture constraints and decision drivers** that govern the requested change
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `architecture:architect`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: ADR Drafting
- **Document context** and competing alternatives
- **Record the selected option** with rationale and trade-offs
- **Capture consequences, risks, and rollback notes**
- **Link the draft** to the retrieved guideline and ADR context where relevant

**Agents:** `architecture:architect`
**Skills Used:** `create-architectural-decision-record`

### Stage 3: Traceability Review
- **Check naming and status consistency** with existing ADRs
- **Identify dependent blueprint, arc42, or TDR updates**
- **Prepare a review-ready ADR** with explicit follow-up actions

**Agents:** `architecture:architect`

### Final Phases (Shared)

After Traceability Review, this skill runs the shared closing phases defined once in
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
Invoke: flow-adr
- Decision: "Should architecture flow own MCP guideline retrieval?"
- Scope: "Architecture and delivery plugins"
- Goal: capture decision, trade-offs, and downstream updates
```

## Output Expectations

- ADR drafted with context, alternatives, and selected option.
- Rationale and trade-offs documented.
- Consequences, risks, and rollback notes captured.
- Naming and status consistency verified against existing ADRs.
- Follow-up actions identified (blueprint, arc42, or TDR updates).

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. With no surface bound, skip these calls, say so once, and continue — file
artifacts remain the source of truth.

- Call `start_run` with `skillId: "flow-adr"` and these stages: Decision Context Retrieval,
  ADR Drafting, Traceability Review, Personal Validation, Create Pull Request, Work Item Update, Summary.
- During **ADR Drafting**, also open/update the `render_markdown` surface operation with the
  drafted ADR content, per `instructions/surface-contract.instructions.md`. Optional; skip
  gracefully if not installed.

## Reference

Source skill location: `skills/flow-adr/SKILL.md`
