---
name: start-session-from-issue
description: >
  Start this session's work from a single GitHub issue: fetch the issues matching a filter,
  select one, claim it, route it to the flow-* skill that matches its type, and run that
  flow here. One issue per run, no extra sessions. Use when: picking up an issue
  for implementation, pulling the next item off the backlog, or running a scheduled backlog
  pickup.
---

# Start Session from GitHub Issue

## Purpose

Turn one GitHub issue into work in progress. Fetch the open issues matching a filter, select
a single issue, claim it, decide which `flow-*` flow its type calls for, and run
that flow **in this session** with the issue context and origin metadata baked in.

This is the generic counterpart to `automation-bug-fix`: any filter, any issue type, routed
to the matching flow rather than always `flow-bug`.

## One Issue Per Run

This skill starts **this** session's work from one issue. It does not prepare work for other
sessions, and it never spawns an agent to run the flow.

A `flow-*` run needs its own session: it must be able to ask about what is ambiguous, hold
the Personal Validation gate, and own its surface run. `AskUserQuestion` is foreground-only
and a sub-agent has no user turn to wait for — see **Session Ownership** and **Sub-Agent
Constraints** in `instructions/flow-execution-model.instructions.md`. Scoping a run to one
issue is what makes that work: this session is the owner session, so the flow is
plan-first and gated for real.

To work a second issue, run this skill again in another session. Each run claims a different
issue, because the previous one is filtered out as in flight.

## Inputs

- GitHub repository in `owner/repo` format (required).
- Issue filter — any combination of:
  - Label(s): e.g. `bug`, `feature`, `sprint-42`.
  - Milestone: milestone title or number.
  - Assignee: GitHub username (`@me` for yourself).
  - State: `open` (default) or `all`.
- Selection rule when the filter matches more than one issue: `oldest` (default),
  `newest`, or `highest-priority` (by severity or priority label).
- Selection override: an explicit issue number to work instead of the ranked pick (optional).
- Base branch to branch from (default: repository default branch).
- Plan-first: `true` (default on an interactive run — the flow proposes its plan and
  waits for approval before implementing) or `false` (the flow's own stage gating
  applies). An unattended run cannot wait for a plan approval, so it records the plan and
  continues; see step 11.

## Workflow

### Phase 1 — Fetch Matching Issues

1. List the issues matching the filter:

   ```bash
   gh issue list --repo <owner/repo> --state open --label "<label>" \
     --assignee "<user>" --milestone "<milestone>" \
     --json number,title,body,labels,assignees,milestone,url,createdAt
   ```

2. If nothing matches, report that and stop.

### Phase 2 — Filter Out Work Already In Flight

3. Drop every candidate already being worked, so a run never picks up a second person's
   work or restarts its own:

   - Labelled `in-progress`.
   - A branch or worktree carries its issue number — `git --no-pager worktree list`,
     `git branch --all`.
   - An open pull request references it.
   - Assigned to somebody other than the current user.

4. If every match is filtered out, say so and stop without claiming anything.

### Phase 3 — Select One Issue

5. Apply the selection rule to the remaining candidates and take the **top one only**. When
   the selection override names an issue number, take that one instead — and still apply the
   Phase 2 in-flight check to it.

6. Report the selection, the number of candidates deferred, and the runner-up, so the next
   run's pick is predictable.

7. **Confirmation depends on whether a user is there.**

   - **Interactive run:** ask the user to confirm the selected issue, or name a different
     one. Do not proceed until they answer.
   - **Unattended run** (scheduled routine, no user turn available): proceed without
     confirmation. The scope is one issue, the Phase 5 claim prevents a double pickup, and
     the flow still stops at Personal Validation before any pull request.

### Phase 4 — Route to an Flow

8. Decide which `flow-*` skill the issue's type calls for. Read the issue body and labels,
   not the labels alone — a mislabelled issue routes on what it actually asks for:

   | Issue is about | Flow |
   |---|---|
   | A defect in existing behavior | `flow-bug` |
   | New or changed feature behavior, including small UI tweaks | `flow-feature` |
   | A new module, or carving one out of an existing area | `flow-create-module` |
   | A new service, or extracting one | `flow-create-service` |
   | Folder moves, project/solution layout, test placement | `flow-structure` |
   | Dependency or package updates | `flow-update-packages` |
   | An Aspire version upgrade | `flow-aspire-update` |
   | Architecture, ADR, arc42, blueprint, TDR | `flow-architecture`, `flow-adr`, `flow-arc42`, `flow-tdr` |
   | Anything no skill above covers — tooling, CI, scripting, housekeeping | `flow-fallback` |

   This mirrors the routing the plugin's `SessionStart` hook installs; a repository may ship
   its own `flow-*` skills in the host's repo-native skill folder, and those take precedence for the
   categories they cover. `flow-fallback` is the last resort, not an escape hatch.

   State the routing decision and its reason before acting on it. When the issue is too
   ambiguous to route, ask (interactive) or route to `flow-fallback` and say so (unattended).

