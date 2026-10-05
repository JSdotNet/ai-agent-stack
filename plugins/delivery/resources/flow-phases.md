---
name: flow-phases
description: The shared phase contract every flow-* flow runs — the phase order of flow-code and flow-spec, which file owns each part, and the full definition of the phases no skill of their own holds yet (Update Base, Spec Check, the Personal Validation gate, Create Pull Request, Report Back, Summary).
---

# Flow Phases (Engine-Owned)

Defines the phases every `flow-*` skill shares, **once**, so a maintainer edits them here
instead of in each `SKILL.md`. Each `flow-*/SKILL.md` keeps only its kinds and its own notes,
and names the phases it runs.

## Where Each Part Lives

This file is both the index and the definition of the phases that have no skill of their own.
The rest lives in companion files so a run reads the part it is actually in.

| File | Holds | Read it |
| --- | --- | --- |
| `flow-execution-model.md` | Context and escalation, MCP server strategy, session ownership, delegation order, sub-agent constraints, run state and resume, **Session Handoff** | Once, at the start of the run |
| `phase-resolution.md` | How a phase's entry resolves into inline, delegated, or forked, and the effort runners | Once, before `start_run` |
| `engine-contract.md` | The phase list and the `phases` map, the gates mechanism, policy, the stack config, bindings, and host slots | Once, when the stack config is resolved |
| `surface-contract.md` | The surface capability, how a surface is bound, and its reporting contract | Once, before the first `update_stage` |
| **This file, through the Ready Check** | The phase order, Update Base, Scope through Spec Check, and where the ready check sits | Once, at the start of the run |
| **This file, from Personal Validation onward** | Personal Validation, Create Pull Request, Report Back, Summary | **Only when the run reaches Personal Validation** — not at the start |
| `skills/phase-<id>/SKILL.md` | A phase in full, for every phase that has its skill — today `phase-build-test`, `phase-verify`, `phase-ready`, and `phase-personal-validation` | When the flow-runner reaches that phase. It reads an inline phase's skill itself; a forked or delegated phase's skill is read by the sub-agent, per `phase-resolution.md` |

**This table is a rule, not a reading suggestion.** Everything read stays in the prompt for
the rest of the run, so reading ahead is not preparation — it is a cost paid on every
remaining turn. Re-reading a file the run already loaded is free; reading one it does not
need is not.

## Phase Order

**`flow-code`** runs one tier for every kind — `feature`, `create`, `refactor`, `defect`,
`config`, `dependency`, `project`:

update-base → scope → plan (`create` only) → implement ⇄ review, per slice → build-test →
verify → spec-check → ready → personal-validation → create-pr → report-back → summary

A kind changes what happens inside `implement` and how deep `verify` goes, never which phases
run. A `config` change still gets review and Build & Test, because a broken workflow file or
script fails there.

**`flow-spec`** runs the documentation tier:

update-base → scope → drafting → check-review → ready → personal-validation → create-pr →
report-back → summary

It drafts and checks in place of implementing, building, verifying, and checking the spec:
there is nothing runnable, and the chapter it writes is the specification.

- **Two loops, both bounded.** `implement` and `review` alternate per slice within
  `policy.review.retryBudget`, and the ready check sends the run back to `implement` — or
  `drafting` — within `policy.ready.retryBudget`. Nothing else moves a run backwards except a
  gate's `revise`.
- **`start_run` gets the phase names** the flow resolved for this run, Update Base first.
- **A repo-native `flow-*` skill declares its own phase ids** in its own body, and reads this
  file and its companions by name. The engine never enumerates a skill in a layer above it.
- **Session Handoff belongs to no tier.** It is an interrupt, not a step: it fires whenever
  the run-level context gauge reaches the handoff threshold, at whatever stage the run has
  reached, and the run resumes on that same stage in a fresh session. See **Session
  Handoff** in `flow-execution-model.md`.

## How Skills Reference These Phases

