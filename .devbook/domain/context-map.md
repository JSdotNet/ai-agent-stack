# Context Map

```meta
index: root
type: context-map
related: [".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/tech/technology-graph.md#claude-code-plugin-api"]
```

This repository has one bounded context. It builds authoring assets, not a running product, so
there is no second context to integrate with — the hosts that load the assets are outside the
boundary.

## Plugin Authoring

Authoring, packaging, and distributing customization assets — agents, skills, instruction
files, hooks, MCP servers — as plugins installable from one marketplace. The language of this
context is in [naming.md](plugin-authoring/naming.md).
