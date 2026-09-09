# 39. Every Install Skill Is Called install

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#flow-skill", ".devbook/arc42/adr/38-an-install-is-not-a-sync.md", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md"]
```

`devbook-install`, `collaboration-install`, and `schedule-install` are all `install`,
addressed as `devbook:install`, `devbook-collaboration:install`, and
`delivery-schedule:install`. [An install is not a sync](38-an-install-is-not-a-sync.md) fixed the
verb; this fixes what sits in front of it.

Every one of those prefixes was its own plugin's name said twice, and the three said it in
three different shapes — the plugin name in `devbook-install`, the stem in
`collaboration-install` and `schedule-install`. `plugin:skill` addressing already carries the
scope, which is exactly what
[naming](../../domain/plugin-authoring/domain.md#flow-skill) says makes a prefix redundant: a
prefix marks a procedure's scope against its neighbours, and these have no neighbour to be
marked against. Knowing one plugin's install skill now means knowing all of them.

The cost is that four skills share a bare name, so a host routes on the `description` alone.
Each keeps its old name as a trigger phrase, the way `devbook sync` was kept, so a session
asking by the old name still lands.

`devbook-check` keeps its prefix and is the visible inconsistency. It is not the install
operation and nothing else in the marketplace is named against it, so renaming it would be
churn for symmetry rather than for a rule.

Consequence: three skills renamed, and unlike the sync rename this one **reaches committed
files** — a repository names these ids under `extensions`, so `contractVersion` moves to 9 and
`009-install-skill-ids` rewrites them, in the local overlay as well as the committed config.
No stamp key changes; `components.devbook`, `components.collaboration`, and
`components.schedule` were never named after the skill that writes them.
