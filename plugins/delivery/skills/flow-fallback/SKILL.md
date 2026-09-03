---
name: flow-fallback
description: 'Generic flow entrypoint, for task categories with no dedicated flow-* skill — or when the skill that does match targets fundamentally different work. Routes the task to the closest specialist agent, runs a minimal plan-execute-review workflow, and closes through the shared phase tier matching the change kind.'
---

# Flow: Fallback

Execute a minimal, generic flow when no dedicated `flow-*` skill — plugin-provided
or repo-native — covers the requested task category, **or** when the skill that does match
is genuinely inapplicable to the task. It keeps the flow-first policy intact
without inventing a specialized workflow: a routing decision, a short plan, execution by
the closest specialist agent, then the shared closing phases for the tier the change
belongs to.

> **Unmet preconditions are not "inapplicable."** If a dedicated skill matches the task
> category but its stated preconditions do not hold — no approved specification, no
> acceptance criteria, no prior architecture sign-off — invoke that skill anyway and derive
> the missing inputs inside it (see the `flow-feature`/`flow-bug` exception in
> `instructions/flow-execution-model.instructions.md`). Reach for this fallback only when no
> skill covers the category, or when the matched skill targets a fundamentally different
> kind of work.

## Input Expectations

- Task description and desired outcome.
- Task category (for example testing, tooling, CI, scripting, repository housekeeping) so
  the closest specialist agent can be selected.
- Confirmation that no `flow-*` skill — plugin-provided or repo-native in the host's own
  skill folder — already covers the category, or a stated reason why the matched skill
  targets fundamentally different work.

## Workflow Stages

> Agent transitions follow the shared rule in
> `instructions/flow-phases.instructions.md`: cross-plugin agents are recommended,
> not required, and internal transitions continue without separate user approval until
> Personal Validation. If the selected specialist agent is not installed, perform the step
> directly and say so.
>
> Model choice per stage follows `instructions/flow-model-selection.instructions.md`
> (category defaults, overridable via personal global model selection). A category model
> applies only where the stage is delegated with an `Agent` call; an inline stage runs on
> the session's model.

### Stage 1: Routing Check
- **Confirm no dedicated `flow-*` skill matches** the task category, plugin-provided or
  repo-native
- **Stop and invoke the matching skill instead** when one matches but its preconditions are
  unmet — unmet preconditions do not justify this fallback
- **Select the closest specialist agent** for the category: `csharp-coding:coding` for
  implementation, `architecture:architect` for architecture-adjacent work,
  `documentation:documentation` for documentation, `qa:qa` for test and validation work
- **Determine the change kind** — code-modifying or documentation/config — because it
  selects the closing phase tier and the stage list passed to `start_run`

**Agents:** `flow-runner` agent (routing decision only)

### Stage 2: Plan
- **Restate the task goal and scope** in one or two sentences
- **Identify the files and folders likely touched** and the instruction files that govern
  them (the `repo-instructions` slot and any `**/*.instructions.md`)
- **Name the smallest validation** that proves the change: build, lint, test, or
  documentation review

**Agents:** the specialist agent selected in Stage 1

### Stage 3: Execute
- **Perform the change directly**, following the applicable instruction files and
  repository guardrails
- **Keep edits scoped to the stated task**; do not invent unrelated structure
- **Record blockers rather than widening scope** when the task turns out to need a
  specialized workflow after all

**Agents:** the specialist agent selected in Stage 1

### Stage 4: Review & Recommend
- **Run the validation named in Stage 2** and report its actual result
- **Summarize the changed files and paths** for the user
- **Recommend a dedicated `flow-*` skill** (created in a new session) when this task
  category is likely to recur, so future requests route through a proper flow
  instead of this fallback. When the fallback was reached because an existing skill was
  inapplicable, recommend amending that skill's scope instead of adding a new one.

**Agents:** the specialist agent selected in Stage 1

### Final Phases (Shared)

After Review & Recommend, this skill runs the shared closing phases defined once in
`instructions/flow-phases.instructions.md`, on the tier matching the change kind
determined in Stage 1:

- **Code-modifying change kind** — Build & Test → QA Validation → Personal Validation →
  Create Pull Request → Documentation Update → Work Item Update → Summary.
- **Documentation/config change kind** — Personal Validation → Create Pull Request →
  Work Item Update → Summary.

Personal Validation always hands back to the user (no agent), Create Pull Request happens
only after explicit user approval (mark skipped when there is no change set), the GitHub
Issue Update phase comments on the originating issue when the session started from one, and
Summary emits the run summary. See `instructions/flow-phases.instructions.md` for
the full phase definitions; update that file to change these phases for every
flow.

## Usage Pattern

```text
Invoke: flow-fallback
- Task: "Add a PowerShell lint script to CI"
- Category: tooling/CI
- Change kind: code-modifying
- Goal: closest specialist agent implements it directly; no dedicated flow-* skill covers this category
```

## Output Expectations

- Task completed by the closest specialist agent, following repository guardrails.
- Changed files and paths summarized for the user.
- Validation result reported as it actually came out.
- A recommendation to create a dedicated `flow-*` skill in a new session — or to amend an
  existing one — when the task category is likely to recur.

## Surface Reporting

This skill reports progress through whichever delivery surface is bound. Resolve it by
pattern from the live tool list and follow the shared **Reporting Contract** in
`instructions/surface-contract.instructions.md` for the
`start_run`/`update_stage`/`finish_run` cadence and the Personal Validation → Create Pull
Request gating. With no surface bound, skip these calls, say so once, and continue — file
artifacts remain the source of truth.

- Call `start_run` with `skillId: "flow-fallback"` and these stages: Routing Check, Plan,
  Execute, Review & Recommend, followed by the shared phase names for the tier determined
  in Stage 1.
- Call `set_run_context` with the `changeKind` as soon as Stage 1 determines it, since it
  selects the closing tier.

## Reference

Source skill location: `skills/flow-fallback/SKILL.md`
