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

Task categories route to a `flow-<category>` skill that runs the category end to end. Still
`trial` here: the routing is inherited from the plugins this repository will serve, those
plugins still ship the earlier `orch-*` spelling, and this repository has no flow skills of its
own yet.

## Plugin Evaluation

```meta
status: candidate
stage: verify
```

`claude plugin eval` runs a suite against a plugin's skills, which is the only way to check an
asset actually triggers when it should. Untried here — the first plugin to land is the first
thing to evaluate.
