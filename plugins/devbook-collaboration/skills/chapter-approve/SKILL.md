---
name: chapter-approve
description: 'Run the approval decision on a devbook chapter — show the chapter itself with its open findings, take approve, revise, or decline from a person, and on approval write devbook''s own status: approved rung with approved-by and approved-at while clearing the collaboration state. Use when: approving a chapter, signing off a specification before it becomes work, recording who approved what, or lifting an approval that has gone stale. Triggers on: "approve this chapter", "sign off on this", "record the approval", "is this approved", "the approval is stale".'
---

# chapter approve

## Purpose

Turn a cleared review into devbook's recorded decision, or refuse to. This is
the one place `status: approved` is written, and it is never written without a
person choosing it in this session.

`status`, `approved-by`, and `approved-at` are devbook's fields — see
`knowledge-chapter-metadata.instructions.md`. The collaboration keys this skill
clears are in `../../instructions/chapter-collaboration.instructions.md`.

## Steps

1. **Show the chapter itself**, not a summary of it, together with every
   `open-<n>` on it and its current `review` state. A summary is not what is
   being approved, and a person cannot approve what they have not read.

2. **Say plainly what stands in the way**, if anything:

   | Condition | Say |
   |---|---|
   | Any `open-<n>` remains | Which findings are open, and that approving now approves a chapter with unanswered questions |
   | `review` is absent or `requested` | Nobody has reviewed this yet |
   | `status: approved` already, unchanged since `approved-at` | It is already approved; there is nothing to decide |

   None of these blocks the decision. They are what the person weighs. State
   them and let them choose.

3. **Ask for the decision** and wait for it. Three outcomes, and no default:

   | Outcome | Do |
   |---|---|
   | approve | Step 4 |
   | revise | Leave `status` alone. Record what they want changed as `open-<n>` findings, set `review: changes-requested`, `reviewer` to the author, `review-at` to today, and stop |
   | decline | Leave the chapter as it is. Report the reason to the user and stop; declining records nothing on the chapter, because a chapter nobody approved is the ordinary case |

   Never infer approval from silence, from a cleared review, or from the
   chapter looking fine. If nobody answers — an unattended run, a scheduled job
   — stop and report the chapter as awaiting approval. That is the whole point
   of the gate.

4. **Write the approval** in one change:

   ```text
   status: approved
   approved-by: @jsdotnet
   approved-at: 2026-09-03
   ```

   `approved-by` is the person who just chose it, never the reviewer by default
   and never you. In the same change, delete every
   `ext.devbook-collaboration.*` key on the chapter: the decision is now the
   record, and collaboration state on an approved chapter is stale by
   construction.

5. **Report** the chapter, who approved it, and the day. Commit the chapter with
   its metadata, and stop.

## Lifting a stale approval

An approval is of what was read. When the chapter's content changed after
`approved-at`, the rung is no longer true and devbook's own rule is that it
comes out. Drop `status` back to the chapter's ordinary rung, delete
`approved-by` and `approved-at` in the same change, and say what changed since
the approval. Do not re-approve it here — that is a new decision, and it starts
at step 1.

## Do not

- Do not approve on your own judgment, however clear the chapter is.
- Do not write `approved-by` or `approved-at` without `status: approved`, or the
  rung without both — devbook reports either half left alone.
- Do not leave collaboration keys behind on an approved chapter.
- Do not approve a chapter to unblock a flow. An unapproved chapter parks the
  run; that is the designed outcome, not a failure to route around.