### Phase 5 — Claim and Run

9. Claim the issue before touching any code:

   ```bash
   gh issue edit <number> --repo <owner/repo> --add-assignee "@me"
   gh issue edit <number> --repo <owner/repo> --add-label "in-progress"
   ```

   Create the `in-progress` label first if the repository does not have it:

   ```bash
   gh label create "in-progress" --repo <owner/repo> --color "0075ca" \
     --description "Issue is actively being worked on"
   ```

   If the claim fails, stop and report it. Never start work on an issue that could not be
   claimed.

10. Run the routed flow in **this session** with the context below. Pass the GitHub
    origin as `githubIssue` to `start_run`, so the run reports its captured result and QA
    report back to the issue.

    ```text
    GitHub issue #<number>: "<issue title>"

    GitHub issue origin:
    Repository: <owner/repo>
    Issue Number: <number>
    Issue URL: <issue url>

    Issue description:
    <issue body>

    Labels: <labels>
    Milestone: <milestone or "none">
    Branch: <type>/<number>-<slug> from <base branch>
    ```

11. When plan-first is enabled, the flow's scope-discovery stage proposes its plan —
    files to create or modify, key design decisions, risks and assumptions — and waits for
    approval before implementing.

    On an **unattended run** there is nobody to approve, so record the plan as the stage output
    and continue into implementation rather than parking the routine on a gate that cannot be
    answered. Nothing is lost by continuing: the flow still stops at Personal
    Validation, where the user reviews the recorded plan and the change it produced together,
    and no pull request is opened before that. Stop at the plan instead only when the routine
    was explicitly configured to — for work where implementing on an unreviewed plan is the
    expensive mistake, such as an architecture or migration issue.

12. **Never spawn an agent to run the flow**, and never pick up a second issue in
    this run.

### Phase 6 — Summary

13. Output a summary:

    | Field | Value |
    |-------|-------|
    | Issue worked | #42 — `Add login page` |
    | Routed to | `flow-feature` (feature behavior, labelled `feature`) |
    | Claimed | `@me`, `in-progress` |
    | Outcome | Plan recorded, implementation complete, awaiting Personal Validation |
    | Candidates deferred | 3 (next up: #37 — `Fix null pointer`) |
    | In flight, skipped | 1 |

14. State what the next run will pick up and what still needs the user.

## Surface Reporting

Follow the **Reporting Contract** in `instructions/surface-contract.instructions.md`.
With no surface bound, skip the calls, say so once, and continue — file artifacts remain
the source of truth.

- `start_run` with `skillId: "start-session-from-issue"` and these stages: Fetch Matching Issues, Filter Out
  Work Already In Flight, Select One Issue, Route to an Flow, Claim and Run,
  Summary.
- The flow in Phase 5 opens its own run, with this run's `githubIssue` metadata
  carried into its `start_run`. Reference that run id in the Claim and Run stage output
  rather than duplicating its stages here.

## Output

- Exactly one issue selected, claimed, routed, and worked up to Personal Validation.
- The routing decision and its reason, on the record.
- The remaining candidates deferred, with the next run's pick named.
- No extra sessions requested, and no agents spawned.

## Notes

- To work several issues in parallel, launch several sessions yourself and run this skill
  once in each — every run claims a different issue, so they do not collide. A separate
  worktree per session keeps their change sets apart. Do not try to make one run cover
  several issues.
- Safe to run on a schedule: a run either starts one issue or is a clean no-op. Because the
  claim happens before any code is written, an interrupted run leaves at most one issue
  labelled `in-progress` with a branch to resume from.
- Remove the `in-progress` label when an issue is abandoned, or later runs keep skipping it.
- For Jira issues, replace the GitHub fetch with a Jira skill query using the same field
  mapping (issue key, summary, description, labels).

## Related Skills

- `automation-bug-fix` — the same single-issue pickup narrowed to `bug` issues, always routed
  to `flow-bug`, ranked by severity.
- `pr-merge-ready` — takes the pull request behind the finished work to merge-ready, one PR
  per pass.
- **Session Handoff** in `instructions/flow-execution-model.instructions.md` — hand this
  session's in-flight run to a fresh session when its context fills, rather than starting the
  issue over.
