# delivery

The host-neutral delivery engine. It carries a unit of work from a request to a validated,
review-ready change — delivery in the continuous-delivery sense, stopping short of deploy.

## Installation

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then enable `delivery` with `/plugin`. During development, add this working copy by path
instead of by repository.

## What is in it

| Kind | Members |
|---|---|
| `flow-*` (16) | A staged procedure for one category of work, run start to finish in **one** session, ending at the Personal Validation gate: `flow-feature`, `flow-bug`, `flow-structure`, `flow-create-module`, `flow-create-service`, `flow-create-mvp`, `flow-update-packages`, `flow-aspire-update`, `flow-project`, `flow-repo`, `flow-arc42`, `flow-domain`, `flow-tech`, `flow-design`, `flow-ai`, `flow-fallback` |
| `phase-*` (2) | A shared step inside a flow, invoked by a flow and never directly: `phase-build-test`, `phase-qa-validation` |
| The pull-request lane (4) | `fix-pr-checks`, `pr-merge-ready`, `push-branch`, `update-pr-branch` — raising a PR is the host's own action or `gh pr create`, not a skill |
| Pickup (2) | `start-session-from-issue`, `azure-sre-to-github-issue` |
| Agent | `flow-runner` — the sequencer, tracker, and gatekeeper |

Five of the flows are named after a devbook folder — `.arc42`, `.domain`, `.tech`,
`.design`, `.ai` — and carry a chapter change the same way the others carry a code change.
They own the procedure and none of the rules: what a chapter must look like comes from the
instruction files the repository keeps for the folder and the check it ships, which the
`devbook` plugin materializes and this plugin never names. A folder flow in a repository that
has not adopted the folder stops and says so.

[FLOW-DIAGRAMS.md](FLOW-DIAGRAMS.md) draws every flow: stage order, where the approval gate
sits, and where each one hands off to a pull request. It is the overview the `SKILL.md` files
deliberately leave out, so they can stay execution rules.

A flow never leaves its session. Fan-out across sessions and worktrees — triage a backlog,
spawn workers, aggregate results — is a different subsystem and lives in the `fleet` plugin.
Work that runs with nobody watching — the `schedule-*` entry points and the triggers that fire
them — is another, and lives in `delivery-schedule`.

## How a repository shapes a flow

Three things, and only three, and none of them is a stage definition.

**Extension points.** The point set is closed and declared by the engine. Six are
**services** — exactly one provider, returning a result the flow acts on: `spec`,
`implement`, `verify`, `app.start`, `qa.run`, `deliver`. Five are **chores** — zero or more,
in declared order, contributing side effects and a report and never changing a decision:
`session.start`, `flow.start`, `data.prepare`, `docs.update`, `flow.end`.

**Gates.** A gate presents the output of the point it attaches to and asks a question, with
three outcomes: `approve` continues, `revise` re-runs that point with the human's notes, and
`decline` blocks the stage. Configuration may add a gate anywhere; it may never remove one or
hand one to a plugin. Personal Validation is the mandatory instance of that pattern, not a
separate mechanism. `spec → gate → implement` is the highest-value one to turn on.

**Bindings and policy.** Which plugin fills each role, which tracker the repository uses,
which MCP servers each extension point uses, and a closed set of switches — QA depth and its ceiling, the verify retry budget, the gate revise
budget, whether the flow commits its change set at each handback, whether a pull request is
required.

All four live in `.devbook/config.json`:

```json
{
  "extensions": {
    "implement": "your-coding-plugin:coding",
    "data.prepare": [{ "run": "repo:seed-test-data", "on-failure": "required" }]
  },
  "gates": [{ "at": "spec", "when": "after", "purpose": "approval", "show": "artifact" }],
  "policy": { "qa.depth": "targeted", "verify.retryBudget": 2 },
  "bindings": {
    "delivery.tracker": { "provider": "github" },
    "delivery.mcp": { "spec": ["your-guidelines-server"] }
  }
}
```

Copy `resources/config-template.json` and validate with
`node tools/stack-config/check.mjs`. An unknown key is rejected, not ignored: a typo must
never become a silently absent setting.

**Configuration chooses among behaviour the engine already implements; it never introduces
new behaviour.** A stage is a prompt, not a program — "apply TDD", "escalate instead of
continuing when the request needs a new architectural decision" — and encoding that as JSON
either drops the prose or buries paragraphs in strings. A repository that genuinely needs a
different flow shape writes a repo-native `flow-*` skill, which takes precedence for the
categories it covers.

## What it never depends on

- **Specialist plugins.** An architecture, QA, coding, domain, UX, or docs specialist is
  bound as a role or a service per repository, never declared as a dependency — one missing
  specialist must not demote all 24 skills. The engine names no specialist and none of them
  is published from this marketplace. The reverse holds too: no specialist ever learns about
  `delivery`.
- **A tracker.** GitHub, Jira, or `.backlog/` chapters, whichever `delivery.tracker` names.
  Unbound, a flow runs to its file artifacts and opens nothing.
- **A surface.** A dashboard, a canvas, and a headless collector are three implementations of
  one capability, resolved by pattern from the live tool list. **No surface bound is a normal
  outcome:** produce the file artifacts, say so once, never block a stage.
- **A host.** A shared skill names a *slot* — `repo-instructions`, `repo-flow-context`,
  `model-override`, `stage-delegation`, `surface`, `pr-lane` — which a repository may bind,
  or which takes its documented unbound default. A slot is bound, never branched.

## Files

| Path | Holds |
|---|---|
| `FLOW-DIAGRAMS.md` | Stage order, gates, and handoff points for every flow — read by people, loaded by no host |
| `agents/flow-runner.agent.md` | The one agent: sequences the phases, resolves the config, enforces the gate |
| `rules/flow-phases.md` | Which phases each tier runs, and the opening and closing phases in full |
| `rules/surface-contract.md` | Extension points, gates, the stack config, host slots, and the surface capability |
| `rules/flow-execution-model.md` | Session ownership, delegation order, sub-agent constraints, session handoff |
| `rules/flow-model-selection.md` | Category → model resolution and the personal override |
| `rules/flow-repo-context.md` | The optional `.claude/flow-context.md` runtime convention |
| `resources/config.schema.json` | The four engine-owned keys, as a schema |
| `resources/config-template.json` | A filled-in starting point to copy |
| `resources/flow-context-template.md` | A filled-in `.claude/flow-context.md` to copy |
| `tools/stack-config/check.mjs` | Validates a repository's stack config; `node --test` covers it |
