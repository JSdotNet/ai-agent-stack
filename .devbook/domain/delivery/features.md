# Delivery

```meta
type: features
related: [".devbook/domain/context-map.md#delivery"]
```

> What this context lets a repository do. Every one is observable from outside the engine: a
> branch exists, a gate was answered, a pull request is open, a config key was rejected.

## Run a Flow

```meta
type: feature
related: [".devbook/domain/delivery/domain.md#flow", ".devbook/domain/delivery/domain.md#run"]
```

Carry one unit of work from a request to a review-ready change in one session, through a staged
procedure chosen for its category. Sixteen categories ship; a repository needing a different
shape writes its own and it takes precedence.

### Resolve Scope First

```meta
type: sub-feature
```

Derive what is missing — reproduction steps, acceptance criteria, boundaries, architecture
context — instead of refusing the run for lacking them. A thin request is the normal case, and
the flow that only works on a well-specified one is a flow nobody reaches.

### Close Through the Right Tier

```meta
type: sub-feature
related: [".devbook/domain/delivery/domain.md#phase-tier"]
```

Build, test, and validate a code change; skip all three for a documentation change, because
there is nothing runnable to validate. The tier is a property of the change kind, not of
somebody's preference.

### Hand the Session Over

```meta
type: sub-feature
related: [".devbook/domain/delivery/domain.md#run"]
```

When the context gauge crosses its threshold, package the run and resume it on the same stage
in a fresh session. It belongs to no tier because it is an interrupt rather than a step.

## Bind a Provider to a Point

```meta
type: feature
related: [".devbook/domain/delivery/domain.md#extension-point", ".devbook/arc42/09-architecture-decisions.md#the-point-set-is-closed"]
```

Name what fills each of the eleven points this repository cares about, and leave the rest
unbound. This is what makes the engine host-neutral and specialist-neutral: it names a point,
and the repository names the plugin.

### Consult a Role

```meta
type: sub-feature
related: [".devbook/domain/plugin-authoring/naming.md#role", ".devbook/arc42/05-building-block-view.md#roles-and-services"]
```

Reach architecture, QA, domain, UX, or docs expertise by the name of the slot rather than the
name of a plugin. No provider for any of them ships in this marketplace, and every reference
states its fallback, so an unbound role costs a stage its specialist and never the flow.

### Ground a Point in an MCP Server

```meta
type: sub-feature
related: [".devbook/arc42/09-architecture-decisions.md#an-mcp-server-is-bound-per-point"]
```

Give one point the servers it should consult. A bound server is resolved from the live tool
list, and one that does not answer costs that stage its grounding rather than the run.

## Gate a Run

```meta
type: feature
related: [".devbook/domain/delivery/domain.md#gate", ".devbook/arc42/09-architecture-decisions.md#the-overlay-may-add-a-gate-and-never-remove-one"]
```

Stop and ask a person, at Personal Validation and anywhere else the repository wants one. The
value is the asymmetry: adding a checkpoint is always allowed and removing one never is, so an
overlay can only make a run more conservative than the engine shipped it.

### Add a Gate

```meta
type: sub-feature
```

Attach one to any extension point, before or after, showing that point's output. `spec → gate →
implement` is the highest-value one to turn on, because it is the last cheap place to disagree.

### Park Instead of Waiting

```meta
type: sub-feature
related: [".devbook/domain/delivery/domain.md#gate-outcome"]
```

An unattended run reaching a blocking gate writes a handoff brief and stops. It never waits for
an answer nobody is there to give, and it never approves on its own behalf.

## Configure the Stack

```meta
type: feature
related: [".devbook/domain/delivery/domain.md#stack-config", ".devbook/arc42/09-architecture-decisions.md#one-config-file-two-kinds-of-key"]
```

Declare bindings, extensions, policy, and gates in one committed file, validated against a
schema that rejects an unknown key rather than ignoring it. A typo must never become a silently
absent setting — that is the one property this feature exists for.

### Overlay a Machine

```meta
type: sub-feature
```

Let one checkout carry its own overlay for what is personal to it, merged over the committed
file. It may add a gate and may never remove one, which keeps the overlay from being a way
around the committed shape.

## Deliver the Change

```meta
type: feature
related: [".devbook/domain/delivery/domain.md#pull-request-lane"]
```

Open the finished change for review under whatever lane the repository has: a pull request, or
file artifacts alone when nothing is bound. Merging is not here and never was — nothing in this
context merges its own work.

### Take a Pull Request to Merge-Ready

```meta
type: sub-feature
```

Bring the branch level with its base, resolve the conflicts, fix the checks that fail, and
score it against the merge-ready checklist. Usable on a change no flow produced, which is why
it is a lane rather than a stage.

### Pick Up an Item

```meta
type: sub-feature
related: [".devbook/domain/plugin-authoring/naming.md#tracker"]
```

Start a run from one tracker item — a GitHub issue, a Jira ticket, an Azure alert turned into
one — claim it, and route it to the flow its type calls for. One item per run, with a person
present.

## Report the Run

```meta
type: feature
related: [".devbook/domain/delivery/domain.md#run-started", ".devbook/arc42/09-architecture-decisions.md#delivery-ships-no-surface"]
```

Publish the run's shape, each stage's result, and its outcome in a language any surface can
answer — and produce the same file artifacts whether one does or not. **No surface bound is a
normal outcome:** it costs a view, never a capability, and the run says so once and continues.
