# copilot-app

The Copilot host profile. It answers, for Copilot, the questions a shared asset is not allowed
to answer for itself, and it ships the one procedure that belongs to the host rather than to
the delivery engine.

It is not an orchestrator. The flows, the phases, the automations, and the pull-request lane
all live in [`delivery`](../delivery/README.md), which is host-neutral by construction: a
shared skill names a **slot**, never a host's own file, and a host profile is what binds the
slot. A slot is bound, never branched — no asset here or there carries an if-this-host clause.

## The bindings

Set for every session by the `sessionStart` hook in [`hooks.json`](hooks.json) — one authored
copy, so this table is a reader's summary and that file is the source.

| Slot | Bound to |
| --- | --- |
| `repo-instructions` | `.github/copilot-instructions.md`; `AGENTS.md` when there is none |
| `stage-delegation` | Custom agents are available, so a stage with a delegation hint is delegated |
| `surface` | `delivery-canvas` |
| `pr-lane` | The `gh` CLI when it is on `PATH` |
| `repo-flow-context` | **Unbound** — runtime and QA context is discovered, not read from one declared file |
| `model-override` | **Unbound** — every category takes its default model |

`stage-delegation` and `pr-lane` are capability answers rather than host facts, and that is
deliberate: they ask whether custom agents exist and whether the CLI is present, so neither
re-diverges the moment the other host gains the same feature.

Two things about the last three rows are worth stating rather than discovering:

- `delivery-canvas` answers the **render** capability only. Diagrams and documents get a
  viewer; a run keeps no live timeline unless a lifecycle surface is installed beside it.
  That is the surface contract working — a caller resolves each capability group separately
  and finds an absent group by its names not being there.
- An unbound slot is the engine's documented default, not a gap the engine has to guess at.
  Bind either of them per repository under `bindings["delivery.slots"]` in
  `.github/ai-agent-stack.json` when a repository wants the declared file instead.

Model choice is personal and never comes from a repository, on either host.

## The one skill

[`update-open-sessions`](skills/update-open-sessions/SKILL.md) brings every open session
worktree back in step with the trunk, rebasing or merging, skipping what conflicts and
reporting it. It is here rather than in `delivery` because a *session* is the host's unit: the
engine has no notion of a fleet of open sessions to sync, and syncing one branch inside a flow
is `update-pr-branch`, which is a different job with a pull request attached.

## What it depends on

Nothing. A binding no one reads is inert, so this plugin installs alone and still gives you
`update-open-sessions`; install `delivery` beside it and the bindings start answering. Making
the engine a hard dependency would buy nothing the host enforces and would cost the standalone
case. `delivery-canvas` is a binding too, not a dependency — see
[Surface](../../.devbook/domain/plugin-authoring/naming.md#surface).

## Files

| Path | Holds |
| --- | --- |
| `.github/plugin/plugin.json` | The Copilot manifest. There is no Claude one, and this plugin is deliberately absent from `.claude-plugin/marketplace.json`: everything it binds is Copilot's |
| `hooks.json` | The `sessionStart` prompt hook carrying the bindings |
| `skills/update-open-sessions/` | The one host-owned procedure |

## Its sibling

[`claude-desktop`](../claude-desktop/README.md) is the same idea for the other host: the same
slots, bound to Claude's files and capabilities, plus the two skills that are Claude's own.
Keep the two in step — a slot added to the engine's closed set has to be answered on both
sides, or one host silently falls through to the unbound default.

## License

MIT

## Author

Job Schepers
