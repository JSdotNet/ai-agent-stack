---
name: phase-personal-validation
description: 'Shared Personal Validation review handoff for every flow-* flow. Brings the application up, publishes the review links as clickable URLs, says what to check by hand, and presents the ready check''s open items, the code review, the QA review, and the spec-check table with its chapter edits. Runs again on every revise round. It presents and never decides — the mandatory approval gate stays with the flow-runner. Invoked inline by the flow-runner agent, never configured.'
---

# Phase: Personal Validation — The Review Handoff

Open the reply with `delivery@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

**Does**

- Starts the app, publishes the review links and a short what-to-check list
- Presents the review, QA and spec-check results, then waits
- Commits the change set when `commit.at` is `gate`

**Doesn't**

- Approve, or let anything approve for you
- Take a phases entry
- Run without a person (it parks)

It answers one question for the person the run hands back to: *what do I open, and what am I
looking for?* The approve / revise / decline gate that follows belongs to the `flow-runner`
agent and to **The gate** in `resources/flow-phases.md` — the recorded decision, the commit
rule, and parking an unattended run live there. Nothing here can approve, skip, or soften it.

## When To Run

- **Both flows**, after the ready check: in `flow-code` after Verify and Spec Check, in
  `flow-spec` after Check & Review.
- **Again on every revise round.** A revised change set is a new thing to look at: re-run this
  whole skill rather than pointing back at the previous handback.
- **Inline, in the owner session, never configured.** No agent and no model — the links have to
  be clickable in the conversation the person is reading. A `phase-personal-validation` key in
  any `phases` map is refused.

## Step 1 — Make Sure It Is Actually Running

A link to a process that is not listening is worse than no link.

- **Reuse the instance Verify left running** when there is one. Start a second only after
  confirming the first is gone.
- **Otherwise start it** with the provider `phase-verify.app` names — the repository's `run`
  recipe when unset — or the command Verify proved this run. **Never hand the person a command
  to run themselves**: starting it is this phase's job.
- **Confirm health before publishing anything**, against the repository's `## Healthy`
  signals: the resources that must reach running, the health endpoints, the log lines that mean
  ready. Do not report its declared benign warnings as failures.
- **On a repeat pass, refresh over restart** where the repository's startup mode supports it,
  per **Reverifying After Requested Changes** in `skills/phase-verify/SKILL.md`. Record which
  one happened, and re-check the URLs — they move on a restart.
- **Startup failure blocks the phase.** Report the actual error and the recovery command; never
  hand back a review the person cannot perform.
- **Nothing to start** — a `flow-spec` run, or `phase-verify.app` set to `null` — skips the
  startup and the links, says so in one line, and goes to Step 3 over the changed files.

## Step 2 — Publish The Links

- **Both places, every time.** Pass them as `links` on the stage so the surface renders
  buttons, **and** write them as clickable URLs in the conversation.
- **Deep-link to what changed** — the route, page, or endpoint the change set touches, not the
  site root. **Then the supporting ones:** the runtime dashboard, the health endpoint, any second
  surface the change reaches.
- **Label each one** with what it is for, in the person's terms.
- **Publish nothing unconfirmed.** Every URL here was reachable in Step 1.

## Step 3 — Say What To Check

When the `show-me` skill is available, write this step and Step 4 per that skill. A short
numbered list, each item naming **where to look, what to do, and what should happen.**

- **Derive it from the scope's acceptance criteria and the change set**, not from what QA
  already drove — QA's result is presented in Step 4.
- **Lead with what QA cannot judge** — layout, copy, spacing, tone, whether it is usable at all.
- **Name the non-obvious blast radius**: a migration that ran, a changed default, a shared
  component another screen also uses.
- **Keep it to a few minutes.** What will not fit belongs in the automated suite.
- **For a `flow-spec` run, or a chapter Spec Check edited**, list the chapters by path and the
  specific claim in each one to read for.

## Step 4 — Present The Results

In this order:

1. **The ready check's open items**, when it handed the run over with its budget spent — every
   one, first, with what recorded it. Then its questions: the `code-ahead` and `unresolved`
   Spec Check rows.
2. **The code review**: `review.md` from `phase-review` — blockers open, blockers fixed,
   advisories, each with its citation. When review was off or did not run, say so.
3. **The QA review** when Verify ran: the scenarios in order, each with its pass/fail and its
   evidence, then the monitoring findings. When it was skipped, say so and why — never imply a
   result that was not produced.
4. **The spec-check table** from `phase-spec-check`, and every chapter it edited, listed beside
   the code. A rejected chapter edit reopens Spec Check, per **The gate**.

**Show image evidence; never only list it.** Display every screenshot, and every frame of a
per-step sequence, inline under its scenario's pass/fail, through whatever file or image display
the host offers — reading an image into your own context shows the person nothing. Only when the
host cannot display images, give each path as a clickable link and say once why. A video, a
trace, or a log extract stays a clickable path.

## Step 5 — Commit, Then Hand Back

When `policy.commit.at` is `gate`, commit the change set before handing back, per **The gate**
in `resources/flow-phases.md`; under `manual`, commit nothing. Then stop and wait. In an
unattended run there is no one to hand back to: park per **The gate**, `approval` left
`pending`.

## Outputs

- A running application with confirmed health, a `blocked` result naming the startup failure
  and the recovery command, or the recorded reason there was nothing to start.
- The labelled review links, in the stage's `links` and in the conversation.
- The what-to-check list and the four results of Step 4.

## Dashboard Reporting

Report as the `Personal Validation` stage via the **Reporting Contract** in
`resources/surface-contract.md`, passing `links` for the started application and every review
target. The flow-runner owns the `approval` values recorded with `set_run_context`.

## Reference

Gate contract and the recorded decision: **The gate** in `resources/flow-phases.md`.
Runtime facts: the repository's `run` recipe at `.claude/skills/run-<name>/SKILL.md`.
Refreshing on a repeat pass: `skills/phase-verify/SKILL.md`.
