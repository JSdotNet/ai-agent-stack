# 003 — `show` is removed, from 1.14.0

```meta
appliesTo: [devbook-procedures]
breaking: yes
```

## What

devbook-procedures no longer ships a `show` procedure:

| Before | After |
| --- | --- |
| `.agents/skills/show.md`, as seeded | gone |
| `.agents/skills/show.md`, edited | left in place, the repository's own; no longer in the stamp |
| `.claude/skills/show/SKILL.md` | gone |
| `.github/skills/show/SKILL.md` | gone |
| `adopted: ["show", …]` | `show` dropped |

A body is edited when its hash differs from the one its stamp entry recorded. The script
rewrites only the `components.devbook-procedures` entry of the stamp.

## Why

No flow invokes `show`: Validation starts the application through `run` and takes evidence
through `capture`, and on Claude Code a person asking to see a change working has `/verify`.
The record is `.devbook/arc42/adr/install.md` in the marketplace.

## What breaks

A caller naming `show`. `devbook-collaboration:chapter-accept` now runs the application
through `run` instead. A kept, edited body is reachable by no name until the repository wraps
it itself. A `show` wrapper that devbook-procedures did not write is reported and left.
