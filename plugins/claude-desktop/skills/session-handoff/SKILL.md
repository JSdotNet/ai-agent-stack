---
name: session-handoff
description: "Package the current session's state into a self-contained brief another session can pick up — a fresh session on the same worktree, a new worktree, or a different repository — then hand back the ready-to-run first message and stop. Use when: context is running out, the 75%/85% context warning fires, handing work to a fresh session, continuing the work in another repo, or parking work to resume later."
---

# Session Handoff

## Purpose

End this session deliberately and let the **work** continue in the next one. This skill
captures what the next session would otherwise have to rediscover — objective, state on
disk, decisions already made, what is left, and how to verify it — writes it to a stable
path outside the conversation, and hands back a paste-ready first message.

Three shapes, one procedure:

| Target | Typical reason |
| --- | --- |
| **Same worktree, fresh session** | Context pressure. The branch, the change set, and the run all stay put. |
| **New worktree, same repo** | The work splits, or the next step should not share this change set. |
| **Another repository** | The next step lives elsewhere — the fix belongs to the API repo, the finding belongs to the platform repo. |

A handoff is not an abandonment, and what makes the difference is the brief. Without one the
next session pays a second time for everything this one learned, and a flow run left behind
looks merely idle.

## When Not to Hand Off

- The run is one short stage from finished. Finish it, and note the context pressure in the
  Summary.
- The user is at the Personal Validation gate right now. Take the decision first — the gate
  belongs to the session holding it.
- Nothing durable exists yet: no commits, no files, no decisions. Say so and keep working; a
  brief that says "I was about to start" costs more than it saves.

Everywhere else, a handoff mid-stage plus a re-read of the change set costs less than one
compaction.

## Inputs

- Target: `same-worktree` (default), `new-worktree`, or a repository path / `owner/repo`.
- Reason for the handoff, in one line — it goes in the brief.
- Optional: where the brief is written (default: the user-global handoff store below).
- Everything else is read from the session, the repository, and the run state.

## Hard Constraints

- **Never start the next session yourself, and never spawn an agent to run the handoff.** A
  handed-off session must be able to ask what is ambiguous, hold the Personal Validation
  gate, and own its run — none of which a sub-agent can do. See **Session Ownership** and
  **Sub-Agent Constraints** in the delivery engine's
  `instructions/flow-execution-model.instructions.md`.
- **Never mark the stage in flight `done`** to leave things tidy. A resumed run continues
  from the first stage that is not `done`, so a stage rounded up is a stage the next session
  skips.
- **Never hand off an undescribed uncommitted diff.** Commit the work in progress, or spell
  out in the brief what is uncommitted and why. The next session inherits the worktree but
  none of the reasoning behind it.
- **Never put secrets in the brief.** It is written outside the repository and may be pasted
  into another session — keep tokens, connection strings, and `.env` contents out of it.
  Reference the file that holds them instead.
- **Never claim a handoff without writing the brief.** If the brief cannot be written, say so
  and keep the session open.

## Workflow

### 1 — Confirm the handoff is the right move

Check the **When Not to Hand Off** cases above. If one applies, say which and stop.

Otherwise, state in one line what is being handed off and to which target.

### 2 — Capture the state on disk

Read what the next session inherits — do not describe it from memory:

```bash
git --no-pager rev-parse --show-toplevel
git --no-pager branch --show-current
git --no-pager status --short --branch
git --no-pager log --oneline -10
git --no-pager diff --stat
git --no-pager worktree list
```

Collect, in addition:

- The **objective** in the user's own framing, and the reason for the handoff.
- **Decisions and assumptions** made in this session that are not visible in the diff — the
  approach chosen, the alternatives rejected and why, constraints the user stated.
- **What is done and what is not**, concretely: files created or changed, and what remains.
- **Verification**: the exact build, test, and run commands already used, and their last
  known result. Include the app URL or the surface's run link if one was open.
- **Open questions** the next session must resolve, each with the default it should take if
  the user does not answer.
- **Evidence and artifact paths** as absolute paths — screenshots, reports, plans under
  `.wip/`.
- **Origin metadata** when the work came from a tracked item: repository, item id, item URL.
  Carry it forward so the next session can still report back to it — it passes this as
  `workItem` when it reattaches the run.

### 3 — Resolve the target

**Same worktree** — record the worktree path and branch; the next session opens on them
unchanged.

**New worktree** — say which branch it should be created from, and note that this worktree's
uncommitted changes will not be there.

**Another repository** — this is where handoffs usually lose information:

- Resolve the target's **absolute path** on this machine and confirm it exists. If it is not
  cloned yet, say so and give the clone command instead of a path.
- Make every path in the brief absolute. A relative path resolved against the wrong repo is
  worse than no path at all.
- State explicitly **what does not travel**: this branch, this worktree, the uncommitted
  diff, the running application, and the run — run state is stored per project, so the target
  repository gets its own.
- Quote, rather than reference, whatever the other repository cannot read: the relevant
  interface, error, log excerpt, or decision text.

