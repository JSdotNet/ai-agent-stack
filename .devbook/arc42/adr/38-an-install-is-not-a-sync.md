# 38. An Install Is Not a Sync

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#stamp", ".devbook/arc42/adr/37-a-plugins-rules-reach-a-host-through-the-install.md"]
```

`<component>-sync` is now `<component>-install`. *Sync* names a two-way reconcile between
peers, and nothing here is one: a plugin writes its payload into a repository, and the
repository never writes back. What the word actually described — idempotent, plan-then-write,
customized copies left alone — is true of an install as well, and the skills say it in their
own prose.

The rename lands with the folder rules and not before, because that is when the vocabulary
started to cost something. `devbook-install` was materializing tooling; now it installs rules,
and `rules/rules.json` carries a per-rule key saying which adopted folder pulls each one in.
`"sync": "arc42"` on that key read like a direction of travel. `"install": "arc42"` reads like
what it is.

What keeps the name is what genuinely reconciles two sides that both change:
`assets/code-sync-protocol.md`, where a chapter and the code it describes each move on their
own and the skills report a five-way drift verdict between them. Ordinary English keeps it too
— *keep in sync*, *sync-over-async*.

Consequence: two skills renamed, the Stamp term reworded, and `devbook sync` kept as a trigger
phrase in both so a session asking by the old name still lands. No stamp key changes, so no
migration: `components.devbook` and `components.schedule` were never named after the skill.
