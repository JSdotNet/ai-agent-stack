# 46. The Engine Owns the Capture Contract; the Repository Owns the Procedure

```meta
date: 2026-09-08
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/05-building-block-view.md#roles-and-services", ".devbook/domain/delivery/skills.md", ".devbook/arc42/adr/9-the-point-set-is-closed.md"]
```

Every rule about what evidence a run captures lived in two skills of an external QA plugin —
`playwright-screenshot` and `playwright-recording`, neither of them published from this
marketplace. So a repository that bound no `qa.run` provider got no capture rules at all, and
the phase that exists to guarantee evidence could only hope one was installed. The engine was
naming a guarantee it had no way to keep.

`resources/capture-contract.md` takes the guarantee back. It says what is captured, when it is
required, what comes back, and that an unavailable capture marks the stage `blocked` rather
than degrading it — and it holds with no QA plugin, no `qa.run` binding, and no capture skill.
Capture resolves in a named order: the repository's own `capture` skill, then the provider's,
then the phase driving it directly.

**Capture did not become an extension point,** and that was the live alternative. A `capture`
point would have made it configurable and reachable outside QA, at the cost of an ADR widening
a set [the surface contract calls closed](9-the-point-set-is-closed.md).
The guardrail turns out to be exactly as strong either way — the phase enforces the contract
in both — so the cheaper shape wins, and the expensive one stays available: adding a point
later is easy, removing one is not.

What the engine still cannot write is the procedure. How one product's application comes up,
and where it wants its screenshots, is prose and differs per repository. So `delivery` grows
its first payload: `assets/skills/start.md` and `assets/skills/capture.md`, seeded by
`delivery:install` as one editable copy under `.agents/skills/` with a pointer wrapper per
host, reusing devbook's reconcile stamp unchanged. `managed: false` already means *the
repository has taken ownership of this copy* — editing the seed is the intended path, not a
tolerated exception.

The split is the whole point: the **contract** is the guardrail and stays managed, the
**procedure** is the repository's and is never overwritten. `start` fills `app.start` as
`repo:start`, which needed no engine change at all — `repo:<skill>` was already a legal
provider id.

Consequence: the two QA-plugin capture skills are removed there, and nine referrers across
that plugin and `knowledge-base` repoint at the contract. `.claude/flow-context.md` also loses
its unbacked claim to hold interactive startup — it holds declared facts, the `start` skill
holds the procedure.
