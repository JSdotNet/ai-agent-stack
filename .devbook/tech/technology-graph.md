# Technology Graph

```meta
status: adopted
index: root
```

Everything this repository builds with. There is no runtime and no dependency manifest here:
the assets are Markdown and JSON, and the platforms below are what reads them.

## Markdown

```meta
status: adopted
type: format
```

The canonical form of every asset and every chapter. A host reads the file as checked in, so
whatever a plain Markdown viewer shows is what the host gets.

## Claude Code Plugin API

```meta
status: adopted
type: platform
related: [".devbook/arc42/05-building-block-view.md#marketplace-root"]
```

Reads `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json`, scans `skills/`, and
loads `hooks/hooks.json`. Registry, cache, and installed-plugin records are all keyed by
marketplace name.

## Copilot Plugin API

```meta
status: adopted
type: platform
related: [".devbook/arc42/09-architecture-decisions.md#one-authored-copy-per-asset"]
```

Reads `.github/plugin/plugin.json` and `hooks.json`, applies instruction files from `applyTo`,
and honours the `handoffs` key. The second reader every asset is authored for.

## Model Context Protocol

```meta
status: adopted
type: protocol
related: [".devbook/domain/plugin-authoring/naming.md#mcp-server"]
```

How a plugin ships tools rather than prose. A plugin-provided server is namespaced by its
plugin, so the same server has two possible tool prefixes depending on how it was registered.

Three servers ship here, one per surface plugin, each hand-written against the stdio transport:
newline-delimited JSON-RPC 2.0 on stdin and stdout, no SDK and no dependency.

## Node

```meta
status: adopted
type: runtime
date: 2026-09-03
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

What a plugin's executable parts run on: the `devbook` generator and its test suites, its
migration scripts, `delivery`'s stack-config checker and the tests behind it, the three surface
plugins' MCP servers with their HTTP viewers, telemetry hook, and `dev/` checks, and the
command hook each plugin uses to emit session-start context. All of it is dependency-free ESM
against `node:` built-ins, so there is no package manifest anywhere in this repository and no
version is pinned — CI runs whatever its runner ships.

The surface servers are where that constraint bites hardest and still holds: an HTTP server, a
server-sent event stream, a Markdown renderer, and a Mermaid page are all reachable from
`node:http` plus a CDN script tag in the page itself.

## MCP Apps

```meta
status: trial
type: protocol
date: 2026-09-03
depends-on: [".devbook/tech/technology-graph.md#model-context-protocol"]
related: [".devbook/arc42/05-building-block-view.md#surface-plugins"]
```

The MCP extension (SEP-1865) that lets a server hand the host a page to render inline in the
conversation instead of a link to open. `delivery-dashboard` and `delivery-canvas` publish
their pages as `ui://` resources and speak the postMessage protocol from a small bridge script
injected into the page.

`trial`, and reversibly so: it is negotiated at initialize, so a host that does not implement
it never reads the resources and the same pages are served over `127.0.0.1` instead. Nothing
depends on it being there, which is the only reason it is safe to use this early.

## PowerShell

```meta
status: retired
type: runtime
date: 2026-09-02
related: [".devbook/arc42/09-architecture-decisions.md#no-generated-sync-layer"]
```

Carried the Copilot-to-Claude sync generator, which was removed the day it landed. Retired
rather than dropped, so the next repository-level script starts from the decision that removed
it instead of reintroducing it by accident.
