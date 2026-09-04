---
applyTo: 'skills/flow-*/SKILL.md'
description: The shared phase contract every flow-* flow runs — which phases each tier runs and in what order, which file owns each part, and the full definition of the closing phases (Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary).
---

# Flow Phases (Engine-Owned)

Defines the phases every `flow-*` skill shares, **once**, so a maintainer edits them here
instead of in 16 `SKILL.md` files. Each `flow-*/SKILL.md` keeps only its own stages inline
and names the shared phases it runs.

## Where Each Part Lives

This file is both the index and the definition of the closing phases. The rest lives in
companion files so a run reads the part it is actually in.

| File | Holds | Read it |
| --- | --- | --- |
| `flow-execution-model.instructions.md` | Context and escalation, MCP server strategy, session ownership, delegation order, sub-agent constraints, run state and resume, **Session Handoff** | Once, at the start of the run |
| `flow-model-selection.instructions.md` | Category → model resolution and the personal override | Once, before `start_run` |
| `surface-contract.instructions.md` | The extension points, the gates mechanism, the stack config, the surface capability and its reporting contract | Once, before the first `update_stage` |
| `flow-repo-context.instructions.md` | The `.claude/flow-context.md` convention | **Only if that file exists.** Check first; when it is absent there is no convention to apply |
| **This file, from Personal Validation onward** | Personal Validation, Create Pull Request, Documentation Update, Work Item Update, Summary | **Only when the run reaches Personal Validation** — not at the start |
| `skills/phase-build-test/SKILL.md` and `skills/phase-qa-validation/SKILL.md` | Build & Test and QA Validation, in full | When the flow-runner invokes them. It reads them itself, because it owns depth selection and the stage reporting; the sub-agent it delegates to receives the instruction, not the file |

**This table is a rule, not a reading suggestion.** Everything read stays in the prompt for
the rest of the run, so reading ahead is not preparation — it is a cost paid on every
remaining turn. Re-reading a file the run already loaded is free; reading one it does not
need is not.

## Phase Tiers

- **Code-modifying flows** — `flow-feature`, `flow-bug`, `flow-structure`,
  `flow-create-module`, `flow-create-service`, `flow-create-mvp`, `flow-update-packages`,
  `flow-aspire-update`, `flow-project` — run, in order: **Build & Test → QA Validation →
  Personal Validation → Create Pull Request → Documentation Update → Work Item Update →
  Summary**.
- **Documentation/config flows** — `flow-adr`, `flow-tdr`, `flow-arc42`,
  `flow-architecture`, `flow-repo` — run: **Personal Validation → Create Pull Request →
  Work Item Update → Summary**. They produce no runnable code change, so the first two
  phases do not apply.
- **`flow-fallback`** has no fixed tier: it runs the code-modifying tier when its Routing
  Check determines a code-modifying change kind, and the documentation/config tier
  otherwise. It reports the resolved tier's phase names in `start_run`.
- **A `flow-*` skill shipped by a bridge plugin declares its own tier** in its own body,
  and reads this file and its companions by name. The engine never enumerates a skill in a
  layer above it, so a tier is not something it can assign from here.
- **Session Handoff belongs to no tier.** It is an interrupt, not a step: it fires whenever
  the run-level context gauge reaches the handoff threshold, at whatever stage the run has
  reached, and the run resumes on that same stage in a fresh session. See **Session
  Handoff** in `flow-execution-model.instructions.md`.

## How Skills Reference These Phases

- A skill lists its shared phases under a `### Final Phases (Shared)` heading and links
  here. This file is the source of truth; the skill only names which phases it runs and adds
  skill-specific notes, such as the QA scope.
- No host auto-inlines an instruction file into a running skill, so each skill names its
  phases explicitly and points at the file that defines them.
- The `flow-runner` agent (`agents/flow-runner.agent.md`) runs these phases in order, drives
  the surface, and enforces the Personal Validation gate.
- Model choice for every phase and every skill-specific stage is resolved once, centrally,
  from `flow-model-selection.instructions.md` — never described here or in a skill.

## Agent Transition Rule

- Cross-plugin agents are recommended, not required. When a referenced plugin is not
  installed, skip the stage or perform it manually and continue with the remaining stages.
  A role bound in `.github/ai-agent-stack.json` resolves first; see **Bindings** in
  `surface-contract.instructions.md`.
