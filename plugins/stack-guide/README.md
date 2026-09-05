# stack-guide

The reader's way into the marketplace. It answers *what is this, what have I got, and how is
this repository wired* from files on disk, and it owns the two procedures that set a repository
up and move it forward.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `stack-guide` with `/plugin`. During development, add this working copy by path
instead of by repository.

## The three skills

| Skill | Does |
| --- | --- |
| [`stack-guide`](skills/stack-guide/SKILL.md) | Answers one question about the stack. Reads only. The state half comes from the report below, the concept half from walking the canon — plugin READMEs, `.devbook/domain/plugin-authoring/naming.md`, the arc42 chapters, and `delivery`'s surface contract. |
| [`stack-init`](skills/stack-init/SKILL.md) | Writes the engine-owned keys of a repository's `.github/ai-agent-stack.json` for the first time, validates them, then hands each component its own sync skill. |
| [`stack-update`](skills/stack-update/SKILL.md) | The same file, moved forward: version drift, outstanding migrations, and a re-validated config. |

`stack-` is a fourth prefix beside `flow-`, `fleet-`, `phase-`, and `automation-`, and it means
something none of those do: a procedure about the stack itself rather than about a unit of work.

## The report

[`scripts/stack-report.mjs`](scripts/stack-report.mjs) is what makes an answer checkable. It is
read-only, takes no network, and prints the path behind every fact:

```bash
node scripts/stack-report.mjs --root <repository>
```

| Reads | To answer |
| --- | --- |
| The marketplace catalog, in the working tree and in the host's clone | What the newest published version of each plugin is — and whether the clone is stale, which is the usual reason "already latest" is wrong |
| The host's installed-plugin state | Which version of each plugin is actually on disk |
| The user, project, and local settings, merged nearest-last | Which plugins are enabled here |
| `.github/ai-agent-stack.json` | Roles, tracker, every service and chore extension point, policy switches, gates, and each component's stamp |
| The knowledge folders, flat and nested | Which of the five this repository adopted, and in which layout |
| The engine's `skills/` folder | Which `flow-*`, `phase-*`, and `automation-*` procedures the copy on disk ships |

`--json` prints the same model unrendered. `--marketplace <name>` reports a different catalog.

## What it never depends on

- **Any plugin here.** It names all of them and declares none. A plugin it cannot find is
  reported as `not installed` — the same degrade-rather-than-fail shape `delivery` already uses
  for the seven role plugins it names and never depends on. That is what keeps this outside the
  [layer](../../.devbook/domain/plugin-authoring/naming.md#layer) order rather than under it.
- **Writing anything a component owns.** `stack-init` and `stack-update` write the four
  engine-owned keys and stop. Every `components.<name>` stamp stays with that component's own
  sync skill, which is the only thing that knows what it materialized. That is also why
  `devbook-sync` and `devbook-check` did not move here: `devbook` ships the payload, the
  migrations, and the ledger, and a skill in this plugin has no supported path to any of them.

## Files

| Path | Holds |
| --- | --- |
| `.claude-plugin/plugin.json`, `.github/plugin/plugin.json` | The two manifests, agreeing on name, version, and description |
| `skills/stack-guide/SKILL.md` | The question-answering procedure |
| `skills/stack-init/SKILL.md` | First setup of the engine keys |
| `skills/stack-update/SKILL.md` | Version drift, migrations, re-validation |
| `scripts/stack-report.mjs` | The read-only report, run in place from this plugin root |

## Known gap

The report reads one host's plugin state — the config directory, its installed-plugin file, its
marketplace clones, and its settings layers. Two things follow, and both are deliberate.

It is the only asset in this marketplace that still names a host's own paths, after
[`claude-desktop` and `copilot-app` were deleted](../../.devbook/arc42/09-architecture-decisions.md#no-host-profile-plugins)
for doing exactly that. Where a plugin is installed and whether it is enabled is a fact about a
host and about nothing else, so an asset answering it either names those files or answers
nothing, and nothing in a flow reads what this returns. The
[decision](../../.devbook/arc42/09-architecture-decisions.md#the-guide-names-every-plugin-and-depends-on-none)
records the divergence rather than leaving it silent. A slot would be the clean fix and the
engine's closed set has no member for *where this host keeps its plugins*.

And the other host keeps that state somewhere this repository has never written down, so there
its plugin rows come back empty while the catalog half still answers. The report says which
files it read and which were absent, so an empty table is legible rather than misleading.
