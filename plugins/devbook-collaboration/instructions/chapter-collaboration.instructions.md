---
applyTo: ".domain/**,.arc42/**,.tech/**,.design/**,.ai/**"
description: How devbook-collaboration records review, comment, and hand-off state on a devbook chapter — the ext.devbook-collaboration keys, the three review states, the rule that none of it is chapter content, and the fact that approval stays devbook's.
---

# Chapter collaboration state

devbook-collaboration owns no field in devbook's schema. Every fact it remembers
about a chapter lives under `ext.devbook-collaboration.*` inside that chapter's
own `meta` block, which devbook carries through untouched, unvalidated, and
edge-free — see `knowledge-chapter-metadata.instructions.md`. Never record any of
it as a new field beside `status`, and never read another plugin's `ext` keys.

## The keys

| Key | Value | Means |
|---|---|---|
| `review` | `requested` · `changes-requested` · `cleared` | Where this chapter's review pass stands. Omitted means no review is running. |
| `reviewer` | one handle, name, or role | Who owes the next move. One value, never a list. |
| `review-at` | `YYYY-MM-DD` | The day the current state was written. |
| `open-<n>` | one line of prose | One unresolved finding or question. Numbered from 1, contiguous. |

Write `review`, `reviewer`, and `review-at` together or not at all — the triad
deliberately mirrors `approved` / `approved-by` / `approved-at`, so a chapter
reads the same way on its way to a decision as it does past one. Omit every key
that carries nothing; there is no null spelling.

## Writing a finding

The block grammar is flat single-line scalars, so one finding is one key:
`ext.devbook-collaboration.open-1: <finding>`. Never a bracketed list — devbook's
parser splits those on every comma, including inside quotes, which would tear an
ordinary sentence in half. A finding is one line, says what is wrong and what
would settle it, and carries no line break and no code fence. Resolving one
deletes its key and renumbers the rest so the run stays contiguous from 1.

## The three states

Each state names who owes the next move, which is the only thing this workflow
has to keep straight:

- `requested` — waiting on `reviewer`. No finding has been written yet.
- `changes-requested` — waiting on the author. At least one `open-<n>` says why.
- `cleared` — waiting on nobody. No `open-<n>` remains, and the chapter is ready
  for the approval decision.

`cleared` is short-lived by design. Approving deletes the whole namespace.

## None of this is chapter content

An agent loading a chapter for task context reads the chapter and skips every
`ext.devbook-collaboration.*` key. A finding is an open question, not a fact
about the domain, and a chapter someone has queried has not thereby stopped
saying what it says. Only review work — the skills in this plugin, and the
approval gate — reads these keys, and it reads nothing else as instruction.

## Approval stays devbook's

`status: approved`, `approved-by`, and `approved-at` are devbook's fields and
keep devbook's meaning. This plugin writes them only at the moment a person
approves, and clears its own namespace in the same change: an approved chapter
carries no collaboration state, because the decision is the record. When the
content changes afterwards the rung drops, per devbook's own rule, and review
starts again.
