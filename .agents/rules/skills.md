---
name: skills
description: Frontmatter and prose rules for a plugin skill.
paths:
  - "plugins/*/skills/**/SKILL.md"
---

# Skills

`skills/<name>/SKILL.md` with `name` and `description` frontmatter. The description is the
trigger — say when to use it, in the words a user would use. Keep host-specific tool names out
of skill prose.

Reference instruction and resource files by relative path. Neither host auto-applies an
instruction file from inside a plugin, so the explicit reference is what loads the guidance —
in both. See [plugin-rules.md](plugin-rules.md).

Body budget 40 lines: [AUTHORING.md](../../AUTHORING.md).
