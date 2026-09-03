---
name: chapter-review-queue
description: 'Sweep a repository''s devbook folders for everything a review pass has left open — chapters awaiting a named reviewer, chapters with unresolved findings, chapters cleared and waiting for approval, and approvals that have gone stale because the content changed after they were signed. Reports one queue grouped by who owes the next move. Use when: asking what is waiting on review, what needs approval, whose turn it is, or whether any approval has lapsed. Triggers on: "what is awaiting review", "review queue", "what needs approval", "stale approvals", "whose turn is it", "open findings across the knowledge folders".'
---

# chapter review queue

## Purpose

Answer one question across every adopted knowledge folder: what is a person
still owed. This is the only skill in this plugin that reads the folder rather
than one chapter, because a queue is the one thing an address cannot give you.

State keys are in `../../instructions/chapter-collaboration.instructions.md`.

This file exceeds the 40-line body budget on purpose: the routing table in step
3 is one row per state a chapter can be waiting in, and a row left out is a
chapter that never appears in the queue.

## Steps

1. **Find the adopted folders.** Read `adopted` from devbook's entry in
   `.github/ai-agent-stack.json` — the stamp, per `devbook`'s reconcile
   protocol. Fall back to the knowledge folders present on disk when the
   repository has no stamp; do not ask.

2. **Collect the `meta` blocks** in those folders. Prefer the derived index
   under `_meta/`, which already carries each node's `ext` keys gathered under
   one `ext` key — that is what it is for. Read it, never hand-edit it. When
   there is no `_meta/`, scan the chapters directly and say in the report that
   the queue was built from a scan.

3. **Sort every chapter into one row**, first match wins:

   | Row | Condition | Owed by |
   |---|---|---|
   | Stale approval | `status: approved` and the chapter's content changed after `approved-at` | Whoever approved it |
   | Changes requested | `review: changes-requested` | The author |
   | Awaiting review | `review: requested` | `reviewer` |
   | Awaiting approval | `review: cleared` | Whoever approves |
   | Unsigned approval | `status: approved` with no `approved-by` or `approved-at` | Whoever approved it |

   For the stale row, compare `approved-at` with the last commit that touched
   the chapter's own lines — `git log -1 --format=%ad --date=short -L` over its
   heading range, or the file's last commit when the range is unclear. Say
   which of the two you used; a file-level answer over-reports a chapter in a
   busy file, and reporting it as exact would be wrong.

4. **Report the queue** grouped by who owes the next move, each row carrying the
   chapter address, how long it has been waiting, and its open findings verbatim
   when it has any. Order the groups by the table above — a stale approval is a
   claim the repository is currently making and getting wrong, which outranks
   work that is merely waiting.

5. **Stop.** Offer the next move — `chapter-review` for an awaiting-review row,
   `chapter-approve` for an awaiting-approval or stale row — and let the user
   pick one.

## Do not

- Do not change a chapter from here. This skill reads; the queue is a report.
- Do not fix a stale approval as part of the sweep. Lifting a rung is a decision
  about one chapter and belongs in `chapter-approve`, with the change that
  caused it in front of the person.
- Do not read chapter content into context while sweeping. Metadata answers the
  whole question, and loading the corpus is exactly what devbook's task-scoped
  loading rule forbids.
- Do not report a chapter with no collaboration state and no approval. Silence
  is the normal case, not a queue entry.
