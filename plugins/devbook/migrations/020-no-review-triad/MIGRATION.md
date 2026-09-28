# 020 — no review triad

```meta
contractVersion: 20
appliesTo: [domain, arc42, tech, design, ai]
breaking: yes
```

## What

`review`, `reviewer`, and `review-at` are no longer part of the metadata schema, in any folder.

This migration finds every `meta` block in the adopted folders that carries any of the three
and deletes them. It changes nothing else: `status` is left as it is, and so is every
annotation fence. For each block it reports the review state it took off, and the reviewer
it named, so whoever runs it can carry the ones still pending into the pull request or the
tracker.

## Why

A review in progress is a rung on the status ladder, not a second field beside it. A chapter
ready to read but not yet agreed said so twice — `status: draft` and `review: requested` —
and the first was wrong. `changes-requested` and `cleared` were a cached copy of what the open
annotation fences already say, which the check then had to reconcile against them. Who owes
the next move is workflow state: it belongs to the pull request, the review queue, or the
tracker, where a reassignment is not a content diff on a chapter whose text did not change.
The approval and acceptance records stay, because they record a decision that has to travel
with the content and lapse with it; a pending review does not. The record is
`.devbook/arc42/adr/annotations.md` in the marketplace.

## What breaks

A block still carrying any of the three is reported by the checker as an error — the field is
no longer part of the schema — naming this migration. A repository that never wrote a review
field sees `nothing to do`.

Nothing sets `status` for you. Where a chapter was `review: requested` or `cleared` and the
repository wants that visible, it writes the rung its ladder uses for it by hand.

## How to verify

```bash
node migrate.mjs --check
```

Exits `0` when no `meta` block in an adopted folder carries `review`, `reviewer`, or
`review-at`, and `1` while any remains, naming each file.
