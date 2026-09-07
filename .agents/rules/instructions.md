---
name: instructions
description: How a plugin instruction file is scoped and how it reaches each host.
paths:
  - "plugins/*/instructions/**/*.instructions.md"
---

# Instruction files

Frontmatter is `name`, `description`, `paths` — the same host-neutral shape
[`.agents/rules/`](README.md) uses, and the shape `node tools/check-assets.mjs` enforces.
Never `applyTo`: that is Copilot's spelling, it steers nothing from inside a plugin, and it
reads as though the file were written for one host. A sync derives each host's spelling when
it materializes the file into a repository.

Nothing here is auto-applied. Neither manifest has an `instructions` key and neither host has
a rules component, so inside the plugin the file reaches a session only through an explicit
path reference from a skill or agent, or the plugin's session-start hook. Add that reference
in the same change — an unreferenced instruction file silently does nothing in either host.

Carry every layout the plugin supports in `paths`: a glob that matches nothing applies
nothing, and nothing reports it.

Glob bases differ by kind, and the kind decides how the rule ships:

| `paths` names | Example | How it reaches a host |
| --- | --- | --- |
| a path inside the plugin | `skills/flow-*/SKILL.md` | only maintainers here edit those, so a topic in `.agents/rules/` wraps the same glob |
| a path in the consuming repository | `.devbook/domain/**` | the plugin's sync materializes a pair per host, per [the decision](../../.devbook/arc42/09-architecture-decisions.md#a-plugins-rules-reach-a-host-through-the-sync) |

A repo-facing file with no sync behind it reaches a session by explicit path and nothing
else. Say so where it is referenced rather than leaving `paths` to imply otherwise.

A repository-level rule is different: it is authored once in `.agents/rules/` and wrapped per
host. See [README.md](README.md).

Body budget 60 lines: [AUTHORING.md](../../AUTHORING.md).
