# 9. OpenSpec's Model Does Not Cover a devbook Change

```meta
date: 2026-09-27
related: [".devbook/arc42/11-risks-and-technical-debt.md", ".devbook/arc42/building-blocks/devbook-openspec.md#constraints", ".devbook/arc42/building-blocks/devbook.md#dependencies"]
```

**Remediation state:** identified · **Severity:** medium · **Owner:** the maintainer

## The debt

```meta
```

The lane was designed with a devbook change living inside `.devbook/` as a supporting folder,
`.changes/` beside `_meta/`, with no `specs/` at all and OpenSpec's archive folding the change
back. The [spike against OpenSpec 1.13.2](../building-blocks/devbook-openspec.md#constraints)
showed that OpenSpec's model covers none of that, so the bridge carries what the CLI will not:

- **A fixed root.** Every root is a folder named `openspec/` with `changes/`, `specs/`, and
  `schemas/` inside, by those names. The change folder cannot be a devbook folder by path, and
  no supporting folder under `openspec/` starts with a dot. devbook's generator has to find
  changes in `openspec/changes/` at the repository root, outside `.devbook/`.
- **A spec folder that returns.** `init` scaffolds `specs/` and `archive` recreates it. It is
  empty and git never sees it, but `openspec list --specs` reads a spec set there, never where
  this repository's behaviour lives.
- **Validation that checks nothing of ours.** A devbook change validates only because
  `new change` sets `skip_specs: true` for a schema with no `specs` artifact. `openspec
  validate` then accepts zero deltas; the shape of a `devbook-delta/` file is checked by
  devbook or by nobody.
- **An archive that only moves.** `openspec archive` merges `specs/` deltas and nothing else;
  it moved a change whose `devbook-delta/` it did not recognise, and did so even where
  `validate` refused the change. The bridge's `archive` merges every delta before the move.
- **An empty glob is incomplete.** A change whose only deltas are behaviour, or that has
  none, cannot complete `devbook-delta` without a placeholder file.
- **Checks written for the default schema.** Archive warns that a devbook proposal lacks
  `## What Changes`, the `spec-driven` proposal's section, whatever schema the change uses.

Two smaller facts belong to the same gap. OpenSpec collects anonymous usage statistics unless
`OPENSPEC_TELEMETRY=0` is set, which is a machine's choice and belongs in the overlay, not the
repository. And its apply context names the root as the one editable place, which is why the
root cannot sit under `.devbook/`.

## Origin

```meta
```

Found, not taken: the design checkpoint named these as the four questions OpenSpec's
documentation did not settle, and the spike answered each against the CLI rather than the
docs. The design's fallbacks already allowed for every one; what this records is that the
fallbacks are now the design.

## Affected components

```meta
```

The planned `devbook-openspec` plugin — its `init`, which places the root at the repository
level, and its `archive`, which owns the merge — and devbook's generator, whose folder
resolution has to reach `openspec/changes/` outside `.devbook/`. Nothing shipped is wrong
today; nothing has been built on the other layout.

## Impact

```meta
```

The dot convention for supporting folders has an exception a reader has to learn: a change
lives in `openspec/changes/<name>/`, not in `.devbook/.changes/<name>/`. Every merge,
every delta-shape check, and every completeness rule a devbook change needs is the bridge's to
write and test, and an OpenSpec release that changes its archive or status behaviour is a
bridge release.

## Remediation options

```meta
```

| Option | Trade-off |
| --- | --- |
| Accept the fixed layout and let the bridge compensate, as the fallbacks already do | Costs the dot exception and a merge the bridge owns; needs nothing from upstream |
| Propose upstream a configurable root folder name and a schema-declared archive merge | Would let the layout be exact and archive do the merge; depends on a project outside this one, on its schedule |
| Fork OpenSpec's skills into the bridge | Rejected by the design: a fork of twelve skills against a project that releases every few weeks |

**Trigger:** the bridge's first release, which is when the compensating code becomes something
to maintain; or an OpenSpec release that makes the root folder name or the archive merge
configurable, which settles the second option.