### 4 — Write the brief

Write one file, following
[`resources/session-handoff-template.md`](../../resources/session-handoff-template.md).

Default location — user-global, so it survives this worktree being removed, works for a
cross-repo target, and never appears in `git status`:

| OS | Path |
| --- | --- |
| Windows | `%USERPROFILE%\.claude\handoffs\<yyyyMMdd-HHmm>-<slug>.md` |
| macOS/Linux | `~/.claude/handoffs/<yyyyMMdd-HHmm>-<slug>.md` |

Honor `CLAUDE_CONFIG_DIR` when it is set, and `CLAUDE_HANDOFF_DIR` to override the directory
outright. Use a UTC timestamp and a short kebab-case slug derived from the objective.

Write it into the repository instead — `.wip/handoffs/handoff-<slug>.md`, per the `.wip`
convention — only when the user wants the brief shared with the team or committed. Never
write it there when the target is another repository.

### 5 — Mark the run, when there is one

Skip this step entirely when the session was not running a flow, or when no surface answering
the lifecycle capability is bound. Otherwise, for a **same-repo** target:

1. `set_run_context` with `changeKind`, and `approval` plus the user's wording when a gate has
   already decided. Conversation memory does not survive the handoff; the run JSON does.
2. Leave the stage in flight `in_progress`.
3. `set_run_context` with `handoff: true` and a `handoffNote` holding what is finished, what
   is not, the paths the next session needs, and the exact invocation to resume with. Without
   the marker the run reads as merely idle, `start_run` refuses to reattach, and the next
   session opens a duplicate.

For a **cross-repo** target the run cannot follow the work: close it with `finish_run`,
summarizing where it stopped and naming the brief. The target repository's session opens its
own run.

Resolve those tool names by pattern from the live tool list, never by a literal prefix — see
**The Surface Capability** in the delivery engine's
`instructions/surface-contract.instructions.md`.

### 6 — Emit the handoff message

Hand back one block, verbatim and self-contained, for the user to paste as the first message
of the new session. It carries the essentials inline and points at the brief for the rest, so
it still works if the file moves or the paste is trimmed:

```text
Continue work handed off from a previous session.

Handoff brief: <absolute path to the brief>
Read it first — it holds the full state, decisions, and verification steps.

Objective: <one or two sentences, in the user's framing>
Repository: <absolute path>   Branch: <branch>   Worktree: <path>
Origin: <work item URL, or "ad-hoc request">

State right now:
- <what is done, concretely>
- <what is uncommitted, or "working tree clean">

Next steps:
1. <first concrete step>
2. <second>

Open questions:
- <question> — default if unanswered: <default>

Verify with:
<the build/test/run commands, and their last known result>

Start by reading the brief and confirming the state still matches, then say how you intend
to continue before changing anything.
```

Drop the last line when the user wants the next session to continue without a confirmation
step — but keep it by default: the new session cannot see this conversation, so a
confirmation pass is cheap insurance against acting on a stale brief.

Suggest a session title: the objective truncated to about 40 characters.

### 7 — Hand back, or deliver

Emitting the block is where this skill's job ends. Do not open the new session.

Tell the user how to launch it:

- **Same worktree** — a new session on `<worktree path>`; paste the block.
- **New worktree** — create the worktree from `<base branch>` first, then a session on it.
- **Another repository** — a new session with `<absolute repo path>` as its folder, then
  paste the block. In the desktop app, pick that folder when creating the session; from the
  CLI, `cd` there and start `claude`.

If a session for the target is **already running on this machine** and the host exposes
session messaging, offer to deliver the block to it directly instead of by paste. Confirm
with the user first, name the session you would send to, and fall back to the paste
instructions if the send fails.

### 8 — Report and stop

Report the brief path, the target, the run marker (`handed off`, `finished`, or `none`), and
anything deliberately left out of the brief. Then stop — do not pick the next step up in this
session.

## Output

- One handoff brief at a stable absolute path.
- One paste-ready first message for the new session, plus a suggested session title.
- The run marked handed off (same repo) or closed with a summary (cross-repo), when a run and
  a lifecycle surface both exist.
- Launch instructions for the target. No session started, no agent spawned.

## Related Skills

- `start` — how the next session brings the application back up.
- The delivery engine's `start-session-from-issue` starts a session's work from a single
  tracked item, where this skill continues work already in progress; its `push-branch` gets
  the commits onto the remote first when the next session will work from a clone rather than
  from this worktree.

## Notes

- The delivery engine's `instructions/flow-execution-model.instructions.md` (**Session
  Handoff**, **Run State and Resume**) is the authority for run markers and resume behavior.
  This skill is the procedure around it, and also covers sessions with no run at all.
- The 60% / 75% / 85% context-gauge warnings come from the bound surface's telemetry hook.
  75% means prepare — persist decisions, start nothing heavy. 85% means run this skill.
- This skill reports through normal chat and opens no run of its own: a handoff is the end of
  a run, not one more.
- Safe to run at any point; it only reads, writes one brief, and marks the run that already
  exists.
