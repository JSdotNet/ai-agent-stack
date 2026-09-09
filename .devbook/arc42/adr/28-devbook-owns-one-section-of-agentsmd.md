# 28. devbook Owns One Section of AGENTS.md

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/17-no-host-profile-plugins.md", ".devbook/arc42/adr/4-no-generated-sync-layer.md", ".devbook/arc42/05-building-block-view.md#host-slots", ".devbook/domain/plugin-authoring/domain.md#stamp"]
```

Nothing in the stack maintained a repository's root instruction file. `flow-repo` wrote it
once, `devbook:install` offered `assets/routing-snippet.md` for a person to merge, and the
session-start hook told every session the folder rules in the same words whether the
repository had adopted one folder or five. So the one thing a repository's own instruction
file should say about its devbook — which folders it keeps, where the rules for each are,
and how the indexes are checked — was said nowhere on disk.

`devbook:install` now materializes that as one marker-fenced section of `AGENTS.md`, generated
from the stamp's `adopted` list, and `devbook-check` reports it stale when that list has
moved on. Three limits keep it inside the decisions already taken:

- **The file is `AGENTS.md` and nothing else.** It is the `repo-instructions` slot's unbound
  default and the one name both hosts read or import, so naming it is not host-naming and
  [No Host Profile Plugins](17-no-host-profile-plugins.md) stands. Whether a host reads it, or
  imports it from a file of its own, is the repository's to arrange: devbook says which file
  it wrote and stops.
- **The section carries structure, never routing.** Which flow, agent, or MCP server a
  repository prefers stays in `routing-snippet.md`, offered and never applied. The section
  says what the folders are and how they are checked, which is true of every adopting
  repository in the same way.
- **A section is materialized like a file.** It is keyed `AGENTS.md#devbook` in the stamp's
  `materialized` map, hashed as devbook wrote it, and rewritten only while the text between
  the markers still matches that hash. An edit inside the markers makes it customized —
  reported, left alone — the rule every other asset already has. Text outside the markers
  is never read or written.

Consequence: the `materialized` map now holds a section as well as files, and the
[Stamp](../../domain/plugin-authoring/domain.md#stamp) term says so. The contract version is
unchanged, because the chapter schema did not move, and a repository synced before
`devbook` 1.3.0 gains the section as a plain `create` on its next reconcile. The session-start
hook keeps its generic text: it is what reaches a session in a repository that never ran a
reconcile, and the section is what makes a reconciled one specific.
