---
name: phase-resolution
description: How the flow-runner turns a phase's entry in the phases map into the way the phase runs — the lookup order per field, what inherit means, the three ways a phase runs (inline, delegated, fork), and the effort runners.
---

# Phase Resolution

The flow-runner resolves every phase once, before `start_run`, from the effective
configuration `tools/stack-config/check.mjs --print` returns — the overlays are already merged
there, field by field, the overlay winning. Record what it resolved with `set_run_context`
(`runContext`), so a resumed session reads it back instead of resolving again. The map's shape
is **Phases** in `engine-contract.md`.

## Lookup order

Each field — `agent`, `skill`, `model`, `effort`, `mcp` — resolves on its own, most specific
first, stopping at the first that sets it:

1. `<flow> › <phase>:<qualifier>` — `flow-spec › phase-drafting:design`
2. `<flow> › <phase>` — `flow-spec › phase-drafting`
3. the session

Nothing crosses flows. `inherit` on `model` or `effort` stops the lookup at the session: an
overlay uses it to cancel a team default, a qualifier entry to cancel its bare entry's. An
`agent` of `null` forces the phase inline.

Name a model by alias — `opus`, `sonnet`, `haiku`, `fable` — which tracks the current release
of that family; a full model id is allowed and goes stale. An alias the session cannot use falls
back to the session's model, and the stage output says so.

## Three ways a phase runs

| When | How it runs |
| --- | --- |
| The map sets none of `agent`, `model`, `effort`, and the phase skill has no `context: fork` | **Inline**, in the owner session, on its model and effort |
| The map sets none of the three, and the phase skill has `context: fork` | **Fork**: the skill runs as a sub-agent with its own frontmatter defaults — its agent, model, and effort — and the brief file below as its argument |
| The map sets any of the three | **Delegated**: an `Agent` call to the named agent, or `general-purpose`, with the resolved model, told to follow the phase skill's body rather than invoke it, so nothing forks twice. An effort that differs from the skill's own default goes through an effort runner, below |

Personal Validation and the ready check always run inline with the flow-runner and resolve
nothing. A phase run inline runs on the session's model whatever any table says: the `model`
parameter on an `Agent` call is the only place a resolved model takes effect, which is why
setting one makes the phase delegated.

**A fork or a delegated phase gets a brief, never the conversation.** The flow-runner writes
`<phase>-brief.md` into the run folder — what to read, the scope record's chapter list, and for
a fix round the blockers — and passes its path. The skill's `## Context` contract says what it
may load; it refuses a brief that asks for more. Every sub-agent works in the owner's worktree,
per **Sub-Agent Constraints** in `flow-execution-model.md`.

## Effort runners

A sub-agent call can set a model but not an effort; effort is only read from an agent's or a
skill's frontmatter. So `delivery` ships `runner-low`, `runner-medium`, `runner-high`,
`runner-xhigh`, and `runner-max`, each carrying `effort:` and `model: inherit` and no tool
restriction. A delegated phase whose effort overrides its skill's default runs as
`delivery:runner-<effort>`, with the resolved model and the named agent's body — or the phase
skill's body, with no agent named — passed as its instructions.

- **The specialist's tool list is dropped.** The runner keeps the agent's instructions and
  gets the runner's tools, all of them. A specialist that needs its own list kept declares its
  own effort, and the phase then leaves `effort` unset.
- **Claude Code only.** Copilot ships no runner: it runs an effort-set phase on the session's
  effort, and the run says so once.

## The retired model table

The 1.13.0 model categories and the personal `model-selection.md` are gone: a model is a
phase's `model` field, committed as a team default or overlaid as your own. The `model-override`
slot still names where an old file lives, so `devbook-config:local` can convert it into
`phases` entries in your user overlay; resolution never reads it.