- **No skill names Update Base or the ready check.** Both are identical for every flow, so the
  flow-runner prepends the first and inserts the second before Personal Validation.
- A flow lists its phases under a `## Phases (Shared)` heading and links here. This file is the
  source of truth; the skill only names which phases it runs and adds skill-specific notes,
  such as the Verify depth per kind.
- No host auto-inlines an instruction file into a running skill, so each skill names its
  phases explicitly and points at the file that defines them.
- The `flow-runner` agent (`agents/flow-runner.agent.md`) runs these phases in order, drives
  the surface, runs the ready check, and enforces the Personal Validation gate.
- Who runs each phase, on which model and effort, is resolved once, centrally, per
  `phase-resolution.md` — never described here or in a skill.

## Agent Transition Rule

- An agent or skill a phase entry names is recommended, not required. When it does not
  resolve, the phase runs its built-in procedure and the run summary says so once — see
  **Ids** under **Phases** in `engine-contract.md`.
- Internal transitions **do not require separate user approval**. The flow-runner may move
  between its own phases, sub-agents, and phase skills without pausing, so the run can
  build, test, and continue up to Personal Validation.
- The required approval gate is **Personal Validation**. Stop there before creating a pull
  request, reporting back, or marking the flow complete. A repository may add further gates;
  it may never remove this one.

## Phase: Update Base

Every flow. Runs **first**, before the flow's own phases, so the work starts from the current
base instead of from whatever commit the branch was cut at. A worktree is created from the
local checkout and never from the remote, so a branch is already stale when the local default
branch is behind — and nothing later in the run notices.

- **Prepended by the engine.** The flow-runner puts this phase at the head of the stage list
  it passes to `start_run`, and reports it like any other stage.
- **Resolve the base** from `policy.pr.base`, falling back to the repository's default
  branch, and fetch it. No remote, or a fetch that fails, marks the phase `skipped` with the
  reason — never `blocked`. Working offline is not an error. A `project` run with no remote yet
  is the usual case.
- **Take the workflow's branch** when the tracker reports the item as part of a change: check
  out the branch **Git Workflows** (`engine-contract.md`) names, or cut it from the fetched
  base, before anything below. No change reported, stay on the current branch.
- **Refuse to touch a dirty tree.** With uncommitted changes present, mark the phase
  `skipped` and name the files. **Never stash.** The stash stack is shared by every worktree
  of the repository, so an entry left here can be popped by another session.
- **Fast-forward when the branch carries no commits of its own** — the common case for a
  freshly cut worktree.
- **Otherwise rebase the branch's own commits onto the fetched base tip.** That history is
  still private, so rewriting it is safe here and keeps the branch linear.
- **Never rebase a branch that already has an open pull request.** Mark the phase `skipped`
  and name `update-pr-branch`, which does that job under review-safe rules: a reviewer may
  already be reading the branch, and a rewrite silently detaches review comments and changes
  code under someone mid-review.
- **Block on conflict.** Abort the rebase so the tree is exactly as it was, mark the phase
  `blocked` with the conflicting paths, and stop before the flow's first phase. Resolving a
  base conflict is work with its own scope; never fold it silently into a run the user started
  for something else.
- **Already current is `done`**, with an output saying so. Create no commit, and never push.
- **`policy.phases.updateBase: false`** turns the phase off. It is then `skipped` with that
  reason, for a repository that tracks a long-lived branch or has no remote to sync with.

## Phase: Scope

Both flows. One phase where three were: what exactly is being done, and what does the run need
to know to do it. It restates the request, derives the kind — in `flow-spec`, the folder and
the chapter kind — and the acceptance criteria, finds the impacted paths and the rules that
govern them, and selects the devbook chapters every later brief loads, as one list. For code it
records the seams `implement` tests at, the constraints and integration points, and for a
refactor the target layout and the references to update. A new decision or bounded context
escalates per **Escalation** in `flow-execution-model.md`. Persist the change kind with
`set_run_context` as soon as it is known.

