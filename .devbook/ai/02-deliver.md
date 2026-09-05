# 2. Deliver

```meta
status: trial
type: stage
```

Carrying a change end to end: from a request to a validated commit, in one session or across
several.

## Flow Skills

```meta
status: trial
type: skill
related: [".devbook/domain/plugin-authoring/naming.md#flow-skill"]
```

Task categories route to a `flow-<category>` skill that runs the category end to end.

- **Used for** — every category of change to a repository that has the engine enabled:
  `delivery` ships fifteen flows, `devbook-flows` five more so an edit to `.devbook/` routes
  through `flow-domain`, `flow-tech`, `flow-design`, `flow-arc42-content`, or `flow-ai` rather
  than `flow-fallback`. A run can report into a surface — `delivery-dashboard` or
  `delivery-collector` here, `delivery-canvas` being a Copilot canvas this marketplace does not
  offer — and resolves its host slots from the `claude-desktop` profile: `CLAUDE.md` as
  `repo-instructions`, sub-agents as `stage-delegation`, `delivery-dashboard` as `surface`.
- **Adopted by** — nobody yet. Every change to this repository so far was carried by hand under
  `CLAUDE.md`, including the ones that built the flows.
- **Evidence** — none yet. Everything a flow needs has landed: the seven role plugins answer
  `spec`, `implement`, `verify`, `app.start`, and `qa.run` and five of the seven roles, where
  before them every delegating stage named an agent that resolved to nothing — over two hundred
  `plugin:asset` references into plugins this marketplace did not offer. What is untested is the
  routing itself. Promote to `adopted` once a change here has been carried by a flow end to
  end, reporting into one of those surfaces.
- **Limits** — the plugins loaded in the authoring sessions are older versions from another
  marketplace, so the flows this repository documents are not the ones that run in it until
  the working copy is enabled by path.

## Fan-Out

```meta
status: candidate
type: skill
related: [".devbook/domain/plugin-authoring/naming.md#fleet-skill", ".devbook/arc42/09-architecture-decisions.md#fan-out-is-its-own-plugin"]
```

`fleet` sweeps a backlog and works it five issues at a time across sessions and worktrees,
instead of one session at a time.

- **Used for** — nothing here yet. This repository's backlog is small enough that the one-issue
  lane has never been the constraint.
- **Adopted by** — nobody. A sweep dispatches workers that open pull requests nobody asked for
  if the triage is wrong, which is not a thing to try on the repository that ships it.
- **Evidence** — none yet. `candidate` rather than `trial` because the honest first use is
  somebody else's repository. The thing to watch when it is tried is the park rate: a sweep
  that parks four of five issues is the design working, and reading that as a failure is how
  the bar gets lowered.
- **Limits** — Claude-only until the `session-spawn` slot lands; see
  [the debt record](../arc42/tdr/2-fleet-names-the-cli-directly.md).
