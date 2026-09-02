# Context Map

```meta
status: active
index: root
```

This repository has one bounded context. It builds authoring assets, not a running product, so
there is no second context to integrate with — the hosts that load the assets are outside the
boundary.

## Plugin Authoring

```meta
status: active
type: bounded-context
related: [".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/tech/technology-graph.md#claude-code-plugin-api"]
```

Authoring, packaging, and distributing customization assets — agents, skills, instruction
files, hooks, MCP servers — as plugins installable from one marketplace. The language of this
context is in [naming.md](plugin-authoring/naming.md).
