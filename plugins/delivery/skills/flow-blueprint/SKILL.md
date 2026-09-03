---
name: flow-blueprint
description: 'Run architecture blueprint creation or refresh. Uses the arc42:arc42 agent for blueprint work and `jsdotnet-guidelines-mcpserver` to ground governed asset changes in project guidance.'
---

# Flow: Architecture Blueprint

Execute a blueprint workflow with MCP-guided context gathering up front and architecture drafting delegated to the architect agent.

## Input Expectations

- Target system or project name.
- Blueprint goal (e.g., refresh after boundary changes).
- Focus areas (e.g., dependencies, boundaries, traceability, risks).
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

### Stage 1: Scope & Guideline Retrieval
- **Define blueprint scope** and target audience
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, ADR context, and governed asset constraints
- **Capture repository constraints** that affect governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `arc42:arc42`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: Blueprint Drafting
- **Identify system boundaries** and major components
- **Document architecture style** and integration relationships
- **Capture risks, assumptions, and quality goals**
- **Link blueprint statements** to the retrieved guidance context where relevant

**Agents:** `arc42:arc42`
**Skills Used:** `architecture-blueprint-generator`

### Stage 3: Review & Traceability
- **Check internal consistency** across components, dependencies, and constraints
- **Highlight missing decisions** that should become ADRs or TDRs
- **Prepare a review-ready blueprint** with explicit follow-up items

**Agents:** `arc42:arc42`

### Final Phases (Shared)

After Review & Traceability, this skill runs the shared closing phases defined once in
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
Invoke: flow-blueprint
- System: "agent plugin ecosystem"
- Goal: refresh the architecture blueprint after plugin boundary changes
- Focus: dependencies, boundaries, traceability, and risks
```

## Output Expectations

- System boundaries and major components identified.
- Architecture style and integration relationships documented.
- Risks, assumptions, and quality goals captured.
- Internal consistency verified across components and dependencies.
- Missing decisions flagged for ADR or TDR follow-up.
- Review-ready blueprint prepared with explicit follow-up items.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. With no surface bound, skip these calls, say so once, and continue — file
artifacts remain the source of truth.

- Call `start_run` with `skillId: "flow-blueprint"` and these stages: Scope & Guideline
  Retrieval, Blueprint Drafting, Review & Traceability, Personal Validation, Create Pull
  Request, Work Item Update, Summary.
- During **Blueprint Drafting**, also open/update the `render_markdown` surface operation
  with the drafted blueprint content, per `instructions/surface-contract.instructions.md`.
  Optional; skip gracefully if not installed.

## Reference

Source skill location: `skills/flow-blueprint/SKILL.md`
