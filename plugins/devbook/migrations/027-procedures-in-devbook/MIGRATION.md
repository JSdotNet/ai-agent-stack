# 027 — the procedures are devbook's, from contract 27

```meta
contractVersion: 27
appliesTo: [procedures]
breaking: yes
```

## What

`devbook-procedures` folded into `devbook`, so the procedures' stamp entry moves into
devbook's:

| Before | After |
| --- | --- |
| `components.devbook-procedures.adopted` | `components.devbook.procedures.adopted`, the same list |
| `components.devbook-procedures.materialized` | merged into `components.devbook.materialized`, each entry's `from`, `hash`, and `managed` kept |
| `components.devbook-procedures.pluginVersion` | gone — devbook's `pluginVersion` covers the procedures |
| `components.devbook-procedures` | gone |

No file moves: every procedure body, wrapper, recipe, and the demo template stay where they
are. A `materialized` path devbook's entry already records keeps devbook's entry. The script
rewrites the two entries and leaves every other byte of `.devbook/config.json` alone.

It runs after `001` to `004`, which rewrite the old entry; ledger order guarantees it. Where
`components.devbook` is absent, it is created holding only the procedures, and the stamp
phase of `devbook:init` completes it.

## Why

`devbook` was the plugin's only dependency and already reconciles, stamps, and migrates, so
the procedures became one more part a repository adopts in devbook's stamp. The record is
`.devbook/arc42/adr/plugin-boundaries.md` and `.devbook/arc42/adr/install.md` in the
marketplace.

## What breaks

A reader of `components.devbook-procedures`. Nothing in the marketplace reads it from this
release; `devbook-config:doctor` reports one still present as hard drift fixed by
`devbook:update`. A repository that never adopted a procedure sees `nothing to do`.

## How to verify

```bash
node migrate.mjs --check
```

Exits `0` when `.devbook/config.json` has no `components.devbook-procedures`, and `1` while
it has one.
