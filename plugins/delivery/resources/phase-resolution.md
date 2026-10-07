---
name: phase-resolution
description: How the flow-runner turns a phase's entry in the phases map into the way the phase runs — the lookup order per field, what inherit means, the three ways a phase runs (inline, delegated, fork), and the effort runners.
---

# Phase Resolution

The flow-runner resolves every phase once, before `start_run`, from the effective
configuration `tools/stack-config/check.mjs --print` returns — the overlays already merged,
field by field, the overlay winning. Record the result with `set_run_context` as
`runContext.phases`, one resolved entry per stage in the shape `surface-contract.md` states,
so a resumed session reads it back instead of resolving again and a viewer shows how each
phase runs. The configured map's shape is **Phases** in `engine-contract.md`.

## Lookup order

Each field — `agent`, `skill`, `model`, `effort`, `mcp` — resolves on its own, most specific
first, stopping at the first that sets it:

1. `<flow> › <phase>:<qualifier>` — `flow-spec › phase-drafting:design`
2. `<flow> › <phase>` — `flow-spec › phase-drafting`
3. the session

Nothing crosses flows. `inherit` on `model` or `effort` stops the lookup at the session: an
overlay uses it to cancel a team default, a qualifier entry to cancel its bare entry's.

Name a model by alias — `opus`, `sonnet`, `haiku`, `fable`; a full model id is allowed and goes
stale. An alias the session cannot use falls back to the session's model, and the stage output
says so.

## Three ways a phase runs

| When | How it runs |
| --- | --- |
| `agent` is `null` | **Inline**, in the owner session, on its model and effort |
| The entry sets none of `agent`, `model`, `effort` | The phase's **Runs by default** in the **Phases** table of `engine-contract.md`: inline; **fork**, for a skill with `context: fork` — a sub-agent on the skill's own frontmatter defaults, the brief file as its argument; or **delegated** to `general-purpose` on the session's model |
| The entry sets any of the three | **Delegated**: an `Agent` call to the named agent, or `general-purpose`, with the resolved model, told to follow the phase skill's body rather than invoke it, so nothing forks twice. An effort other than the skill's own default goes through an effort runner, below |

Personal Validation and the ready check always run inline and resolve nothing. A resolved model
takes effect only as the `model` of an `Agent` call, which is why setting one delegates.

**A fork or a delegated phase gets a brief, never the conversation.** The flow-runner writes
`<phase>-brief.md` into the run folder — what to read, the scope record's chapter list, and for
a fix round the blockers — and passes its path. The run folder is `runs/<runId>/` under the
surface's `stateDir`, or the host's scratch directory with no surface bound; never the
worktree. The skill's `## Context` contract says what it may load; it refuses a brief that asks
for more. Every sub-agent works in the owner's worktree, per **Sub-Agent Constraints** in
`flow-execution-model.md`.

## Effort runners

A sub-agent call sets a model but not an effort, which only an agent's or a skill's frontmatter
carries. So `delivery` ships `runner-low` through `runner-max` in `runners/`, each with
`effort:`, `model: inherit`, and no tool restriction. A delegated phase whose effort overrides
its skill's default runs as `delivery:runner-<effort>`, with the resolved model and the named
agent's body — or the phase skill's — as its instructions. The specialist's tool list is
dropped: one that needs it kept declares its own effort, and the phase leaves `effort` unset.
Only the Claude manifest lists `runners/`; Copilot runs an effort-set phase on the session's
effort and says so once. The 1.13.0 model table is retired; `devbook-config:local` converts the
old `model-selection.md` the `model-override` slot locates into overlay `phases` entries;
resolution never reads it.
