# 004 — an `app.start` binding to `repo:start` is gone, from 1.15.0

```meta
appliesTo: [procedures]
breaking: yes
```

## What

`001-start-is-run` moved the `start` procedure to the `run` recipe and rewrote only the stamp,
so a `.devbook/config.json` that bound `app.start` to it still names a skill that no longer
exists:

| Before | After |
| --- | --- |
| `"app.start": "repo:start"` | the key is gone — the default provider, `phase-validation`, starts the application by invoking `run` |
| `"app.start": { "provider": "repo:start" }` | the key is gone, as above |
| `"app.start": { "provider": "repo:start", "host": "aspire" }` | `{ "provider": "delivery:phase-validation", "host": "aspire" }` — the options stay with the default provider |

An `extensions` object left empty goes with the key. The script touches no other key and
leaves every other byte of the file alone. `extensions` is the engine's; the write is the
rename exception in devbook's `assets/reconcile-protocol.md` under *The stamp*.

## Why

A provider that does not resolve degrades to the point's unbound behaviour, so the stale id
cost nothing at run time but a line in every run summary — and `devbook-config:doctor`
reports it as unresolved. The record is `.devbook/arc42/adr/install.md` in the marketplace.

## What breaks

Nothing that worked: `repo:start` resolved to no skill once `001` ran. An `app.start` bound
to `null`, or to any other provider, is left alone. A personal overlay under the devbook
config directory is not the repository's and is not read; rebind one by hand.
