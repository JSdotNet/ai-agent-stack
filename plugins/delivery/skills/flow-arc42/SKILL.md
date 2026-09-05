---
name: flow-arc42
description: 'Run arc42 architecture documentation. Uses the arc42:arc42 agent for section drafting and `jsdotnet-guidelines-mcpserver` for guideline and ADR grounding before governed asset changes.'
---

# Flow: arc42 Documentation

Execute an arc42 documentation workflow while keeping the architect agent independent and moving guideline retrieval into the flow layer.

## Input Expectations

- Target system or project name.
- arc42 sections to draft or refresh (e.g., 1, 3, 9).
- Documentation goal (e.g., refresh before restructuring).
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

### Stage 1: Context & Guideline Retrieval
- **Clarify target sections** and documentation goals
- **Query `jsdotnet-guidelines-mcpserver`** for standards, relevant guidance, ADR context, and governed asset constraints
- **Collect repository-specific constraints** for governed plugin or guidance assets
- **Stop for MCP setup** if the required guideline tools are unavailable

**Agents:** `arc42:arc42`
**MCP Servers:** `jsdotnet-guidelines-mcpserver`

### Stage 2: Section Drafting
- **Load arc42 global instructions** and target section instructions
- **Draft or refresh target sections** with explicit assumptions
- **Link decisions and constraints** to the retrieved guidance context
- **Record open questions** that still need user input

**Agents:** `arc42:arc42`
**Skills Used:** `architecture-arc42-generator`

### Stage 3: Cross-Section Review
- **Check consistency** across scope, constraints, quality goals, and risks
- **Highlight gaps** between current documentation and retrieved guidance
- **Prepare a review-ready update set** for the requested sections

**Agents:** `arc42:arc42`

### Final Phases (Shared)

After Cross-Section Review, this skill runs the shared closing phases defined once in
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
Invoke: flow-arc42
- System: "Plugin monorepo"
- Sections: 1, 3, and 9
- Goal: refresh architecture documentation before plugin restructuring
- Constraint: use project guideline MCP before governed asset edits
```

## Output Expectations

- Target arc42 sections drafted or refreshed with explicit assumptions.
- Decisions and constraints linked to retrieved guidance context.
- Open questions recorded for user input.
- Cross-section consistency verified.
- Review-ready update set prepared.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. With no surface bound, skip these calls, say so once, and continue — file
artifacts remain the source of truth.

- Call `start_run` with `skillId: "flow-arc42"` and these stages: Context & Guideline
  Retrieval, Section Drafting, Cross-Section Review, Personal Validation, Create Pull
  Request, Work Item Update, Summary.
- During **Section Drafting**, also open/update the `render_markdown` surface operation with
  the drafted arc42 section content, per `instructions/surface-contract.instructions.md`.
  Optional; skip gracefully if not installed.
