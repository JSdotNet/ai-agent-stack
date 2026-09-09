# 23. The Guide Names Every Plugin and Depends on None

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#layer", ".devbook/arc42/05-building-block-view.md#config-plugin", ".devbook/arc42/05-building-block-view.md#stack-config", ".devbook/arc42/adr/10-one-config-file-two-kinds-of-key.md", ".devbook/arc42/adr/17-no-host-profile-plugins.md"]
```

A skill that explains the stack has to name every part of it, and the [layer](../../domain/plugin-authoring/domain.md#layer)
rule says a lower layer never names a higher one. Both cannot hold in the same plugin, which is
why `devbook-config` is a plugin of its own with an empty `dependencies` array rather than a
skill inside `devbook`.

**The name is the file, not a dependency.** It was `stack-guide`, and the rename followed the
config into `.devbook/`: a plugin whose subject is `.devbook/config.json` is named for it, the
way `devbook-graph` is named for the graph it draws rather than for the plugin whose generator
produces one. Reading `devbook-config` as an L1 extension over `devbook` would be the obvious
mistake and the `dependencies` array is the answer to it — empty, `devbook` included, and the
argument below is why it has to stay that way. The four skills lose their `stack-` prefix with
the rename: a prefix separates scopes inside a plugin, and here every skill has the same one.

The rule is about the dependency order, and naming is not depending. `delivery` already carries
over two hundred `plugin:asset` references into seven specialist plugins it never declared,
and a reference that resolves to nothing degrades one stage instead of failing a load. Those
seven have since [left the marketplace](24-the-specialists-leave-the-marketplace.md) and the
references with them, but the shape the argument rests on is unchanged: the guide still names
every plugin in the catalog and declares none. The guide is the same shape taken further: it names every plugin in the
catalog, resolves
each against what is on disk, and reports a plugin it cannot find as `not installed` — which is
an answer, not a degradation. Nothing it names is loaded, so there is nothing to dangle.

Putting it *inside* `devbook` was the obvious first move and is the one the README already
argues against: the five per-folder flows left that plugin for `devbook-flows` precisely because
keeping them made the foundation name the layer above it. Adding a skill that names `delivery`,
`fleet`, and all three surfaces would have undone that in a larger way, and it would have made
the guide unreachable for anyone who installed the engine without the devbook convention.

The rename does not reopen that. Sharing a stem is not being inside: `devbook-config` is a
separate folder, a separate manifest, and a separate marketplace entry, and a repository can
enable it with `devbook` absent — which is exactly the case the empty `dependencies` array
keeps reachable.

**The write skills stop at the engine keys.** `devbook-config:setup` and `devbook-config:update` own `bindings`,
`extensions`, `policy`, and `gates`, and every `components.<name>` stamp stays with that
component's own install skill — the rule [one config file, two kinds of key](10-one-config-file-two-kinds-of-key.md)
already states. Three things follow from it and all three are load-bearing: only the install skill
knows what it materialized, a plugin's payload and migration ledger live inside that plugin
where a foreign skill has no supported path to them, and `devbook` has to keep installing
itself to stay a foundation that works with only itself installed. So `devbook-config:update`'s fourth
step invokes `devbook:install`; it never applies a migration or writes a ledger of its own.

**It names a host's own paths, and that is a divergence taken on purpose.**
[No host profile plugins](17-no-host-profile-plugins.md) ended host-naming everywhere else in this
marketplace, and the report is the one asset that kept it: the host's config directory, its
installed-plugin file, its marketplace clones, and its three settings layers. The rule it bends
is about a *shared asset* growing an if-this-host clause, and this is not that. Where a plugin
is installed and whether it is enabled is a fact about a host and about nothing else, so an
asset answering it either names those files or answers nothing, and no flow reads what it
returns. A slot would be the clean fix and there is none to bind: the closed set has no member
for *where this host keeps its plugins*, and adding one is the engine's call, not the guide's.

Consequence: **the guide can be wrong about a plugin it cannot see.** It reports one host's
plugin state, and on the other host the installed and enabled columns come back empty. It says
which files it read and which were absent rather than inferring, so the failure mode is a
visible blank rather than a confident wrong version — but a truthful answer there needs a host
slot the engine does not have yet.
