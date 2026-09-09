# 17. No Host Profile Plugins

```meta
date: 2026-09-05
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#host-slot", ".devbook/arc42/05-building-block-view.md#host-slots"]
```

`claude-desktop` and `copilot-app` are deleted. Nothing in this marketplace names one host's
own file, path, or capability any more, and no plugin ships slot bindings.

They were kept for one change as the place a host's facts were allowed to live: six slot
bindings each, plus three procedures that cap a *session* rather than a run — `start` and
`session-handoff` on one side, `update-open-sessions` on the other. What that bought was a
six-line table per host and a hook to inject it. What it cost was a plugin per host in a
marketplace whose whole premise is that one authored copy serves both, and a standing
obligation that every slot added to the engine be answered twice, with nothing checking that
it was.

Three consequences, and the second is the one to watch:

- **The three session skills are gone, not rehomed.** Folding them into `delivery` was the
  alternative, and it was refused: `start` opens a URL in a host's own browser pane and
  `update-open-sessions` walks a host's own worktrees, so moving them would have moved the
  host-naming into the engine rather than out of the marketplace. `session-handoff` had the
  one real claim, and the engine already carried its procedure inline under **Session
  Handoff** in `flow-execution-model.md` — which is now the only copy.
- **Every slot resolves unbound unless a repository binds it.** `repo-instructions` falls back
  to `AGENTS.md`, `model-override` to category defaults, `stage-delegation` to running stages
  inline, `surface` to file artifacts, `pr-lane` to no pull request. Three of the six are
  settable under `bindings["delivery.slots"]`; `model-override` deliberately is not, because
  model choice is personal, and `stage-delegation` and `surface` are read from the live
  session rather than declared anywhere. A repository that wants the old Claude answers writes
  three lines of config.
- **The slot set outlives its binders.** It stays declared in
  `surface-contract.md`, because what it buys is a shared asset that never grows
  an if-this-host clause, and a slot nobody binds still buys that.
