# 57. The Runner Opens No Browser Pane

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/17-no-host-profile-plugins.md", ".devbook/arc42/adr/47-the-runner-names-the-surface-servers-it-can-reach.md", ".devbook/arc42/05-building-block-view.md#host-slots"]
```

`flow-runner`'s `tools` list carried three ids naming one host's own in-app browser pane —
`mcp__Claude_Browser__preview_start`, `mcp__Claude_Browser__tabs_context`, and
`mcp__Claude_Browser__navigate`. They are removed. The runner publishes URLs and opens
nothing.

**The exception in [record 47](47-the-runner-names-the-surface-servers-it-can-reach.md) does
not stretch this far.** Its argument — an exact-match allowlist cannot hold a pattern —
applies to these three verbatim, which is what made them look sanctioned. What it covers is
four ids belonging to servers *this marketplace ships*, where the id is the permission that
leaves the surface contract something to resolve: omit it and a bound surface is unreachable,
so the run cannot report at all. A host's browser pane is the other thing entirely, and
[record 17](17-no-host-profile-plugins.md) named this exact capability when it refused to fold
`start` into `delivery`: *`start` opens a URL in a host's own browser pane, so moving it would
have moved the host-naming into the engine rather than out of the marketplace.* The engine's
own runner then carried three ids for that capability. [Chapter
5](../05-building-block-view.md#host-slots) says nowhere in the stack is a host's own file,
path, or capability named — true under record 47, false under these three, and the ids are
what was wrong.

**Nothing in a run called them.** `phase-personal-validation` runs inline with no agent and
publishes clickable URLs in the conversation, in both places, every time. `app.start` binds
`aspire` or `playwright` from the live tool list at the stage that uses it. The one call site
was **Surfacing the surface** in `surface-contract.md`, whose own third rung already said
*plain link* and whose closing line already said failing to open a pane is a presentation
problem, not a run problem. A forced exception is only forced when the alternative is broken;
here the alternative was written down beside it. The three ids are residue of the port from
the deleted `claude-desktop` orchestrator, carried across in the rename that made it
`flow-runner` — they also broke `.agents/rules/agents.md` twice, granting single tools rather
than a server and in one spelling rather than both.

Consequence, and it is a real one: **inside a flow run, nothing opens by itself on a host with
a pane.** The surface's dashboard is a link the user clicks, and so is the application at
Personal Validation, because the repository's own `start` skill — which says *use the host's
inline browser when it has one; otherwise give the plain URL* — takes the second branch when
the runner invokes it, and the first only when the user invokes it themselves outside a flow.
A host that renders the surface inline through MCP Apps is unaffected; that is rung one and it
needs no tool. The cost is one click per run, and it buys back the sentence in chapter 5.

Close it when a host allows a prefix or capability match in `tools`, which is the same
condition record 47 waits on. Until then the ladder is two rungs, and the pane is the user's.
