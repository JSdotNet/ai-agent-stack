# Handoff — <objective in a few words>

<!--
The shape of a handoff brief. Written by the `session-handoff` skill to
`~/.claude/handoffs/<yyyyMMdd-HHmm>-<slug>.md` (Windows: `%USERPROFILE%\.claude\handoffs\`),
or to `.wip/handoffs/handoff-<slug>.md` when the brief should live in the repository.

Two rules the next session depends on: every path absolute, and no secrets.
Written for a reader who cannot see the conversation this came from.
Read by: plugins/claude-desktop/skills/session-handoff/SKILL.md
-->

| | |
| --- | --- |
| Handed off | `<UTC timestamp>` |
| Reason | `<context pressure / scope moved to another repo / parked>` |
| From | `<absolute worktree path>` on branch `<branch>` |
| To | `<same worktree / new worktree from <base> / absolute path of the other repo>` |
| Origin | `<work item URL, or "ad-hoc request">` |
| Run | `<runId, marked handed off — or "finished: <reason>" — or "none">` |

## Objective

<What the user asked for, in their framing. Two or three sentences. Include the
constraint that shaped the approach, if there was one.>

## State

**Done**

- <concretely what exists now, with absolute paths>

**Not done**

- <what remains, in the order it should be picked up>

**Working tree**

<`clean`, or the uncommitted files and what each one is mid-way through. If the work was
committed before the handoff, give the commit range instead.>

## Decisions and Assumptions

- **<decision>** — <why, and what was rejected.>
- **Assumed:** <assumption> — <what to do if it turns out to be wrong.>

## Next Steps

1. <first concrete step>
2. <second>

## Open Questions

- <question> — **default if unanswered:** <what to do without an answer.>

## Verify

```bash
<the build / test / run commands already used here>
```

Last known result: <passing, failing with which test, not run yet>.

<App URL, the bound surface's run link, or Aspire endpoint if one was running.>

## Context the Next Session Cannot Look Up

<Only for a cross-repo handoff, or for anything that lives outside the target repository.
Quote it rather than link it: the interface signature, the error text, the log excerpt, the
decision from the other repo's discussion. Delete this section when the target is the same
worktree.>

## Artifacts

- `<absolute path>` — <what it is: plan, screenshot, QA report, exported run report.>
