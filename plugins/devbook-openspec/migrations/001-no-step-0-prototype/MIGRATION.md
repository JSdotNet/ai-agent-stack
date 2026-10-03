# 001 — no Step 0 prototype, from 1.16.0

```meta
appliesTo: [changes]
breaking: yes
```

## What

A change no longer has a Step 0 prototype, and `init` no longer asks whether one is allowed:

| Before | After |
| --- | --- |
| `components.openspec.prototype` | gone |
| `- A Step 0 prototype is allowed here.` under `rules.tasks` in `openspec/config.yaml` | gone |
| that file's stamped hash, when the file was still as it landed | the hash of the file without the line |

The script removes only that exact line, and touches no other line of `openspec/config.yaml`.
A config edited since it landed keeps its stamped hash, so it still reads as the repository's.
In the stamp it rewrites only the `components.openspec` entry.

## Why

A prototype is a standalone file written by the repository's `prototype` procedure, with no
change, task, or approval, and becomes a demo only when a proposal carries it as a delta. The
record is `.devbook/arc42/adr/demos.md` in the marketplace, under *A prototype as a step of a
change*.

## What breaks

Nothing fails loudly. Until this runs, an installed config tells every OpenSpec skill that a
Step 0 prototype is allowed while the `devbook` schema no longer describes one, so
`/opsx:propose` may still write a `## Step 0 — Prototype:` step that the delivery engine then
treats as an ordinary step. `devbook-openspec:update` keeps a leftover `prototype` field
untouched, and nothing reads it.

## Run it

```bash
node migrate.mjs --check
```

`--check` exits `1` while work remains and `0` when nothing is left; it writes nothing. Drop
the flag to apply. Running it twice changes nothing. Both forms take `--root <path>`,
defaulting to the working directory. `devbook-openspec:update` runs it before it detects.
