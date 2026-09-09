# 41. A Session-Start Hook Fires Only Where the Repository Adopted the Plugin

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/arc42/adr/2-one-folder-per-plugin.md", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md"]
```

A plugin is enabled per machine; almost everything it ships is inert until asked for. A hook is
the exception — it fires on the host's schedule, not on a request — so an unguarded
`SessionStart` hook is the one component that speaks in every repository on the machine whether
or not that repository uses the plugin. Five of them did, spending context in every session and
pushing routing toward skills the repository never adopted.

Each `emit-session-context.mjs` now resolves the repository root and stays silent unless the
repository opted in: it names the plugin in its own `enabledPlugins`, or it carries the assets
the guidance is about — a devbook folder for `devbook` and `devbook-collaboration`,
`.devbook/config.json` or `.claude/flow-context.md` for `delivery`, `fleet`, and
`delivery-schedule`. Those three keep the pre-move `.github/ai-agent-stack.json` on the list
beside the current path: a marker is an existence probe rather than a config read, so testing
both is not the second supported path
[the config move refused](11-the-stack-config-lives-in-devbook.md), and it keeps a repository that
has not run the 008 migration from losing its routing context. The explicit opt-in outranks the markers, so a repository that adopted a
plugin but has written nothing yet still gets its guidance. Only `MARKERS` differs between the
five copies; a plugin installs alone and may not import from a sibling, so the logic is
duplicated rather than shared.

Consequence, and it is a real one: [a missing config file is still normal to a
run](10-one-config-file-two-kinds-of-key.md), but it no longer carries the routing hint. A
repository that runs flows on pure defaults, with neither the stack config nor an entry in its
own `enabledPlugins`, now starts its sessions without the flow routing text. The flows are
unchanged and still work there; only the unprompted nudge is gone, and the file that restores
it is the one `devbook-config:setup` writes anyway.

Copilot reads `hooks.json` at the plugin root, where a hook is `type: prompt` and cannot guard
itself. That copy stays unconditional, which is why its opening sentence hedges where the
Claude one can decide.
