---
name: delegate-to-qa-monitor
description: 'Delegate continuous Aspire log/trace/metric monitoring to the qa-monitor agent from within the qa agent. Use this when a QA session benefits from a dedicated monitoring persona instead of interleaving monitoring calls with browser interaction.'
---

# Delegate to QA Monitor Agent

Use this skill to hand off continuous observability duties to the `qa-monitor` agent
from within the `qa` agent, so log/trace monitoring gets undivided attention instead of
being squeezed between Playwright steps.

## Check Monitoring Ownership First

Before delegating at all, establish who owns monitoring for this session (see the `qa`
agent's **Invocation Context**). If the caller already started `qa-monitor` — as a background
sub-agent, or as a parallel child session — monitoring is **caller-owned**: do not start a
second monitor, and do not apply this skill. Send that monitor scenario checkpoints instead,
and leave stopping it and collecting its summary to the caller.

This skill applies only when monitoring is yours. Whoever starts a monitor stops it: a
monitor started from inside the `qa` agent cannot be ended by the caller, so end it yourself
before the session finishes rather than leaving it polling.

## When to Delegate

Delegate to the `qa-monitor` agent when:

- The test session is long or has many scenarios, making interleaved monitoring calls
  easy to skip under time pressure.
- The user asks for "more extensive testing" with many scenarios in one session.
- Monitoring quality matters as much as UI validation (e.g. investigating an
  intermittent backend error, not just a UI regression).

For short, single-scenario checks, the `qa` agent may instead apply the
`aspire-log-monitor` skill directly without delegating — delegation is an optional
persona split, not a hard requirement.

## Important Limitation — Same-Session Handoff Only

Delegating via this skill and the standard `agent` tool switches the **active agent
persona within the current session**. It does **not** run monitoring in a separate
process or in true parallel with Playwright interaction — the session still executes
one agent's turn at a time.

- If the QA session is running inside the GitHub Copilot App and genuine parallel
  execution is required (monitoring truly running concurrently with browser
  interaction, in a separate session), use App-level session orchestration directly
  (`create_session`/cross-session messaging), as the `delivery` plugin's `flow-feature`,
  `flow-bug`, and other flow skills do inline in the shared QA Validation phase — that
  capability is not available to a plugin agent's own tool set.
- This skill is the portable option: it works in any host that supports the `agent`
  tool (Copilot CLI, VS Code, GitHub Copilot App), at the cost of being sequential
  rather than truly concurrent.

## How to Delegate

1. Confirm the app under test is already running and healthy (`aspire-run` skill
   already applied by the `qa` agent).
2. Compose a delegation prompt using the template below.
3. **When you have a user turn**, present the prompt to the user, ask for approval before
   switching to the `qa-monitor` agent, and only switch after explicit approval.
4. **When you have no user turn** — an orchestration invoked the `qa` agent as a sub-agent or
   a child session — do not switch on your own and do not wait for an approval that cannot
   arrive. Return the composed prompt and the reason to your caller, which owns both the user
   conversation and the parallel monitoring shape its host supports, and keep applying
   `aspire-log-monitor` inline until it says otherwise.
5. Before switching back to drive the browser, ask `qa-monitor` to record its current
   baseline/status, then resume browser interaction — send it periodic checkpoint
   messages (see the `qa-monitor` agent's "Coordination" section) as scenarios progress
   if the host allows sending messages without a full context switch; otherwise, switch
   back to `qa-monitor` between scenarios to record checkpoints and check for new
   findings.

## Delegation Prompt Template

```
Agent: qa-monitor

Context:
- App under test: <resource names / AppHost path>
- Endpoint(s) already confirmed healthy: <url(s)>
- Scenarios planned: <list of scenario names>

Task:
Establish a monitoring baseline now, then continuously watch Aspire logs/traces/metrics
for the resources above. Report any new Error/Critical entries immediately. Produce a
monitoring summary when asked, correlated to the scenario checkpoints I will send you.
```

## Notes

- The `qa-monitor` agent is self-contained for monitoring: no further handoffs are
  expected from it beyond reporting back to `qa` or flagging a bug for
  `csharp-coding:coding`.
- If the `qa-monitor` agent is not installed, the handoff is declined, or there is no user
  turn in which to propose it, continue applying the `aspire-log-monitor` skill directly from
  the `qa` agent. An unmonitored session is a worse outcome than an interleaved one.
- Stop any monitor this skill started before reporting, and say in the report whether
  monitoring was self-owned or caller-owned.
