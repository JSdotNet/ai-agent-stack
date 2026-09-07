---
name: plugin-rules
description: How a plugin rule is authored, where its globs live, and how it reaches each host.
paths:
  - "plugins/*/rules/*.md"
  - "plugins/*/rules/rules.json"
---

# Plugin rules

A plugin rule is a template. `rules/<name>.md` is the body plus `name` and `description`, and
nothing else: no `paths`, and never `applyTo`, which is one host's spelling on a file no host
reads it from. The globs live in `rules/rules.json` beside it, keyed by name, because that is
where the install skill reads them and where every rule's scope can be seen at once.

```json
{ "rules": { "devbook-arc42": { "paths": [".arc42/**", ".devbook/arc42/**"], "install": "arc42" } } }
```

`install` is optional and belongs to the plugin that materializes rules; devbook reads it as the
adopted folder that pulls the rule in, or `always`. `node tools/check-assets.mjs` fails on a
rule with no entry, an entry with no rule, and an empty `paths`.

Nothing here is auto-applied. Neither manifest has a rules or instructions key, so inside the
plugin a rule reaches a session only through an explicit path reference from a skill or agent,
or the plugin's session-start hook. Add that reference in the same change — an unreferenced
rule silently does nothing in either host.

What `paths` names decides how the rule ships:

| `paths` names | Example | How it reaches a host |
| --- | --- | --- |
| a path inside the plugin | `skills/flow-*/SKILL.md` | only maintainers here edit those, so a topic in `.agents/rules/` wraps the same glob |
| a path in the consuming repository | `.devbook/domain/**` | the plugin's install skill installs it there, per [the decision](../../.devbook/arc42/09-architecture-decisions.md#a-plugins-rules-reach-a-host-through-the-install) |

Carry every layout the plugin supports: a glob that matches nothing applies nothing, and
nothing reports it. Cross-reference a sibling by its bare filename — `devbook-naming.md` — and
it resolves both here and wherever the install writes them, because the folder shape is the same
in both places. That is what the `rules/<name>.md` naming buys.

A repo-facing rule with no install skill behind it reaches a session by explicit path and nothing else.
Say so where it is referenced rather than leaving `paths` to imply otherwise.

A repository-level rule is different: it is authored once in `.agents/rules/` and wrapped per
host. See [README.md](README.md).

Body budget 60 lines: [AUTHORING.md](../../AUTHORING.md).