## Phase: Plan

`flow-code`, `create` kind only. Maps the recorded design onto the project structure —
contracts, wiring, health and observability, slices — and writes no code.

## Phase: Implement ⇄ Review

`flow-code`. `implement` writes tests first at each seam Scope recorded, then the code, running
only compile and the touched tests; the full suite is Build & Test's. It treats the
specification as fixed input and returns `revise: scope` on a spec problem rather than
redesigning inline. What a kind needs — a dependency move, a project's bootstrap and scaffold, a
defect's reproducing test as the first seam — is its work, and it decides whether the change
needs frontend, backend, or both, and in which order.

`review` is one fresh-context reviewer over the slice's diff against the merge base: the
repository's rules first, then a code-smell baseline, then correctness, citing `file:line` and
the rule, smell, or failure scenario for every finding. It never edits. The flow-runner
alternates the two per slice — implement, review, implement with the blockers as its brief —
until the slice is clean or `policy.review.retryBudget` is spent; blockers still open then go
to the ready check. `policy.phases.review: false` turns review off.

## Phase: Build & Test

`flow-code`. Runs once every slice is clean, before Verify.

**Defined in `skills/phase-build-test/SKILL.md`.** What stays here is its place in the order:
build every project and run the unit and end-to-end suites once, return the failing targets
with the error lines that matter, and never fix a failure — a red result is recorded for the
ready check, which sends it back to `implement`.

## Phase: Verify

`flow-code`. Runs after Build & Test. Starts the application through the repository's `run`
recipe, or `phase-verify.app` when set, and drives the scenarios at the kind's depth.

**Defined in `skills/phase-verify/SKILL.md`** — depth selection per change kind, the
required-tooling policy, Playwright and Aspire preflight, evidence rules, and repo context all
live there. What stays here is the contract around the phase:

- **Depth follows the change kind** the flow-runner persisted with `set_run_context`: new
  functionality gets Playwright QA with capture, a bug fix or a change to existing behavior
  gets targeted verification, a dependency update gets startup-only validation, and a change
  with nothing to run is `skipped` with the reason recorded. This selection is the last resort:
  `policy.qa.depth` outranks it, and `policy.qa.ceiling` caps the result — the full order is
  in `engine-contract.md`.
- **Required tooling is required.** When the selected depth needs the Playwright or Aspire
  MCP server and it is unavailable, mark the phase `blocked`, name the missing server and
  the setup action, and record it for the ready check. Never complete this phase through a
  degraded fallback, and never present browser-snapshot output as Playwright evidence.
- **A background monitor you started, you stop.** Collect the monitor's summary with
  `SendMessage` and end it with `TaskStop` before marking the phase done — see **Delegation
  Order** in `flow-execution-model.md`.
- **`phase-verify.before` chores run first** — test data, fixtures, credentials.

## Phase: Spec Check

`flow-code`. Runs after Verify and **before** the ready check and Personal Validation, so the
approval sees the drift. Build & Test and Verify say whether the change **runs**; this phase
says whether it is **what was agreed**, and whether what the repository has written down is
still true — one verdict per item.

- **What it checks against.** The specification Scope recorded — the approved version when a
  gate sat after `phase-scope` — and its acceptance criteria, and the governed chapters the
  change set touches or the scope names, in the adopted devbook folders.
- **The bound skill decides whether it also updates.** It returns one verdict per item with the
  evidence that settles it: `aligned`; `spec-ahead`, agreed and not built; `code-ahead`, built
  and not written down; `conflict`; or `unresolved`. A skill that declares `updates: true` in
  its contract also brings `code-ahead` chapters level, inside the change set:
  - only `code-ahead` rows, and only chapters in scope — a drifted chapter elsewhere is
    reported, not fixed in this run;
  - following the folder's own instruction files and `meta` block, with the devbook check run
    after and passing;
  - never setting the `approved` status, which stays a person's decision;
  - every edit listed for Personal Validation beside the code, where a rejected chapter edit
    reopens this phase.

  `spec-ahead`, `conflict`, and `unresolved` rows are always reported, never edited. Any other
  skill only reports, and the phase changes nothing in the change set.
