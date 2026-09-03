---
name: playwright-e2e-authoring
description: >
  Author a persistent, version-controlled Playwright end-to-end test file from
  scenarios already validated interactively, so they can be committed and re-run
  in CI instead of only existing as one-off evidence.
  Use when: a validated scenario should become a permanent regression test,
  adding lasting E2E coverage for a feature or bug fix, turning an interactive
  Playwright MCP session into a checked-in test file.
---

# Playwright E2E Test Authoring

## Purpose

`playwright-validation` drives the browser interactively via the Playwright MCP
server and produces evidence (screenshots/recordings) for a single session — it
does not leave behind a reusable test. This skill takes scenarios that have
already been validated that way and turns them into a durable Playwright test
file that lives in the repository and can be re-run in CI on every change.

Use this skill only after a scenario has been interactively confirmed to pass —
authoring a test from an unvalidated scenario just encodes a guess.

## Inputs

- The confirmed scenario(s) to codify (from `feature-test-from-issue` or an
  interactive `playwright-validation` session), including the steps, assertions,
  and selectors that were used or observed to work.
- Repository location for E2E tests (detected automatically where possible; ask
  the user if ambiguous or absent).

## Workflow

### 1. Confirm What to Codify

1. Identify the exact scenario(s) to turn into a test, and the concrete
   steps/assertions/selectors validated during the interactive session.
2. Do not invent assertions that were not actually exercised — only codify what
   was observed to pass.

### 2. Detect Existing Test Conventions

3. Search the repository for an existing Playwright test project: `playwright.config.*`,
   an existing `tests/e2e`, `e2e/`, or similar directory, existing spec file naming
   patterns (e.g. `*.spec.ts`), and any page-object or fixture patterns already in
   use.
4. Follow existing conventions exactly (language, test runner APIs, fixtures,
   page objects, naming). Do not introduce a parallel structure.
5. If no Playwright test project exists yet, ask the user before scaffolding one
   (language/framework, directory, and whether to add it to CI) — do not assume
   this is wanted.
6. Search for existing tests covering the same flow first; extend an existing
   spec file instead of duplicating coverage where reasonable.

### 3. Author the Test

7. Write one test (or one test per scenario) using stable selectors — prefer
   role-based or `data-testid` locators discovered during the interactive
   session over brittle CSS/XPath selectors.
8. Map each acceptance criterion or repro step 1:1 onto a `Given`/`When`/`Then`
   equivalent structure in the test body (setup → actions → assertions) so the
   test's intent stays traceable back to its source scenario.
9. Add comments only where the mapping to the source scenario/issue is not
   obvious from the test name and structure alone.

### 4. Verify the Authored Test

10. Run the newly authored test file locally (e.g. `npx playwright test <file>`)
    and confirm it passes before considering the task done.
11. If it fails, treat this as a signal the interactive validation and the
    authored test disagree — investigate before declaring success; do not loosen
    assertions just to make the test pass.

### 5. Report

12. Report the file(s) created or modified, the scenario(s) each test covers, how
    to run them locally, and whether/how they are wired into CI.

## Output

- One or more committed Playwright spec files under the repository's existing
  (or newly agreed) E2E test directory.
- Confirmation that each authored test passes locally.
- A short summary mapping each test back to its source scenario/issue.

## Constraints

- Never author a test for a scenario that has not been interactively validated
  first.
- Never introduce a new test framework/tooling choice without explicit user
  approval — follow existing repository conventions.
- Do not duplicate existing coverage; extend or reference existing specs instead
  where practical.
- Keep this skill's output (durable test code) separate from `playwright-validation`'s
  output (one-off evidence) — do not treat evidence screenshots as a substitute
  for an authored, re-runnable test, or vice versa.

## Related Skills

| Skill | When to use |
|---|---|
| `playwright-validation` | Interactively validate a scenario before codifying it here |
| `feature-test-from-issue` | Derive the scenario(s) to codify from a GitHub issue or Jira ticket |
| `aspire-run` | Start the app locally to verify the authored test still passes |
