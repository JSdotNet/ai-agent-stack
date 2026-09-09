# 44. One Plugin, One Bounded Context

```meta
date: 2026-09-08
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/context-map.md", ".devbook/domain/plugin-authoring/domain.md", ".devbook/arc42/adr/2-one-folder-per-plugin.md", ".devbook/arc42/tdr/4-delivery-depends-on-devbook.md"]
```

`.devbook/domain` holds one bounded context per plugin folder, plus `plugin-authoring`, which is
the shared kernel and the only context that is not a plugin. It held a single context until this
date, on the argument that this repository builds authoring assets rather than a running product
and so has nothing to integrate with.

That argument was about the wrong axis. It answered "is there a second *product* here?" when the
question a context map asks is "where can a model change without somebody having to agree?" A
plugin is exactly that line: it is the unit a host installs, versions, and refuses to load, and
[one folder per plugin](2-one-folder-per-plugin.md) already makes it the unit a change is scoped to.
Nine plugins were sharing one `domain.md` while meaning different things by *run*, *record*, and
*view*, and one `dependencies.md` was carrying two rows for the two hosts and nothing for the
seven relationships between the plugins themselves.

What the map now says that no other chapter did: three dependencies are declared and enforced by
a host, three surfaces conform to one published language while neither side declares the other,
two relationships are named-and-skipped rather than depended on, one context reads every other
and declares none — and `delivery` on `devbook` is real in five flows and declared nowhere.
[Debt record 4](../tdr/4-delivery-depends-on-devbook.md) already said that in prose; the context map
is where it stops being a footnote in one record and becomes the one edge in the picture that is
drawn differently from all the others.

The kernel is what keeps this from being nine copies of the same six files. A term earns a place
in `plugin-authoring` by being true of every plugin, and a refinement lives in the plugin's own
registry pointing back at it — `Schedule` is a kind of trigger in the kernel and four parts in
`delivery-schedule`, `Flow Skill` is a scope in the kernel and an aggregate in `delivery`. The
kernel is co-owned, so it stays small: a change to the plugin folder shape, the manifest pair,
the layer order, the stamp, or a migration is a change to nine contexts at once.

Consequence: a new plugin now costs a domain folder as well as a marketplace entry, and the two
land together — a plugin whose boundary nobody could write down is a plugin whose boundary
nobody has decided. `delivery-surface-canvas` gets a folder like the rest, despite taking no
marketplace entry, because it is a boundary regardless of which hosts can install it.
