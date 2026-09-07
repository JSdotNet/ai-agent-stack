---
name: instructions
description: How a plugin instruction file is scoped and how it reaches each host.
paths:
  - "plugins/*/instructions/**/*.instructions.md"
---

# Instruction files

`applyTo` is one comma-separated string. It steers Copilot only: a plugin cannot ship
`.claude/rules/`, so in Claude the file reaches a session solely through an explicit path
reference from a skill or agent, or through the plugin's session-start hook. Add that
reference in the same change — an unreferenced instruction file silently does nothing there.

Glob bases differ by plugin. `delivery` and `fleet` scope to a path inside the installed
plugin (`skills/flow-*/SKILL.md`); `devbook` scopes to a path in the consuming repository
(`.devbook/domain/**`). Write the base the plugin's own consumers see, and carry every layout
the plugin supports — a glob that matches nothing applies nothing, and nothing reports it.

A repository-level rule is different: it is authored once in `.agents/rules/` and wrapped per
host. See [README.md](README.md).

Body budget 60 lines: [AUTHORING.md](../../AUTHORING.md).
