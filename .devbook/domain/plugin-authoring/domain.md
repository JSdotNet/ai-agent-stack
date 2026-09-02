# Plugin Authoring

```meta
status: active
index: root
related: [".devbook/domain/context-map.md#plugin-authoring"]
```

What this context is responsible for: that an asset written once loads correctly in every host
that reads it, and that a plugin can be installed on its own.

Inside the boundary: the folder shape of a plugin, the two manifests, the frontmatter each host
requires, the marketplace listing, and the vocabulary in [naming.md](naming.md).

Outside it: how a host resolves or ranks what it loaded, and anything the assets themselves are
used to build. A plugin that orchestrates .NET delivery work says nothing here about .NET.
