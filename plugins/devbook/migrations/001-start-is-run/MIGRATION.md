# 001 — `start` is `run`, from 1.12.0

```meta
appliesTo: [procedures]
breaking: yes
```

## What

The procedure that brings the application up is `run`, not `start`, and its body is a Claude
Code project recipe instead of an `.agents/skills/` copy:

| Before | After |
| --- | --- |
| `.agents/skills/start.md` | `.claude/skills/run-<id>/SKILL.md`, the same body under `name: run-<id>` and the `run` seed's `description` and `goal` |
| `.claude/skills/start/SKILL.md` | gone — Claude Code's own `run` skill follows the recipe |
| `.github/skills/start/SKILL.md` | `.github/skills/run/SKILL.md`, Copilot's twin pointing at the recipe |
| `adopted: ["start", …]` | `adopted: ["run", …]` |

`<id>` is `id` in `.devbook/config.json`. The script moves the body as it is, customized or
not, rewrites only the `components.devbook-procedures` entry of the stamp, and records the
recipe `managed: false` and the twin managed.

## Why

Claude Code's `run` and `/run-skill-generator` look for `.claude/skills/run-<name>/`, and a
`start` skill beside them was a second recipe neither of them read. The record is
`.devbook/arc42/adr/install.md` in the marketplace.

## What breaks

A caller naming `start`. Every flow in the marketplace names `run` from 1.12.0. A repository
that already has a `run-*` recipe *and* `.agents/skills/start.md` is stopped rather than
merged: fold one into the other by hand, delete `start.md`, and run the script again. A
`start` wrapper that devbook-procedures did not write is reported and left.
