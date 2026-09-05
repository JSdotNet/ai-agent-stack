---
name: flow-tdr
description: 'Run technical debt record creation. Uses the arc42:arc42 agent for debt documentation plus `jsdotnet-guidelines-mcpserver` to ground the record in project guidance and related decisions.'
---

# Flow: Technical Debt Record

Execute a TDR workflow with MCP-guided context retrieval first and the architect agent handling the documentation work.

## Input Expectations

- Debt item description and affected scope.
- Goal for the TDR (e.g., capture impact, remediation path).
- Whether related ADRs or recommendations should be referenced.

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

### Stage 1: Debt Context Retrieval
- **Clarify the debt item** and affected scope
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, ADR context,
  and governed asset constraints
- **Capture remediation boundaries** for governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `arc42:arc42`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: TDR Drafting
- **Describe the debt origin** and current impact
- **Capture severity, ownership, and remediation window**
- **Link the record** to retrieved guidance and related architecture artifacts
- **Document follow-up work** needed to reduce or retire the debt

**Agents:** `arc42:arc42`
**Skills Used:** `create-technical-debt-record`

### Stage 3: Risk & Follow-Up Review
- **Check impact statements** across delivery, quality, and operations
- **Identify related ADR, blueprint, or arc42 follow-up**
- **Prepare a review-ready TDR** with an actionable remediation path

**Agents:** `arc42:arc42`

### Final Phases (Shared)

After Risk & Follow-Up Review, this skill runs the shared closing phases defined once in
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
Invoke: flow-tdr
- Debt: "Architecture guidance retrieval is inconsistent across plugin workflows"
- Scope: "delivery flow skills"
- Goal: capture impact, remediation path, and related decisions
```

## Output Expectations

- Debt origin and current impact described.
- Severity, ownership, and remediation window captured.
- Record linked to retrieved guidance and related architecture artifacts.
- Follow-up work documented to reduce or retire the debt.
- Impact statements verified across delivery, quality, and operations.
- Review-ready TDR prepared with actionable remediation path.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. With no surface bound, skip these calls, say so once, and continue — file
artifacts remain the source of truth.

- Call `start_run` with `skillId: "flow-tdr"` and these stages: Debt Context Retrieval, TDR
  Drafting, Risk & Follow-Up Review, Personal Validation, Create Pull Request, Work Item Update, Summary.
- During **TDR Drafting**, also open/update the `render_markdown` surface operation with the
  drafted TDR content, per `instructions/surface-contract.instructions.md`. Optional; skip
  gracefully if not installed.
