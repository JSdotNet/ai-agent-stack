# 56. Payload-Only Components Carry No Contract Version

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md", ".devbook/arc42/adr/38-an-install-is-not-a-sync.md", ".devbook/arc42/adr/46-the-engine-owns-the-capture-contract-the-repository-owns-the-procedure.md", ".devbook/domain/plugin-authoring/domain.md#stamp"]
```

`contractVersion`, `adopted`, and `migrations` are `devbook`'s, not the stamp's. Every other
component writes `pluginVersion` and what it put in the repository, and nothing else —
`delivery` and `devbook-collaboration` a `materialized` map, `delivery-schedule` the selection
it made in the host's scheduler. None of the three gains a `migrations/` folder, and the six
reconcile phases stay `devbook:install`'s.

**What a component writes decides whether it needs a ledger.** `devbook` rewrites content it
does not own: chapters the repository authored, their `meta` blocks, the generated index shape,
a config path, and — in `009-install-skill-ids` — another component's own entry. None of that
is hash-comparable against a release, so only a script can move it and only a ledger can say
whether that script has run. The other three copy files they own whole, and that already gives
them the whole mechanism: a file hashing to a release the plugin shipped is stale and is
replaced, which *is* the migration, and a file hashing to nothing shipped is the repository's
and may never be overwritten — [by any phase, for any reason](38-an-install-is-not-a-sync.md),
ledger or no ledger. A contract version there would be a counter that never moves beside a
folder that stays empty.

The absent `adopted` is the same answer twice over. `devbook-collaboration` installs one rule
always, and `delivery` resolves its two seeds from `.claude/flow-context.md` and
`policy.qa.depth` at run time, so stamping either would record a derived fact that goes stale.
`delivery-schedule`'s `enabled` is not a missing `adopted`: it is a selection made in a
personal scheduler, under the word that fits it.

So the criterion for a fourth component, rather than a precedent to copy: **must your install
rewrite something the repository authored? Then take a contract version and a ledger. Does it
only replace copies you own? Then take neither.**

Consequence: a payload change that has to reach an already-edited copy has no mechanism, by
design. It is reported as customized and merged by hand, because [the seed is meant to be
edited](46-the-engine-owns-the-capture-contract-the-repository-owns-the-procedure.md) and a
mechanical rewrite of the repository's own prose is the thing this stack refuses. Where such a
change must be mechanical, `devbook`'s ledger is the only sanctioned crossing, as
`009-install-skill-ids` already is. The second consequence is the report: it stopped rendering
a Contract, Adopted, and Ledger column that three of four rows could never fill, and says
`payload-only` instead of `-`.
