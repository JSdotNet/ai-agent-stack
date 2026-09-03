---
name: chapter-handoff
description: 'Hand a devbook chapter to a named reviewer and produce the brief they start from — what changed, what the reviewer is being asked to judge, and which neighbouring chapters they need. Records the request on the chapter itself so it survives the session. Use when: asking someone to review a chapter, passing knowledge work to another person or session, or parking a chapter that needs a decision you cannot make. Triggers on: "hand off this chapter", "ask someone to review", "request review of", "who should review this", "park this for review".'
---

# chapter handoff

## Purpose

Request a review of one chapter and write the request into the chapter, so the
ask outlives the session that made it. This is the author's half of the pass;
`chapter-review` is the reviewer's.

State keys and their meanings are in
`../../instructions/chapter-collaboration.instructions.md`. Read it first.

## Steps

1. **Resolve the chapter.** Take a `<path>#<slug>` address, or resolve a
   description to one. Confirm the chapter exists and carries a `meta` block; a
   heading with no block is not addressable, and the fix is to give it one
   before handing anything off.

2. **Pick the reviewer.** Ask who, and take a handle, a name, or a role. Never
   invent one and never default to the author. If the person naming a reviewer
   cannot say who owes the answer, that is the thing to resolve first, not
   something to record as `unassigned`.

3. **Write the request** into the chapter's `meta` block:

   ```text
   ext.devbook-collaboration.review: requested
   ext.devbook-collaboration.reviewer: @jsdotnet
   ext.devbook-collaboration.review-at: 2026-09-03
   ```

   Overwrite an existing request rather than adding a second — a chapter waits
   on one reviewer. Leave any `open-<n>` from an earlier pass in place; a
   finding is resolved by fixing it, not by handing the chapter on.

4. **Build the brief** and give it to the user as the message to send. Four
   parts, in this order, and nothing else:

   | Part | Content |
   |---|---|
   | The ask | The chapter address, and the one judgment being asked for |
   | What changed | The commits touching this chapter since its last `approved-at`, or since it was created |
   | Context to load | The chapters reachable in one step through `related` and `depends-on`, by address |
   | Evidence | The chapter's `tests` entries, and any claim in it that has none |

   Walk the graph for the third row; never search the folder. Chapters are
   addressed exactly, and `related` / `depends-on` already say which ones
   connect — see `devbook`'s own retrieval rule.

5. **Report** the chapter, the reviewer, and the brief. Commit the metadata
   change with the chapter, and stop. Do not notify anyone, open an issue, or
   post the brief anywhere — handing the brief back is the deliverable.

## Do not

- Do not review the chapter here. Requesting and answering are different moves
  by different people, and doing both in one pass is how a chapter gets approved
  by the person who wrote it.
- Do not write `status: approved` from this skill. Approval is
  `chapter-approve`'s, and only after a review clears.
- Do not record the brief in the chapter. It is transient; the durable residue
  of a hand-off is the three keys in step 3.
