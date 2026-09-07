---
name: devbook-chapter
description: Which devbook instruction file governs which knowledge folder, and what every chapter owes.
paths:
  - ".devbook/**/*.md"
---

# devbook chapters

Every chapter carries a fenced `meta` block, written in the same change as the content. Load
the chapters a task names, not the folder, and reach the rest by walking `related` and
`depends-on` — the folders are walked, never searched. After editing, refresh the indexes per
`.agents/rules/devbook-meta.md`.

Before editing, read the file that governs the folder:

| Folder | Read |
| --- | --- |
| `.devbook/domain/` | `plugins/devbook/instructions/devbook-domain.instructions.md` |
| `.devbook/arc42/` | `plugins/devbook/instructions/devbook-arc42.instructions.md` |
| `.devbook/tech/` | `plugins/devbook/instructions/devbook-tech.instructions.md` |
| `.devbook/design/` | `plugins/devbook/instructions/devbook-design.instructions.md` |
| `.devbook/ai/` | `plugins/devbook/instructions/devbook-ai.instructions.md` |

And for any chapter: `devbook-chapter-metadata.instructions.md` for the `meta` block,
`devbook-naming.instructions.md` for file and folder names, and
`devbook-annotations.instructions.md` when the change touches an annotation fence — all under
`plugins/devbook/instructions/`.
