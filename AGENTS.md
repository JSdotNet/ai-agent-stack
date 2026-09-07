<!-- devbook:begin -->
## Knowledge folders

Managed by `devbook-sync`. Edit outside these markers; an edit inside them makes the
next reconcile report the section as customized and leave it alone.

This repository keeps its knowledge as addressed Markdown chapters. Treat the folders as
task-scoped context, never baseline context: load the chapters a task names, walk
`related` and `depends-on` from them, and never load a folder whole.

| Folder | Holds | Rules |
| --- | --- | --- |
| `.devbook/arc42/` | Structure, decisions, and technical debt | `devbook-arc42.instructions.md` |
| `.devbook/domain/` | Bounded contexts and the ubiquitous language | `devbook-domain.instructions.md` |
| `.devbook/tech/` | The technology graph and its ratings | `devbook-tech.instructions.md` |
| `.devbook/design/` | Design principles, tokens, and component guidelines | `devbook-design.instructions.md` |
| `.devbook/ai/` | How the team works with AI, stage by stage; it records a way of working and never instructs one | `devbook-ai.instructions.md` |

Every chapter carries a fenced `meta` block; write it in the same change as the content,
per `devbook-chapter-metadata.instructions.md`. Skip `annotation` fences when loading a
chapter as context: they hold review notes, not content.

Files under any `_meta/` folder are generated tool input. Never read or hand-edit them,
and never regenerate or commit them in a session — the `devbook-check` routine owns that
refresh. Run the check before committing:

    node plugins/devbook/tools/devbook-meta/build.mjs --check
<!-- devbook:end -->
