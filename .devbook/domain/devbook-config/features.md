# Devbook Config

```meta
type: features
related: [".devbook/domain/context-map.md#devbook-config"]
```

> Four skills, two of which write nothing. All four are backed by one read-only report that names
> the file behind every fact.

## Set the Repository Up

```meta
type: feature
related: [".devbook/domain/devbook-config/domain.md#setup", ".devbook/domain/devbook-config/domain.md#engine-configuration"]
```

Write a repository's four engine-owned keys for the first time — which provider fills each point,
which plugin fills each role, which tracker, which policy switches, which gates — then hand every
component its own install skill.

It is a conversation about intent, which is why it is not the same skill as the one that moves the
stack forward.

### Stop at the Engine Keys

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key"]
```

Write the four and no more. Every `components.<name>` stamp stays with the component that knows
what it materialized — which is why this context invokes `devbook:install` rather than
reimplementing it.

## Move the Stack Forward

```meta
type: feature
related: [".devbook/domain/devbook-config/domain.md#update", ".devbook/domain/devbook-config/domain.md#scope-verdict"]
```

One run over the whole configured stack: version drift, outstanding migrations, a fan-out to
every adopted component's install skill, and a re-validated config. It changes nothing about
intent, which is what makes it safe to run when nothing has changed.

### Resolve a Scope Per Component

```meta
type: sub-feature
```

Decide what to do with each component from three orthogonal inputs — installed on this machine,
enabled in this checkout, stamped in this repository. Six verdicts follow, and the interesting
one is `blocked`.

### Never Drop a Stamp

```meta
type: sub-feature
```

A component this machine lacks is skipped and left stamped. A stamp is committed and shared while
installed-ness is personal, so dropping the entry would un-adopt the component for everyone on the
next commit.

## Answer a Question About the Stack

```meta
type: feature
related: [".devbook/domain/devbook-config/domain.md#guide", ".devbook/arc42/09-architecture-decisions.md#the-guide-names-every-plugin-and-depends-on-none"]
```

Explain what this marketplace is, what this machine has, and how this repository is wired — the
only place those three are answered together, because no other plugin is allowed to name every
plugin.

### Name the File Behind Every Fact

```meta
type: sub-feature
related: [".devbook/domain/devbook-config/domain.md#fact-source"]
```

Print the source of each fact, and name the files that were absent as well as the ones that were
read. That is what makes an empty table legible as "this was not there" rather than as "there is
nothing".

### Report Both Catalogs

```meta
type: sub-feature
```

Compare the catalog in the working tree against the one in the host's clone. A clone older than
the source is the usual reason "already latest" is wrong, so the report prints both and the commit
behind each.

## Report Adoption Drift

```meta
type: feature
related: [".devbook/domain/devbook-config/domain.md#adoption-drift"]
```

Say where the `.ai` adoption record no longer matches what is installed, enabled, and wired — and
hand every edit to the folder's own flow. It writes nothing, deliberately: the report can only see
what is on disk, and whether people actually work a certain way is not on disk.
