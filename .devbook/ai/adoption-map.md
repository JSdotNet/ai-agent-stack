# AI Adoption Map

```meta
status: adopted
index: root
type: adoption-map
```

How this repository is itself built with AI. The assets it ships are the product and are
described in `.devbook/arc42` and `.devbook/domain`; what follows is only how the work gets
done here.

## Claude Code as Authoring Host

```meta
status: adopted
type: practice
stage: author
related: [".devbook/tech/technology-graph.md#claude-code-plugin-api"]
```

Assets are authored in the host that loads them, in a worktree per change. Authoring in the
host is what surfaces a load failure — a rejected model pin, a duplicate hooks file — while the
change is still being written.

## Flow Skills

```meta
status: trial
type: skill
stage: deliver
related: [".devbook/domain/plugin-authoring/naming.md#flow-skill"]
```

Task categories route to a `flow-<category>` skill that runs the category end to end. `delivery`
now ships fifteen of them, so the routing this repository works under is its own rather than
inherited.

Every knowledge folder now has its own flow too: `devbook-flows` ships five, so an edit to
`.devbook/` routes through `flow-domain`, `flow-tech`, `flow-design`, `flow-arc42-content`, or
`flow-ai` rather than through `flow-fallback`.

A flow run here can also report into a surface: `delivery-dashboard`, `delivery-canvas`, and
`delivery-collector` ship beside the engine, so a run gets a live timeline, a viewer, or a
recorded file depending on which is enabled. Two of the three are installable on this host:
`delivery-canvas` is a Copilot canvas, so it is not in the marketplace here and a run in this
repository renders through the dashboard.

The slots those flows read are answered too. `claude-desktop` binds them for the host this
repository is authored in — `CLAUDE.md` as `repo-instructions`, sub-agents as
`stage-delegation`, `delivery-dashboard` as `surface` — so a flow run here resolves them from
an installed profile rather than falling through to defaults.

So are the specialists. Seven role plugins ship here now, and until they did, every stage a
flow delegates named an agent that resolved to nothing: 251 `plugin:asset` references into
plugins this marketplace did not offer. `spec`, `implement`, `verify`, `app.start`, and
`qa.run` have providers, and five of the seven roles do.

Still `trial`, and now for the only reason left: nothing has used it. Everything that was
missing has landed, so what is untested is the routing itself. Promote this to `adopted` once
a change in this repository has actually been carried by a flow end to end, reporting into one
of those surfaces.

## Fan-Out

```meta
status: candidate
type: skill
stage: deliver
related: [".devbook/domain/plugin-authoring/naming.md#fleet-skill", ".devbook/arc42/09-architecture-decisions.md#fan-out-is-its-own-plugin"]
```

`fleet` ships here, so a backlog could be swept and worked five issues at a time instead of one
session at a time. Nothing here has done it: this repository's backlog is small enough that the
one-issue lane has never been the constraint, and a sweep dispatches workers that open pull
requests nobody asked for if the triage is wrong.

`candidate` rather than `trial` because the honest first use is somebody else's repository. The
thing to watch when it is tried is the park rate — a sweep that parks four of five issues is
the design working, and reading that as a failure is how the bar gets lowered.

## Plugin Evaluation

```meta
status: candidate
type: practice
stage: verify
```

`claude plugin eval` runs a suite against a plugin's skills, which is the only way to check an
asset actually triggers when it should. Untried here — the first plugin to land is the first
thing to evaluate.
