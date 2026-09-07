# Plugin Authoring

```meta
index: root
type: domain
related: [".devbook/domain/context-map.md#plugin-authoring"]
```

What this context is responsible for: that an asset written once loads correctly in every host
that reads it, and that a plugin can be installed on its own.

Inside the boundary: the folder shape of a plugin, the two manifests, the frontmatter each host
requires, the marketplace listing, and the vocabulary in [naming.md](naming.md).

Outside it: how a host resolves or ranks what it loaded, and anything the assets themselves are
used to build. A plugin that orchestrates .NET delivery work says nothing here about .NET.

**This is the one context here that is not a plugin.** Every other context in
[the map](../context-map.md) is one plugin folder, and this is the language all of them are
written in — a [shared kernel](../context-map.md#plugin-authoring) rather than a supplier. What
that means in practice: a change to the plugin folder shape, the manifest pair, the layer order,
the stamp, or a migration is a change to nine contexts at once, so the kernel stays small on
purpose and a term earns a place in it only by being true of every plugin.

A term that is true of one plugin lives in that plugin's own `naming.md` instead, with a
`related` link back to whatever kernel term it refines.
