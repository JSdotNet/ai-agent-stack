# 002 — `debug` is `diagnose`, from 1.14.0

```meta
appliesTo: [devbook-procedures]
breaking: yes
```

## What

The procedure that finds the cause of an observed issue is `diagnose`, not `debug`:

| Before | After |
| --- | --- |
| `.agents/skills/debug.md`, edited | `.agents/skills/diagnose.md`, the same body with `name: diagnose`, `managed: false` |
| `.agents/skills/debug.md`, as seeded | gone — `update` seeds `diagnose` fresh |
| `.claude/skills/debug/SKILL.md` | gone — `update` writes `.claude/skills/diagnose/SKILL.md` |
| `.github/skills/debug/SKILL.md` | gone — `update` writes `.github/skills/diagnose/SKILL.md` |
| `adopted: ["debug", …]` | `adopted: ["diagnose", …]` |

A body is edited when its hash differs from the one its stamp entry recorded. The script
rewrites only the `components.devbook-procedures` entry of the stamp and writes no wrapper:
`devbook-procedures:update` runs it first and then materializes `diagnose` like any other
adopted procedure.

## Why

Claude Code ships a `/debug` command, and a project skill with the same name replaces it. A
repository that adopted `debug` lost the host's own. The record is
`.devbook/arc42/adr/install.md` in the marketplace.

## What breaks

A caller naming `debug`. Nothing in the marketplace names it. A repository that already has
`.agents/skills/diagnose.md` beside `debug.md` is stopped rather than merged: fold one into the
other by hand, delete `debug.md`, and run the script again. A `debug` wrapper that
devbook-procedures did not write is reported and left.
