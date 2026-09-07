---
name: instructions
description: How a plugin instruction file is scoped and how it reaches each host.
paths:
  - "plugins/*/instructions/**/*.instructions.md"
---

# Instruction files

`applyTo` is one comma-separated string, and it steers nothing from inside a plugin: neither
manifest has an `instructions` key and neither host has a rules component, so the file reaches
a session only through an explicit path reference from a skill or agent, or the plugin's
session-start hook. Add that reference in the same change — an unreferenced instruction file
silently does nothing in either host.

Write `applyTo` anyway. It is the glob of record, and a sync skill derives both hosts' wrappers
from it once the file is materialized into a repository. Carry every layout the plugin
supports: a glob that matches nothing applies nothing, and nothing reports it.

Glob bases differ by kind, and the kind decides how the rule ships:

| Glob base | Example | How it reaches a host |
| --- | --- | --- |
| inside the plugin | `skills/flow-*/SKILL.md` | only maintainers here edit those, so a topic in `.agents/rules/` wraps the same glob |
| in the consuming repository | `.devbook/domain/**` | the plugin's sync materializes the pair, per [the decision](../../.devbook/arc42/09-architecture-decisions.md#a-plugins-rules-reach-a-host-through-the-sync) |

A repo-facing file with no sync behind it reaches a session by explicit path and nothing
else. Say so where it is referenced rather than leaving the `applyTo` to imply otherwise.

A repository-level rule is different: it is authored once in `.agents/rules/` and wrapped per
host. See [README.md](README.md).

Body budget 60 lines: [AUTHORING.md](../../AUTHORING.md).