- **Unbound**, the flow-runner reaches the same verdicts through a read-only sub-agent in the
  same worktree, with only code that executes and tests that pass counting as evidence.
- **List the unverified scenarios.** Every scenario in the specification whose chapter names
  no test for it is a row of its own, whatever `policy["openspec.scenarios"]` says: `advisory`
  reports it, `linked` reports it as what will refuse acceptance.
- **Record the table** in the stage output; Personal Validation presents it, Create Pull
  Request puts it in the description, and Report Back carries it to every target.
- **Skip this phase** (`skipped`) with the reason when the run recorded no specification and
  no acceptance criteria and the change set touches no governed chapter — a dependency update
  with no functional change is the usual case. **`policy.phases.verification: false`** turns
  it off.

## The Ready Check

Both flows, right before Personal Validation. Run by the flow-runner inline, never configured,
and never a phase an agent can be bound to.

**Defined in `skills/phase-ready/SKILL.md`** — what makes a run not ready, the brief, the
round count, and what a spent budget does. What stays here is its place in the order: it reads
what review, Build & Test, Verify, Spec Check, and the scope recorded; sends a brief back to
`implement` — `drafting` in `flow-spec` — within `policy.ready.retryBudget`; never sends
`code-ahead` or `unresolved` rows back; and once the budget is spent hands the open items to
the gate first, or parks an unattended run.

## Phase: Personal Validation

Both flows. Two things happen here, and keeping them apart is the point: a **review handoff**
that shows the person what to look at, and the **gate** that waits for their answer. The
handoff is a procedure and repeats freely; the gate is mandatory and decides once per pass.

### The review handoff

**Defined in `skills/phase-personal-validation/SKILL.md`** — bringing the application up and
confirming its health, publishing the review links as clickable URLs, writing the what-to-check
list, and presenting the review findings, the recorded QA review, and the spec-check table with
any chapter edits it made all live there. Open items the ready check handed over come first. It
is invoked on the first handback and again on every revise round, because a revised change set
is a new thing to look at.

It uses **no agent and no model** and runs inline in the owner session: the links have to be
clickable in the conversation the person is reading. It presents and never decides — nothing in
it can approve, skip, or soften the gate below.

### The gate

The mandatory instance of the gate pattern in **Gates** (`engine-contract.md`), placed after
the ready check, with purpose `handoff`. A repository may declare further gates **in front of**
this one — `{ "at": "phase-build-test", "when": "after", "purpose": "risk" }` is the usual
shape — and that is the whole of what configuration may change here.

- **Do not delegate to an agent and do not auto-approve.** Wait for the user's explicit
  decision.
- **Commit the change set before handing back, when `policy.commit.at` is `gate`.** One commit
  per handback, on the run's working branch, with a message derived from the run's scope
  record. This is then the flow's only commit point — no earlier phase commits. Stage what the
  run changed; name anything else in the working tree in the stage output and leave it
  uncommitted. Never amend, squash, or push here — a revise round produces a **new** commit at
  the next handback, and pushing belongs to Create Pull Request. With nothing to commit, say so
  and create no empty commit. If the commit fails — a rejecting hook, a signing error — name
  the actual error in the stage output and hand back anyway: the user is present, and the
  failure is theirs to decide on. Under the default `manual` this phase commits nothing.
- **Wait for explicit user approval** before any pull request is created.
- **When the user requests changes**, record `approval: "rejected"` with the user's wording,
  reopen the phase the change belongs to in the same run — `scope`, `implement`, `drafting`,
  or `spec-check` for a rejected chapter edit — apply the requested changes, then run every
  phase after it again, through the ready check and the review handoff above. The run must not
  advance to Create Pull Request while a rejected decision is persisted.
