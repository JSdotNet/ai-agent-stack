# 2. fleet Names the Claude CLI Directly

```meta
date: 2026-09-03
related: [".devbook/arc42/11-risks-and-technical-debt.md", ".devbook/domain/plugin-authoring/naming.md#host-profile", ".devbook/domain/plugin-authoring/naming.md#host-slot", ".devbook/arc42/09-architecture-decisions.md#a-host-profile-depends-on-nothing", ".devbook/arc42/09-architecture-decisions.md#fan-out-is-its-own-plugin", ".devbook/tech/technology-graph.md#claude-code-cli"]
```

**Remediation state:** identified · **Severity:** medium · **Owner:** the maintainer

## The debt

```meta
```

`fleet-issue-sweep` launches each worker with `claude --bg`, tracks them with `claude agents`,
and runs its resolution stages through the `Workflow` tool.

That breaks a rule this repository has already written down. A
[host profile](../../domain/plugin-authoring/naming.md#host-profile) is "the only place in the
stack where a host's own file, path, or capability is named", and `fleet` is not one.

## Origin

```meta
```

It was taken knowingly, in the change that extracted `fleet` into its own plugin, because
resolving it cost more than that change was allowed to spend.

The earlier reasoning for naming the CLI outright — that a slot generalises a divergence that
has happened twice, and this one had happened once — no longer holds. It was written before
`copilot-app` existed. A second host is now here to disagree, which is precisely the condition
that turns the slot from premature into overdue.

## Affected components

```meta
```

`fleet`, and through the fix, `delivery` and both host profiles. The slot set is closed and
**declared by the engine**, so the remedy is a contract change in `delivery` plus an answer in
`claude-desktop` and `copilot-app` — three plugins, a version bump, and a migration ledger.

## Impact

```meta
```

**On a host that cannot launch a background session, a sweep dispatches nothing.** It still
triages, marks the pickup pool, proposes closures, and reports what it would have dispatched,
so the degradation is visible rather than silent — but the parallelism is the whole point of
the skill, and it is gone.

The sharper cost is that nothing says so. `fleet` is a Claude-only plugin whose manifest
declares no such thing, and it ships a Copilot manifest, so Copilot will install it and the
user finds out when a sweep triages and dispatches nothing.

## Remediation options

```meta
```

| Option | Trade-off |
| --- | --- |
| Add a seventh host slot, `session-spawn` — declared by `delivery`, bound by `claude-desktop` to the CLI, left deliberately unbound by `copilot-app` | The right fix, and not a redesign. The precedent is already here: Copilot leaves `repo-flow-context` and `model-override` unbound with documented unbound behaviour, and "a sweep that triages and reports but dispatches nothing" is exactly that shape of default. Costs a contract change across three plugins and a version bump |
| Say in `fleet`'s README and manifest description that it is Claude-only, and drop its Copilot manifest | Cheap, honest, and stops the silent install. But it widens the rule instead of keeping it — a plugin naming a host directly becomes permitted rather than owed |
| Leave it | Every further host-specific reach in `fleet` becomes easier to justify by precedent |

Close this by adding the slot, not by widening the rule. The second option is worth taking
*alongside* the first if the slot is deferred again, because it costs nothing and removes the
silent failure.

**Trigger:** before `fleet` is offered to a Copilot user, or the next time the engine's slot
set is opened for any other reason — whichever comes first.
