# devbook-skills

Reusable guidance any plugin can name and none has to depend on.

An L0 plugin with no dependencies. It ships skills and nothing else: no rule, no install, no
hook, and no entry in the stamp. Other plugins name its skills by name alone and keep their
own short rule for when it is absent, so enabling it improves what they write and disabling it
breaks nothing. The decision is recorded in
[plugin-boundaries.md](../../.devbook/arc42/adr/plugin-boundaries.md).

## Installation

```bash
claude plugin marketplace add JSdotNet/devbook
```

Then enable `devbook-skills` with `/plugin`. There is nothing to install into the repository.

## Skills

| Skill | What it does | Who names it |
| --- | --- | --- |
| `show-me` | Puts a picture before the prose whenever the content has a shape, and keeps the words to what the picture cannot say | `devbook`'s `devbook-writing` rule, for every chapter except `domain.md` and its splits; `delivery`, for pull request descriptions and its report back to the person; and anyone who types `/show-me` |

`show-me` writes plain Markdown only: Mermaid, fenced code, and tables. That is what a
chapter, a pull request, and a chat reply can all render.
