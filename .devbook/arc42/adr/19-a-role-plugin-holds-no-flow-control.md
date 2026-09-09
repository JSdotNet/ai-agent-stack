# 19. A Role Plugin Holds No Flow Control

```meta
date: 2026-09-04
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md#role", ".devbook/domain/plugin-authoring/domain.md#gate", ".devbook/arc42/05-building-block-view.md#roles-and-services", ".devbook/arc42/adr/9-the-point-set-is-closed.md"]
```

A specialist filling a [role or a service](../05-building-block-view.md#roles-and-services)
contributes expertise and artifacts. It
does not sequence stages, hold gates, spawn sessions, or delegate to other agents. Those belong
to whatever consults it.

The ported plugins each arrived carrying all four. Every one had an
`agent-handoff.instructions.md` defining a mandatory propose-approve-handoff sequence with a
compliance checklist; each agent carried `create_session`, `send_session_message`,
`respond_to_session_plan`, `Agent`, and `SendMessage`; and each agent body ran a
gather, plan-with-review-checkpoints, execute-after-approval loop of its own.

Three reasons that had to go, and only the first is about tidiness:

**A gate a plugin owns cannot be governed.** Configuration may add a gate anywhere and may
never remove one — the asymmetry that makes gates safe is that adding a checkpoint can only
make a flow more conservative. A gate written into a specialist's instruction file is outside
that mechanism in both directions: a repository cannot remove it, and the engine cannot count
it. Personal Validation stops being the mandatory instance of one pattern and becomes one of
several unrelated approval prompts.

**Two sequencers disagree.** A flow already decides what runs when, what a stage returns, and
whether the human sees it. A specialist that also plans, checkpoints, and waits for approval
either duplicates that or contradicts it, and the failure is silent: the run looks like it is
progressing while two things arbitrate the same decision.

**Session spawning in a role is fan-out through the back door.** `fleet` exists precisely
because a flow may never split across sessions, and the mechanism was put in a separate plugin
so the reach would be impossible rather than discouraged. A role agent holding `create_session`
puts it back one tool call away from every flow that must not use it.

What stays is the part that is not control: an agent names its handoff targets in prose, since
both hosts need that and Claude reads nothing else. It says a handoff is warranted and why.
Whether that needs approval, and what happens to the artifact in between, is the caller's.

Consequence: **a specialist used bare is less guided than it was.** Run an architecture agent
outside any flow and nothing prompts for approval before it writes. That is the honest trade —
the guidance was never enforceable anyway, since an instruction file is a prompt and not a
mechanism, and pretending otherwise is what made two of them contradict the assets shipped
beside them. A repository that wants a checkpoint adds a gate, which the engine can see.

**Completed, 2026-09-05.** The change that recorded this cleaned three agents and left five,
none of them carrying a spawning or delegation tool or holding an approval question. Those
five [left the marketplace](24-the-specialists-leave-the-marketplace.md) on 2026-09-07;
`tools/check-assets.mjs` still fails on any non-runner plugin's agent that carries one, which
now guards assets added later rather than any shipping today.
