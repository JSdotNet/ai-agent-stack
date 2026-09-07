# The folder rules, in the repository

An instruction file inside a plugin is read by no host automatically. There is no
`instructions` key in either manifest and no rules component, so the `applyTo` these
files carry steers nothing while they sit in the plugin — and the globs name paths in
the adopting repository, which is the only place they can resolve.

So `devbook-sync` materializes them. Two files per instruction file, and the rules for
both — key, hash, customized, orphan — are in `reconcile-protocol.md` under **What
devbook materializes**.

## The copy Copilot reads

`.github/instructions/<name>.instructions.md`, byte-for-byte, filename included.

Copy it verbatim. Do not trim `applyTo` to the layout this repository uses: a glob that
matches nothing applies nothing, and a trimmed file matches no release devbook shipped,
so the next reconcile would report it customized and never refresh it again. That is the
right outcome for the two workflows and the wrong one here.

The filename is load-bearing for a second reason. These files reference each other as
bare names — `devbook-chapter-metadata.instructions.md` and its siblings — so they
resolve only while they sit together under one folder under their own names.

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

`paths` is the instruction file's `applyTo` split on commas, in order, one entry per
line. Nothing else is derived and nothing else is written.

There is no third copy under `.agents/rules/`. That layering exists so one rule serves
two hosts from a host-neutral home; here the `.github/instructions/` file already is the
one copy, and a neutral third would have to rewrite every cross-reference between these
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
