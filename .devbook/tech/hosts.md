# Hosts

```meta
status: adopted
```

The platforms that read an asset, the one that runs it, and the one library a host supplies at
load time. Nothing in this layer is a dependency in a manifest; each is what the checked-in
files are authored for.

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
depends-on: [".devbook/tech/hosts.md#claude-code-plugin-api"]
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

## Copilot Extension SDK

```meta
status: trial
type: library
date: 2026-09-04
depends-on: [".devbook/tech/hosts.md#copilot-plugin-api"]
related: [".devbook/arc42/05-building-block-view.md#plugin-folder"]
```

`@github/copilot-sdk/extension`, imported by both canvas extensions — `devbook`'s
`devbook-canvas` and `delivery-canvas`'s own — for `joinSession` and `createCanvas`. It is the
only third-party import anywhere in this repository, and it is not installed: the Copilot CLI
resolves it when it opens the extension, which is why no `package.json` declares it and why
nothing here breaks when it is absent.

`trial`: nothing in this repository has opened a canvas on that host. The unverified part is
not the import — it is whether a page written for the MCP viewer renders the same way through
`createCanvas`, and `delivery-canvas` is deliberately built so both transports read one copy of
each page rather than answering that question twice.
