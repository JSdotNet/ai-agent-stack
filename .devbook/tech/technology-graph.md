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

## Claude Code CLI

```meta
status: trial
type: platform
depends-on: [".devbook/tech/technology-graph.md#claude-code-plugin-api"]
related: [".devbook/arc42/tdr/2-fleet-names-the-cli-directly.md"]
```

The only platform here an asset *invokes* rather than is read by. `fleet` shells out to it to
launch each worker as an independent background session (`claude --bg`) and to tell a worker
still running from one that exited (`claude agents --json --all`), which is the mechanism the
whole fan-out subsystem rests on.

`trial`: nothing in this repository has run a sweep yet, and a background session pruned from
the list seconds after it exits is the kind of behaviour only a real run tests. Its absence
costs the dispatch, not the triage — see
[the debt record](../arc42/tdr/2-fleet-names-the-cli-directly.md).

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

## Copilot Extension SDK

```meta
status: trial
type: library
date: 2026-09-04
depends-on: [".devbook/tech/technology-graph.md#copilot-plugin-api"]
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

`@github/copilot-sdk/extension`, imported by both canvas extensions — `devbook`'s
`devbook-canvas` and `delivery-canvas`'s own — for `joinSession` and `createCanvas`. It is the
only third-party import anywhere in this repository, and it is not installed: the Copilot CLI
resolves it when it opens the extension, which is why no `package.json` declares it and why
nothing here breaks when it is absent.

`trial`: nothing in this repository has opened a canvas on that host. The unverified part is
not the import — it is whether these pages render the same way through `createCanvas` as they
did over the MCP viewer they were written against. `delivery-canvas` kept both transports until
it became canvas-only, so there is no longer a second one to answer that on its behalf.

## Node

```meta
status: adopted
type: runtime
date: 2026-09-04
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

What a plugin's executable parts run on: the `devbook` generator with its five test suites, the
`knowledge-tech` package-inventory scripts, the migration scripts, `delivery`'s stack-config
checker and the tests behind it, two surface plugins' MCP servers with their HTTP viewers,
telemetry hook, and `dev/` checks, the two canvas extensions with their own HTTP viewers, and
the command hook each plugin uses to emit session-start context. All of that is ESM against `node:` built-ins with no third-party dependency, which is
why `npm install` is not a step anywhere in this repository.

Two things the flat claim used to get wrong, both worth stating because they are the seams
where the constraint is negotiated rather than held:

- **Two package manifests exist**, one per surface plugin that runs a server, under
  `mcp/<server>/package.json`.
  Each is `private`, declares `type: module` and an entry point, and carries **no
  `dependencies`** — the manifest is there to name the server and floor the runtime at
  `engines.node >= 18`, not to pull anything in. So a version *is* pinned, as a floor; what is
  absent is a lockfile and an install step.
- **The two Copilot canvas extensions are the exception to `node:`-only.** Both import
  `@github/copilot-sdk/extension`, which their host supplies at load time — see
  [the SDK entry](#copilot-extension-sdk). Nothing else here imports anything it does not ship.

The surface servers are where the constraint bites hardest and still holds: an HTTP server, a
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
conversation instead of a link to open. `delivery-dashboard` publishes its pages as `ui://`
resources and speaks the postMessage protocol from a small bridge script injected into the
page. `delivery-canvas` did too until it became canvas-only, which leaves one user here.

`trial`, and reversibly so: it is negotiated at initialize, so a host that does not implement
it never reads the resources and the same pages are served over `127.0.0.1` instead. Nothing
depends on it being there, which is the only reason it is safe to use this early.

## PowerShell

```meta
status: adopted
type: runtime
date: 2026-09-04
depends-on: [".devbook/tech/technology-graph.md#node"]
related: [".devbook/arc42/09-architecture-decisions.md#no-generated-sync-layer"]
```

The second runtime a plugin's executable parts run on, and the only one whose script runs in a
*consuming* repository rather than here. `devbook` ships
`assets/build/Update-KnowledgeIndex.ps1` and `devbook-sync` installs it into `build/`
unconditionally — one of only two payload entries with no adoption condition, the other being
the generator it wraps, because a repository that skips GitHub Actions gets this script alone
and manual refresh. It wraps `build.mjs` to add what the raw `node` call cannot say: which
index files actually moved, so a refresh that changed nothing is visibly a no-op. `-Scope`
narrows it to one folder, `-Check` validates without writing.

It requires PowerShell 7, stated as `#Requires -Version 7.0` in the script itself. The
generator README, `devbook-check`, both shipped workflows, and the pull-request check's own
warning text all name it as the way to refresh a branch, with `node build.mjs` as the fallback
for CI and for anywhere `pwsh` is not installed.

Previously `retired`, and the entry read only as far as the repository's own tooling: the
Copilot-to-Claude sync generator was written and dropped the same day, and the runtime was
retired alongside it. That decision stands and this entry does not reopen it — see
[No Generated Sync Layer](../arc42/09-architecture-decisions.md#no-generated-sync-layer).
Retiring the *runtime* with it was the error. A repository-level generator was removed; a
shipped payload script was not, and `retired` reads as "no longer used" to everyone downstream
of a plugin that installs it into their repository on every sync.
