# claude-desktop

The Claude host profile. It answers, for Claude, the six questions a shared asset is not
allowed to answer for itself, and it ships the two procedures that belong to the host rather
than to the delivery engine.

It is not an orchestrator. The flows, the phases, the automations, and the pull-request lane
all live in [`delivery`](../delivery/README.md), which is host-neutral by construction: a
shared skill names a **slot**, never a host's own file, and a host profile is what binds the
slot. A slot is bound, never branched — no asset here or there carries an if-this-host clause.

## The bindings

Set for every session by the `SessionStart` hook, from
[`hooks/session-start-context.md`](hooks/session-start-context.md) — one authored copy, so
this table is a reader's summary and that file is the source.

| Slot | Bound to |
| --- | --- |
| `repo-instructions` | `CLAUDE.md` at the repository root; `AGENTS.md` when there is none |
| `repo-flow-context` | `.claude/flow-context.md` |
| `model-override` | `CLAUDE_FLOW_MODEL_SELECTION_PATH`, else `%USERPROFILE%\.claude\flow\model-selection.md` on Windows and `~/.claude/flow/model-selection.md` elsewhere |
| `stage-delegation` | Sub-agents are available, so a stage with a delegation hint is delegated |
| `surface` | `delivery-dashboard` first, then whatever else answers the capability |
| `pr-lane` | The `gh` CLI when it is on `PATH` |

Two of those are capability answers rather than host facts, and that is deliberate:
`stage-delegation` asks whether sub-agents exist and `pr-lane` whether the CLI is present, so
neither re-diverges the moment the other host gains the same feature. `surface` names a
preference at the top of the engine's fixed priority order, never a dependency: no surface
bound is a normal outcome that costs a view and never a capability.

Model choice is personal. The `model-override` path is the **only** override tier, it lives
outside every repository, and nothing here ever reads a model from `.github/ai-agent-stack.json`.

## The two skills

| Skill | Why it is here and not in `delivery` |
| --- | --- |
| [`start`](skills/start/SKILL.md) | Bringing the app up for a **developer** is an interactive act on one host: it opens a URL in that host's browser pane. The engine's own runtime need is the `app.start` service, which is a different job with different evidence rules. |
| [`session-handoff`](skills/session-handoff/SKILL.md) | A handoff caps a **session**, and a session is the host's unit, not the engine's. The engine's execution model names this skill as the procedure for its handoff steps and follows them inline where it is absent. |

Both read the repository's own files first and infer only as a last resort. Their starting
points are [`resources/start-template.md`](resources/start-template.md) and
[`resources/session-handoff-template.md`](resources/session-handoff-template.md).

## What it depends on

Nothing. A binding no one reads is inert, so this plugin installs alone and still gives you
`start` and `session-handoff`; install `delivery` beside it and the bindings start answering.
Making the engine a hard dependency would buy nothing the host enforces and would cost the
standalone case.

`delivery-dashboard` is a binding too, not a dependency — see
[Surface](../../.devbook/domain/plugin-authoring/naming.md#surface).

## Files

| Path | Holds |
| --- | --- |
| `.claude-plugin/plugin.json` | The Claude manifest. There is no Copilot one — see below |
| `hooks/hooks.json`, `hooks/emit-session-context.mjs` | The `SessionStart` command hook and its emitter |
| `hooks/session-start-context.md` | The slot bindings, as the text the hook injects |
| `hooks.json` | A Copilot-only guard: says this plugin is Claude-only and points at `copilot-app` |

Claude Code rejects a `prompt` hook on `SessionStart` and records the refusal as a
non-blocking error, so the bindings ship as a command hook printing `additionalContext`.
Copilot reads a plugin's **root** `hooks.json` and falls back to `hooks/` only when it is
absent, so the root file both delivers the guard and stops Copilot running commands written
against `${CLAUDE_PLUGIN_ROOT}`.

## Its sibling

[`copilot-app`](../copilot-app/README.md) is the same idea for the other host: the same slots,
bound to Copilot's files and capabilities, plus the one skill that is Copilot's own. Keep the
two in step — a slot added to the engine's closed set has to be answered on both sides, or one
host silently falls through to the unbound default.

## Install

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

```bash
claude plugin install claude-desktop@jsdotnet
```

## License

MIT

## Author

Job Schepers
