---
name: devbook-meta
description: Generated index files are never hand-edited.
paths:
  - "**/_meta/**"
---

# Generated indexes

Never hand-edit a generated `_meta/` file. Refresh it with
`node plugins/devbook/tools/devbook-meta/build.mjs` and commit what it wrote; the same script
with `--check` fails on a stale index. Convention:
`plugins/devbook/instructions/devbook-derived-artifacts.instructions.md`.
