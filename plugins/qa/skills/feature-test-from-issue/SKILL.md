---
name: feature-test-from-issue
description: >
  Derive end-to-end Playwright test scenarios from a GitHub issue or Jira ticket
  (acceptance criteria, repro steps), then validate the feature or bug fix against
  the running app with evidence and Aspire log monitoring.
  Use when: an issue/ticket number or link is provided as the source of truth for
  what to test, validating a feature against its acceptance criteria, confirming a
  bug fix against its original repro steps.
---

# Feature Test from Issue

## Purpose

Turn a GitHub issue or Jira ticket into concrete, runnable QA scenarios instead of
guessing what to test. The issue/ticket is the source of truth for acceptance
criteria (features) or repro steps (bugs); this skill maps that content onto the
`qa` agent's existing Aspire + Playwright + monitoring workflow.

This skill does **not** contain any GitHub- or Jira-specific API calls, CLI
commands, or field mappings. Issue/ticket retrieval is always delegated to a
dedicated skill from another installed plugin (see [Fetching the Issue](#1-identify-and-fetch-the-issue-or-ticket)).

## Inputs

- Issue/ticket reference — a GitHub issue number/URL (e.g. `owner/repo#123`) or a
  Jira issue key (e.g. `PROJ-456`), or a pasted issue/ticket body if no fetch skill
  is available.
- (Optional) Which specific acceptance criteria or repro steps to focus on, if the
  issue/ticket contains more than one testable scenario.

## Workflow

### 1. Identify and Fetch the Issue or Ticket

1. Determine the source from the reference format or ask the user: **GitHub** or
   **Jira**.
2. Look for a skill from another installed plugin that can fetch the issue/ticket
   content (for example, a GitHub-issue skill in a `github` plugin, or a
   Jira-ticket skill in a `jira` plugin). Apply that skill to retrieve the
   title, description/body, acceptance criteria, labels, and (for bugs) repro
   steps.
3. If no such skill is installed or available, ask the user to paste the relevant
   issue/ticket content directly. Do not fetch issue/ticket data yourself with a
   direct API or CLI call — that belongs to the dedicated GitHub/Jira skill, not
   to this plugin.
4. Confirm with the user which acceptance criteria or repro steps to test if the
   issue/ticket contains multiple distinct scenarios.

### 2. Derive Test Scenarios

5. For a **feature**, convert each acceptance criterion into one test scenario:
   `Given <precondition> / When <action> / Then <expected result>`.
6. For a **bug**, convert the repro steps into one regression scenario (reproduce
   the original defect) plus one confirmation scenario (verify the fix holds and
   no adjacent regression was introduced).
7. Present the derived scenario list to the user for confirmation before running
   any test — scenario derivation can be wrong or incomplete.

### 3. Run and Monitor the App

8. Apply the `aspire-run` skill to start the app and confirm all resources are
   healthy.
9. Apply the `aspire-log-monitor` skill (or hand off via `delegate-to-qa-monitor`)
   to keep Aspire log/trace/metric monitoring active for the whole session.

### 4. Execute Scenarios with Playwright

10. Apply the `playwright-validation` skill to execute each confirmed scenario
    against the running app, using `playwright-screenshot` for point-in-time
    evidence and `playwright-recording` for multi-step flows.
11. Capture evidence per scenario and cross-check each result against the Aspire
    log/trace stream from step 9.

### 5. Report Against the Source Issue/Ticket

12. Produce a QA report mapping each derived scenario back to its originating
    acceptance criterion or repro step, with Pass/Fail/Flaky status, evidence
    paths, and Aspire findings.
13. If the user wants the result posted back to the issue/ticket (e.g. a comment
    or status update), do not do this directly — recommend a handoff to the
    relevant GitHub or Jira skill (with explicit user approval) to perform the
    update.

## Output

- A confirmed list of test scenarios derived from the issue/ticket.
- A QA report (see `qa.agent.md` report format) with each scenario traced back to
  its source acceptance criterion or repro step.
- Evidence and report stored under `.wip/qa/<feature-name>/` unless the user
  specifies another location.

## Constraints

- Never hardcode GitHub or Jira API endpoints, CLI commands, or authentication in
  this skill — always delegate fetch/update operations to a skill from the
  relevant plugin, and fall back to asking the user for pasted content when no
  such skill is installed.
- Do not run tests against scenarios that have not been confirmed by the user in
  step 7.
- Do not mark a scenario as validated without both Playwright evidence and an
  Aspire log/trace check, per the `qa` agent's constraints.

## Related Skills

| Skill | When to use |
|---|---|
| `aspire-run` | Start (and confirm healthy) the app under test |
| `aspire-log-monitor` / `delegate-to-qa-monitor` | Continuous Aspire log/trace/metric monitoring |
| `playwright-validation` | Execute the derived scenarios against the running app |
| `playwright-screenshot` / `playwright-recording` | Evidence capture per scenario |
| A GitHub-issue skill (from an installed GitHub plugin) | Fetch or update a GitHub issue |
| A Jira-ticket skill (from an installed Jira plugin) | Fetch or update a Jira ticket |