- Internal transitions **do not require separate user approval**. The flow-runner may move
  between its own stages, sub-agents, and phase skills without pausing, so the run can
  build, test, and continue up to Personal Validation.
- The required approval gate is **Personal Validation**. Stop there before creating a pull
  request, updating a work item, or marking the flow complete. A repository may add further
  gates; it may never remove this one.

## Phase: Build & Test

Code-modifying tier. Runs first, before QA Validation and Personal Validation.

**Defined in `skills/phase-build-test/SKILL.md`** — steps, agents, MCP servers, and stage
reporting all live there. What stays here is its place in the tier: build every project, run
the unit suite, run the automated end-to-end suite, and never continue to QA Validation or
Personal Validation on a red build or a failing test. When all three are green, continue to
QA Validation without a confirmation prompt.

This phase is the `verify` service point. When a repository binds `verify`, that provider
supplies the build and suite run and returns the failing targets; the phase skill is the
default provider when nothing is bound.

**Model Category:** Implementation & Coding.

## Phase: QA Validation

Code-modifying tier. Runs after Build & Test.

**Defined in `skills/phase-qa-validation/SKILL.md`** — depth selection per change kind, the
required-tooling policy, Playwright and Aspire preflight, evidence rules, repo context, and
revalidation after requested changes all live there. What stays here is the contract around
the phase:

- **Depth follows the change kind** the flow-runner persisted with `set_run_context`: new
  functionality gets Playwright QA with capture, a bug fix or a change to existing behavior
  gets targeted verification, a dependency update gets startup-only validation, and a change
  with nothing to run is `skipped` with the reason recorded. `policy.qa.depth` in the stack
  config overrides that selection, and `policy.qa.ceiling` caps how far it may escalate.
- **Required tooling is required.** When the selected depth needs the Playwright or Aspire
  MCP server and it is unavailable, mark the phase `blocked`, name the missing server and
  the setup action, and stop before Personal Validation. Never complete this phase through a
  degraded fallback, and never present browser-snapshot output as Playwright evidence.
- **A background monitor you started, you stop.** Collect the monitor's summary with
  `SendMessage` and end it with `TaskStop` before marking the phase done — see **Delegation
  Order** in `flow-execution-model.instructions.md`.

This phase covers two service points: `app.start` starts the runtime and returns base URLs
and a health verdict, and `qa.run` turns scenarios into evidence. The `data.prepare` chores
run before both.

**Model Category:** Testing, QA & Monitoring.

## Phase: Personal Validation

Every tier. This phase uses **no agent and no model** — it hands control back to the user
and waits. It is the mandatory instance of the gate pattern in **Gates**
(`surface-contract.instructions.md`), placed after `verify` with purpose `handoff`.

- **Do not delegate to an agent and do not auto-approve.** Pause and wait for the user's
  explicit decision.
- **Present the code review** of the change set for the user to read.
- **Present the recorded QA review** — scenarios, pass/fail, monitoring findings, and any
  captured evidence — when QA Validation ran.
- **Start the application for the user** when the run produced a code change, using the
  resolved repo context startup command or the command proven during QA Validation. Do not
  stop at listing commands unless startup is impossible; if startup fails, block Personal
  Validation with the actual failure and the recovery command.
- **Publish quick review links** for the running target — the primary app URL, the runtime
  dashboard, a health page, any route that needs review — as `links` on the stage, so the
  user opens the review target directly instead of copying commands.
- **Wait for explicit user approval** before any pull request is created.
- **When the user requests changes**, record `approval: "rejected"` with the user's wording,
  reopen the appropriate implementation or specification stage in the same run, apply the
  requested changes, then repeat Build & Test, QA Validation, and Personal Validation. The
  run must not advance to Create Pull Request while a rejected decision is persisted.
- **When returning to Personal Validation after requested changes**, record
  `approval: "pending"` before the handoff, so the revised change set still requires
  explicit approval.
