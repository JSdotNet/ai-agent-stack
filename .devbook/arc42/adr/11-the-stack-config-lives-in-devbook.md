# 11. The Stack Config Lives in devbook

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md", ".devbook/arc42/adr/17-no-host-profile-plugins.md"]
```

The stack config is `.devbook/config.json`. It was `.github/ai-agent-stack.json` and the folder
was wrong from the first commit: `.github/` is one host's folder, and a file both hosts read
does not belong in either one's. The same rule that
[ended host profile plugins](17-no-host-profile-plugins.md) applies to a path.

`.devbook/` won over `.agents/`, the other host-neutral folder here. `.agents/` holds authored
rules that get wrapped per host, so a file nothing wraps would be the odd one in it. `.devbook/`
already holds the repository's own account of how it works, which is what this file is the
machine-readable half of — and it puts the folders a repository adopts and the wiring it
declares in one place, for the same reason the file itself is
[one file with two kinds of key](10-one-config-file-two-kinds-of-key.md).

**The path is not a dependency.** `delivery` reads that file whether or not the repository
adopted a single devbook folder, and `devbook` uninstalled costs the engine nothing: reading a
path is not naming a plugin, and no [layer](../../domain/plugin-authoring/domain.md#layer) order
is touched. What the folder means widens by one file — the chapters plus the wiring — and
`devbook:install` still owns nothing but the chapter folders.

The filename drops the marketplace's name with the folder. `ai-agent-stack.json` was
disambiguating inside `.github/`, where it sat among a host's own files; inside `.devbook/`
there is one config and `config.json` is what it is called. `delivery`'s two resources follow
the file they describe — `resources/config.schema.json` and `resources/config-template.json`.

Consequence: **every repository already on the stack has the file in the old place, and nothing
reads it there.** There is no fallback and deliberately so — two supported paths is two places
for a repository to disagree with itself. `devbook-config:update` reports the old file and
moves it as its first step, and the report prints the legacy path whenever it still exists, so
the failure mode is a named instruction rather than settings that silently stop applying.
