# AI Adoption Map

```meta
status: adopted
index: root
```

How this repository is itself built with AI. The assets it ships are the product and are
described in `.devbook/arc42` and `.devbook/domain`; what follows is only how the work gets
done here.

## Claude Code as Authoring Host

```meta
status: adopted
stage: author
related: [".devbook/tech/technology-graph.md#claude-code-plugin-api"]
```

Assets are authored in the host that loads them, in a worktree per change. Authoring in the
host is what surfaces a load failure — a rejected model pin, a duplicate hooks file — while the
change is still being written.

## Flow Skills

```meta
status: trial
stage: deliver
related: [".devbook/domain/plugin-authoring/naming.md#flow-skill"]
```

Task categories route to a `flow-<category>` skill that runs the category end to end. `delivery`
now ships sixteen of them, so the routing this repository works under is its own rather than
inherited.

Every knowledge folder now has its own flow too: `devbook-flows` ships five, so an edit to
`.devbook/` routes through `flow-domain`, `flow-tech`, `flow-design`, `flow-arc42-content`, or
`flow-ai` rather than through `flow-fallback`.

A flow run here can also report into a surface: `delivery-dashboard`, `delivery-canvas`, and
`delivery-collector` ship beside the engine, so a run gets a live timeline, a viewer, or a
recorded file depending on which is enabled.

Still `trial`, and now for the only reason left: nothing has used it. Both things that were
missing have landed, so what is untested is the routing itself. Promote this to `adopted` once
a change in this repository has actually been carried by a flow end to end, reporting into one
of those surfaces.

## Plugin Evaluation

```meta
status: candidate
stage: verify
```

`claude plugin eval` runs a suite against a plugin's skills, which is the only way to check an
asset actually triggers when it should. Untried here — the first plugin to land is the first
thing to evaluate.