- **Record every decision durably** with `set_run_context` (`approval` of `"pending"`,
  `"approved"`, or `"rejected"`, plus the user's wording as `approvalNote`) so the gate
  survives a session resume.
- **Never let this gate be delegated to a plugin, or removed by configuration.** A gate a
  plugin can supply is not a gate. `policy.gate.personalValidation` may only be `required`;
  the key exists so the stack config can state the fact, not soften it.
- **In an unattended run** — a scheduled `automation-*` skill, or a spawned worker session —
  this gate blocks: park the work with a handoff brief naming what is done and what is not,
  leave `approval` as `pending`, and stop. Never self-approve because no one answered.
- **Do not leave a runtime running behind an unanswered gate.** The app must stay up while
  the user reviews, but the flow still owns it. If the user defers, ends the session, or
  steps away without deciding, shut down the runtime and any flow-owned browser windows
  under the same rules as **Create Pull Request**, leave `approval: "pending"`, and record
  in the stage output that the gate is still open and the app was stopped. A resumed run
  restarts the app before asking again.

## Phase: Create Pull Request

Every tier. This is the `deliver` service point: open the change for review under whatever
the `pr-lane` slot resolves to. With no PR lane available, produce the change set and the
description as file artifacts, say so once, and continue.

- **Create the pull request only after explicit user approval** in Personal Validation —
  never before, and only when the persisted `approval` is `approved`. `policy.pr.required`
  states whether a flow must end in one; `policy.pr.base` names the base branch.
- **Shut down validation runtime first** — and, more generally, before the run leaves your
  hands by any exit: a pull request, a `blocked` or `cancelled` finish, or a gate the user
  has stepped away from. If QA Validation or Personal Validation started a local application
  runtime, stop it and confirm it is no longer running before invoking any PR creation
  command. Prefer the repository's proven shutdown command. Block this phase with the actual
  shutdown error if the runtime cannot be stopped safely.
- **Close flow-owned browser windows first.** Close only windows or tabs opened for QA,
  evidence capture, or Personal Validation review. Never close the surface's own tabs or
  unrelated user browser sessions.
- **Write the PR description** from the change set, the code review outcome, and the
  validation evidence.
- **Apply PR-time improvements** — final polish, labels, changelog — as part of this phase.
- **Skip this phase** (`skipped`) when the run produces no change set to submit.

**Agents:** *(default)* — no dedicated agent runs this phase, so the flow-runner performs it
directly under the category's resolved model.

**Model Category:** Review.

## Phase: Documentation Update

Code-modifying tier. Runs **after** Create Pull Request and before Work Item Update. This is
the `docs.update` chore point: additive, non-authoritative, and a clean no-op when nothing is
stale. Its job is to stop a change from shipping while the repository's own governed
documentation drifts out of date.

- **Skip this phase** (`skipped`) when Create Pull Request was skipped — there is no change
  set and no PR branch to update.
- **Discover the documentation surface.** Read the target repository's own conventions — the
  `repo-instructions` file, any repository `*.instructions.md`, and the checked-in knowledge
  folders it governs (`.arc42/`, `.domain/`, `.tech/`, `.design/`, `.ai/`, `docs/`,
  `README.md`) together with their per-chapter metadata format.
- **Decide whether documentation is now stale.** Compare the landed change set against that
  surface: did architecture, technology, deployment, a public API or contract,
  configuration, dependencies, or user-facing behavior change in a way the governed docs
  should record?
- **When updates are needed**, make them following the repository's own conventions, then
  **commit and push onto the existing pull request branch** so the open PR is updated in
  place — a doc change that stays uncommitted is a bug. Record what changed in the stage
  output, and reflect it in the PR body when it helps the reviewer.
- **Never rewrite the PR branch history.** Add a **new commit** only. By the time this phase
  runs a reviewer may already be reading the PR, so never amend, rebase, squash, or
  force-push the branch — doing so silently detaches review comments and changes code under
  someone mid-review.
- **Fail loudly if the commit or push is rejected**, which is expected in practice when the
  branch has moved. Mark the stage `blocked` — never `done` — with the actual error in the
  output; `done` would let the user believe the documentation shipped when it did not, the
  exact silent drift this phase exists to prevent. Recovery: rebase the **local** doc commit
  onto the updated remote branch and retry the push once; if it still fails, stop and report.
- **When nothing is stale**, mark the phase `done` with an output naming what was checked
  and why no change was needed. **Do not create a commit.**

Because this phase runs after the approved Create Pull Request and touches **documentation
only, never code**, it does not re-open the Personal Validation gate; the documentation
commit is surfaced in the pull request for the reviewer. If a documentation change turns out
to require code edits, treat that as new implementation work and route it back through the
earlier phases rather than committing code here.

**Agents:** the `docs` role when bound, run as a sub-agent in the **same worktree** so its
commit lands on the pull request branch; otherwise the flow-runner performs it directly.

**Model Category:** Documentation & Low-Complexity.

## Phase: Work Item Update

Every tier. Runs after the pull request and any documentation update, before Summary. It
speaks to whatever `bindings["delivery.tracker"]` names — GitHub issues, Jira tickets, or
`.backlog/` chapters when devbook is the bound tracker.

- **Detect the originating work item** from the run's tracker metadata when available, then
  from the origin block a pickup skill recorded when it claimed the item and routed this
  flow (the tracker, the repository or project, the item id, and its URL).
- **Skip this phase** (`skipped`) when no work-item origin is present, when the item cannot
  be determined, or when no tracker is bound and no tracker tooling is available. Include
  the reason in the stage output.
- **Add a new comment; never rewrite the item body.** The comment carries the captured
  result, the pull request link when one exists, the Personal Validation decision, and the
  recorded QA report.
- **Include the QA report** for code-modifying flows: scenario pass/fail/flaky status,
  monitoring findings, and captured evidence or report links when available. If QA
  Validation was skipped or does not apply, state that explicitly rather than inventing a
  result.
- **Use the bound tracker's own tooling first** — an installed tracker plugin skill or MCP
  integration — falling back to the host's CLI for that tracker. Never create a new item.
- **Fail loudly on update errors.** If posting the comment fails, mark the stage `blocked`
  with the actual error in the output; never `done`, and never silently continue.

**Agents:** *(default)*

**Model Category:** Documentation & Low-Complexity.

## Phase: Summary

Every tier. This is where the `flow.end` chores run: each contributes to the run summary and
captures what this run learned. A chore may fail without failing the run unless it declared
itself required.

- **Summarize the delivered outcome**, the created pull request if any, and the work item
  update outcome when applicable.
- **Emit the run summary** once the pull request and any applicable work item update are
  complete, or the run concludes without one.
- **Never author measured numbers.** Token, context, and timing figures come from the
  surface's own telemetry; the summary describes what the run did, not what it cost.

**Agents:** the `flow-runner` agent.

**Model Category:** Documentation & Low-Complexity.

## Quality Checks

- [ ] Shared phase prose is edited in the file that owns it, not copied into individual
      skills and not duplicated across the companion files.
- [ ] Each skill names its shared phases and links here.
- [ ] Build & Test runs before QA Validation and Personal Validation for code-modifying
      skills.
- [ ] Code-modifying flows continue through Build & Test and QA Validation without extra
      confirmation prompts, stopping at Personal Validation for the user's decision.
- [ ] QA Validation depth matches the change kind, or the stack config's `qa.depth` when set,
      and never exceeds `qa.ceiling`.
- [ ] Personal Validation waits for the user, uses no agent, and is never removed, softened,
      or delegated to a plugin.
- [ ] An unattended run parks at a blocking gate with a handoff brief instead of
      self-approving.
- [ ] The flow runs in one owner session; heavy work is delegated to sub-agents in the same
      worktree, and background sub-agents are used only for concurrent monitoring.
- [ ] `start_run` reattaches to an existing `in_progress` run instead of duplicating it.
- [ ] Change kind and the Personal Validation approval are persisted with `set_run_context`,
      and no pull request is created while approval is `pending`.
- [ ] Documentation Update runs after Create Pull Request, commits any governed-doc change
      onto the existing PR branch, never rewrites its history, and creates no commit when
      nothing is stale.
- [ ] Work Item Update runs before Summary, posts to the bound tracker only when the run has
      a work-item origin, and is skipped with a reason otherwise.
- [ ] Model choice per phase follows `flow-model-selection.instructions.md` and is never
      hardcoded in a skill or phase.
- [ ] Token and context figures are left to the surface's automatic capture and are never
      hand-written into stage output or the run summary.
- [ ] Stage cost is compared on the uncached token figure, never on the headline
      input + output total.
- [ ] Heavy work is escalated to a sub-agent as the context gauge approaches its limit,
      rather than running inline until compaction hits.
- [ ] Build & Test and QA Validation procedure lives only in the two phase skills; this file
      names them without restating them.
- [ ] A run hands off to a fresh session at the handoff threshold, with the gating decisions
      and the handoff note persisted on the run before the session ends.
- [ ] A resumed session reads the handoff note off the run before re-deriving context it was
      already handed.