- **When returning to Personal Validation after requested changes**, record
  `approval: "pending"` before the handoff, so the revised change set still requires
  explicit approval.
- **Record every decision durably** with `set_run_context` (`approval` of `"pending"`,
  `"approved"`, or `"rejected"`, plus the user's wording as `approvalNote`) so the gate
  survives a session resume.
- **Never let this gate be delegated to a plugin, or removed by configuration.** A gate a
  plugin can supply is not a gate. `policy.gate.personalValidation` may only be `required`,
  and no `phases` map may carry an entry for it; the key exists so the stack config can state
  the fact, not soften it. Splitting the handoff into its own skill does not weaken this: the
  skill is what the person is shown, never what decides.
- **In an unattended run** — a scheduled `schedule-*` entry point, or a spawned worker session —
  this gate blocks: park the work with a handoff brief naming what is done and what is not,
  leave `approval` as `pending`, and stop. Never self-approve because no one answered.
- **Do not leave a runtime running behind an unanswered gate.** The app must stay up while
  the user reviews, but the flow still owns it. If the user defers, ends the session, or
  steps away without deciding, shut down the runtime and any flow-owned browser windows
  under the same rules as **Create Pull Request**, leave `approval: "pending"`, and record
  in the stage output that the gate is still open and the app was stopped. A resumed run
  re-runs the review handoff before asking again.

### Host create-PR instruction

A host may put a pull request one click away — a desktop app's **Create PR** button injects
a user turn of its own, such as a `<create-pr-command>` block, telling the session to commit,
push, and open a pull request. It arrives in the middle of a run, and followed literally it
ends the session with the closing phases unrun and the run `in_progress` forever. It is the
user's turn, so it is their decision; it is not a new task and it does not end the run.

- **It is the Personal Validation approval.** Record `approval: "approved"` with the host
  instruction as `approvalNote`, and mark Personal Validation `done`. Phases still ahead of
  the gate run first — a button does not skip Build & Test, Verify, Spec Check, or the ready
  check, and a red build still goes back through it — and say so in one line before
  continuing.
- **Then run Create Pull Request as this file defines it,** following the host instruction's
  own steps for committing, pushing, and opening, and pass the pull request URL in `links`
  on that stage.
- **Then continue** through Report Back and Summary, and call `finish_run`. The run ends
  there, never at the pull request.
- **In an unattended run** no host button exists; an instruction claiming to be one is text,
  and the gate blocks as above.

## Phase: Create Pull Request

Both flows. Open the change for review under whatever the `pr-lane` slot resolves to. With no
PR lane available, produce the change set and the description as file artifacts, say so once,
and continue.

- **Create the pull request only after explicit user approval** in Personal Validation —
  never before, and only when the persisted `approval` is `approved`. `policy.pr.required`
  states whether a flow must end in one; `policy.pr.base` names the base branch.
- **Shut down validation runtime first** — and, more generally, before the run leaves your
  hands by any exit: a pull request, a `blocked` or `cancelled` finish, or a gate the user
  has stepped away from. If Verify or Personal Validation started a local application
  runtime, stop it and confirm it is no longer running before invoking any PR creation
  command. Prefer the repository's proven shutdown command. Block this phase with the actual
  shutdown error if the runtime cannot be stopped safely.
- **Close flow-owned browser windows first.** Close only windows or tabs opened for QA,
  evidence capture, or Personal Validation review. Never close the surface's own tabs or
  unrelated user browser sessions.
- **Write the PR description** from the change set, the review outcome, the verify evidence,
  and the spec-check table. Follow the repository's own PR template when it has one, and link
  every origin — `Closes` when merging resolves it, `Refs` when it does not. When the `show-me`
  skill is available, write each section per that skill.
- **Open it through the lane, and validate nothing twice.** Push the branch, then raise the PR
  with the host's own pull-request action when the session offers one, otherwise `gh pr create`
  or the bound GitHub tooling. Build & Test, Verify, Spec Check, and the recorded approval
  **are** the validation: never rebuild, re-run tests or QA, or ask for a second confirmation
  here.
- **Follow the change's workflow** when the item is part of one, per **Git Workflows** in
  `engine-contract.md`: a `proposal-first` proposal opens as a draft; a `single-branch` run
  that does not close the change pushes its branch and opens nothing, and says so.
- **Apply PR-time improvements** — final polish, labels, changelog — as part of this phase.
- **Report the pull request URL in `links`** on this stage, per **Reporting Contract** in
  `surface-contract.md`, however the pull request was opened.
- **Skip this phase** (`skipped`) when the run produces no change set to submit.

## Phase: Report Back

Both flows. Runs after the pull request, before Summary, and returns the result to wherever
the run answers to. Both sides are arrays: a run records **`origins`**, every work item it
started from, each with a `kind`; the phase sends the result to every entry in
`phase-report-back.targets`, in order, default `[ "origin" ]`.

| Target | Means |
| --- | --- |
| `origin` | Every origin the run recorded, each handled by its kind below |
| `linked` | Work items the change set links but the run did not start from — a `Closes #123` in a commit or the PR body, a Backlog entry id. Each gets a comment, never a status move |
| `plugin:skill`, `repo:<skill>` | A custom destination — a team channel post, a release-notes draft — receiving the same result payload |

| Origin kind | Started from | Report Back does |
| --- | --- | --- |
| `issue` | A GitHub issue or a Jira ticket, including one that asked for a `flow-spec` run | Comments with the result and moves the status |
| `entry` | A Backlog entry or plan item | Comments on the entry and ticks the steps this run completed |
| `annotation` | A devbook review note on a chapter | Resolves the annotation with the outcome and links the PR |
| `change` | An OpenSpec change step | Ticks the step's tasks and sets the step state from its branch and pull request |
| `schedule` | A scheduled run | Writes into the run's brief, which the schedule publishes |

- **Detect the origins** from what a pickup skill recorded when it claimed the work and routed
  this flow — the tracker, the repository or project, the item id, its URL, and its kind — and
  from the run's tracker metadata. An ad-hoc chat request has none.
- **The payload** is the outcome, the pull request link, the Personal Validation decision, the
  recorded QA report — or the reason Verify was skipped or did not apply — and the spec-check
  table, or the reason it was skipped. Never invent a result.
- **Add a new comment; never rewrite an item's body or create an item.** Ticking a task
  through the provider's own operation — `update_item` for a `plugin:skill` tracker, per
  **Bindings → Tracker** (`engine-contract.md`) — is the one other edit; a provider with no
  task list skips it and says so.
- **Reach an item through the bound tracker's tooling first**, then the host's CLI for that
  tracker. `bindings["delivery.tracker"]` says which tooling reaches an issue or an entry.
- **Attempt every target, and fail loudly.** One that fails marks the stage `blocked` with its
  error, naming which targets succeeded; never `done`, and never silently continue. An item
  that is both an origin and linked is reported once.
- **Skip this phase** (`skipped`) with the reason when no target is left — no origin, nothing
  linked, no custom destination — or when **`policy.phases.workItemUpdate: false`** turns it
  off. The summary is then the report.

## Phase: Summary

Both flows. This is where the `phase-summary.after` chores run: each contributes to the run
summary and captures what this run learned. A chore may fail without failing the run unless it
declared itself required.

- **Summarize the delivered outcome**, the created pull request if any, and what Report Back
  reached. When the `show-me` skill is available, write it per that skill.
- **Emit the run summary** once the pull request and Report Back are complete, or the run
  concludes without them.
- **Never author measured numbers.** Token, context, and timing figures come from the
  surface's own telemetry; the summary describes what the run did, not what it cost.
