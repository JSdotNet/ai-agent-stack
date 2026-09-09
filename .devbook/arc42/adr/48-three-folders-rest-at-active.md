# 48. Three Folders Rest at `active`

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/7-approved-is-a-status-rung.md", ".devbook/arc42/adr/6-flat-devbook-folders-only.md"]
```

In `.domain`, `.arc42`, and `.design`, `status` is optional: an omitted value resolves to
`active`, and writing `active` explicitly is reported. In `.tech` and `.ai` it stays required.
`RESTING_STATUS_BY_FOLDER` in `tools/devbook-meta/metadata.mjs` is where the three are named.

**A field that reads the same everywhere stops being read.** In the three editorial folders
`status` records how settled the writing is, and `active` — no longer in transition — is where
nearly every chapter sits permanently. Written out, it is a line on every chapter that says
nothing, and the few chapters that are `draft`, `proposed`, or `deprecated` hide inside it.
Omission makes those visible: every `status` a reader sees is a chapter that is actually moving.

**The other two folders have no resting value to omit.** In `.tech` and `.ai` the value is a
*rating* whose whole purpose is to be stated. An absent status there is indistinguishable from
`candidate` — nobody has rated this — and a radar built from omissions renders blank.

**What is not resting.** `deprecated` is a standing warning and stays written, as do `draft`
and `proposed`. The shared `approved` rung is always explicit and comes off the moment the
content changes — [record 7](7-approved-is-a-status-rung.md).

Consequence: `status` is required in two folders and optional in three, which the field list
alone does not show; each folder's rule file states it, and the generator reports an explicit
`active` as a warning rather than failing on it, so a chapter that writes it is still valid.
The rule is a convention enforced by warning, not by rejection.
