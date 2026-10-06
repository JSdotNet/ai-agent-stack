# delivery-run-view

A delivery run drawn inside Claude Code itself — its phases top to bottom, how each one ran,
and the phase this session is in — from the run files the surfaces already write.

A viewer, not a surface. It answers none of the surface contract's operations, writes no run
file, declares no dependency, and names no engine. Whichever surfaces record a run, this plugin
reads what they left on disk and draws it; uninstalling it costs a view, never a capability.

That is also why it is not called `delivery-surface-*`. Per
`plugins/delivery/resources/surface-contract.md`, that prefix means an MCP server answering the
contract, and the engine resolves every installed `delivery-surface-*` server as a place to
record a run. A plugin that only reads would be mistaken for one. It keeps the subsystem's stem,
`delivery`, and is named for what it shows: a run.

## Installation

```bash
claude plugin marketplace add JSdotNet/devbook
```

Then enable `delivery-run-view` with `/plugin`. Nothing else is required: the hook module is
loaded by Claude Code itself, and the pane opens on its own once a run of the session appears.

## Claude Code only

The plugin is function-hook modules — `hooks/hooks.json` names `./register.tsx` under
`modules` — and Copilot has no equivalent. So it carries the Claude manifest alone: a plugin
ships the manifest of every host that can load something in it, per
`.devbook/arc42/05-building-block-view.md` under *Plugin Folder*, and here that is one host.
It is the mirror of `delivery-surface-canvas`, which is Copilot's alone.

## What it draws

| Where | Shows |
|---|---|
| Pane — `/flows`, opened on its own the first time a run of this session appears | The run top to bottom, one row per phase: its status, how it ran (`inline`, `delegate`, `fork`, `gate`), the agent, model and effort, the duration, and `↺N` when the phase ran more than once. Sub-agents the phase delegated to hang under it. The focused phase opens in place with its output, QA scenarios, links, output tokens, and tool calls. `‹ ›` steps between runs, and a phase name focuses or unfocuses it |
| Band above the prompt | While this session's run is open: the flow, the stage rail, and the current phase with its mode and agent |
| Inline tool rows | A `mcp__*delivery-surface-*__start_run` or `__update_stage` call in the transcript drawn as one line — the flow and its phases, or the phase and its new status — instead of raw JSON |
| Status line | `<skillId> · <current stage>` while this session's run is open |
| `/flows-demo` | A simulated `flow-code` run played in the pane, one phase every four seconds, held in memory only — no run file is written |

## Where it reads

Every three seconds it reads the newest run files under the profile, at
`~/.claude/delivery-surface-dashboard/<slug>-<hash>/runs/*.json` and
`~/.claude/backlog/<slug>-<hash>/runs/*.json` — `CLAUDE_CONFIG_DIR` in place of `~/.claude`
when set — where `<slug>` is the checkout's folder name. A worktree with no runs of its own
falls back to the main checkout's, so the pane is never empty in a fresh worktree. The same
run found in both places is shown once, the newer copy winning. This session's runs sort first,
by the `sessionIds` a run records.

The run file shape is the dashboard's, which the Backlog app writes too. It is not part of the
surface contract, so a surface that changes its file shape can break this view without breaking
the contract; a run file that does not parse is skipped and read again on the next poll.

## Gaps the surface contract does not cover yet

- **How a phase ran is not recorded.** A run file says what each stage did, never whether it
  ran in the main thread, was handed to a sub-agent, or ran as a `context: fork` skill. So the
  mode is inferred and drawn dimmed with a `?`: a phase with a delegated sub-agent in the run's
  `insights` is `delegate`, Personal Validation is the `gate`, and every other phase is
  `inline`. A fork is never detected.
- **Agent, model, and effort per phase are not recorded either**, beyond the sub-agents the
  telemetry hook captured.

The plugin already reads both where a run carries them, so a contract that adds them needs no
change here: a stage's `execution { mode | runs, agent, model, effort }`, and the resolved
`runContext.phases[<flow>][<phase-key>]` map, the phase key being the stage name, its slug, or
`phase-<slug>`. Both are the shape of the
[Per-Phase Delivery Config proposal](https://claude.ai/artifact/P2LmjotffCQn5PdyPGDNkh).

## The state contract

`types/index.d.ts` declares the plugin's `$.state` — `runs`, `selected`, `focus` under
`delivery-run-view` — and the manifest's `types` key points at it, which is what
`claude plugin validate` checks the module's state reads and writes against. The
`.claude-plugin/types/` folder `tsconfig.json` extends is written by the host for type-checking
and is ignored.
