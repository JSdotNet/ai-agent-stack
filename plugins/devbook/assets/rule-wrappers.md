# The folder rules, in the repository

An instruction file inside a plugin is read by no host automatically. There is no
`instructions` key in either manifest and no rules component. So these files are authored
host-neutral — `name`, `description`, `paths`, the shape `.agents/rules/` uses — and
carry no host's own spelling of the glob. Their `paths` name folders in the adopting
repository, which is the only place those globs can resolve.

So `devbook-sync` materializes them. Two files per instruction file, and the rules for
both — key, hash, customized, orphan — are in `reconcile-protocol.md` under **What
devbook materializes**.

## The copy Copilot reads

`.github/instructions/<name>.instructions.md`. The body is verbatim; the frontmatter is
the authored one with `paths` rewritten to the key Copilot reads:

```markdown
---
applyTo: ".arc42/**,.devbook/arc42/**"
description: Structure and authoring rules for the arc42 architecture documentation folder.
---
```

`applyTo` is `paths` joined with commas, in order — the same derivation
`tools/check-assets.mjs` enforces on this repository's own wrappers. `description` is
copied. `name` is dropped: the filename carries it.

Derive from `paths` as authored. Do not trim to the layout this repository uses: a glob
that matches nothing applies nothing, and a trimmed file matches no release devbook
shipped, so the next reconcile would report it customized and never refresh it again.
That is the right outcome for the two workflows and the wrong one here.

The filename is load-bearing. These files reference each other as bare names —
`devbook-chapter-metadata.instructions.md` and its siblings — so they resolve only while
they sit together under one folder under their own names.

## The wrapper Claude reads

`.claude/rules/<name>.md`. Frontmatter and one sentence, never a second copy of the rule:

```markdown
---
paths:
  - ".arc42/**"
  - ".devbook/arc42/**"
---

Read `.github/instructions/devbook-arc42.instructions.md` and follow it before editing this file.
```

`paths` is copied from the instruction file verbatim. Nothing else is derived and nothing
else is written.

There is no third copy under `.agents/rules/`. That layering exists so one rule serves
two hosts from a host-neutral home; here the `.github/instructions/` file already holds
the body, and a neutral third would have to rewrite every cross-reference between these
files to reach it.

## Which files, and when

| Instruction file | Materialized when |
|---|---|
| `devbook-arc42.instructions.md` | `arc42` adopted |
| `devbook-domain.instructions.md` | `domain` adopted |
| `devbook-tech.instructions.md` | `tech` adopted |
| `devbook-design.instructions.md` | `design` adopted |
| `devbook-ai.instructions.md` | `ai` adopted |
| `devbook-chapter-metadata.instructions.md` | any folder adopted |
| `devbook-annotations.instructions.md` | any folder adopted |
| `devbook-naming.instructions.md` | any folder adopted |
| `devbook-derived-artifacts.instructions.md` | any folder adopted |

A folder dropped from `adopted` orphans its pair: reported, never deleted.

A repository that has taken ownership of either file keeps it. Report the drift and move
on — the plugin copy stays reachable by explicit path from a skill or an agent, which is
how these rules reached a session before any of them were materialized.
