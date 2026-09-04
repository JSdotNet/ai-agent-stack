---
name: deployed-environment-validation
description: >
  Validate a feature or bug fix with Playwright against a specific already-deployed
  test environment (e.g. staging, QA, UAT) instead of an app started locally via
  Aspire.
  Use when: testing against a deployed staging/QA/UAT environment, validating a
  release candidate before promotion, running smoke or regression checks against
  a specific environment URL rather than a local run.
---

# Deployed Environment Validation

## Purpose

Adapt the `qa` agent's Aspire + Playwright workflow to point at a named, already
running environment instead of starting the app locally. Use this when the thing
under test is not `aspire run` on the current machine but a deployed environment
someone else (or a pipeline) already stood up — for example validating a feature
on staging before it is promoted, or re-running a regression check against QA
after a deploy.

## Inputs

- **Environment name** (e.g. `staging`, `qa`, `uat`) and its **base URL** —
  confirm explicitly with the user; never guess or assume a URL.
- Any credentials needed to reach the environment. Never hardcode secrets in
  scenarios, reports, or committed files — reference an environment variable or
  the user's existing secret manager/credential store instead.
- Whether the environment exposes a reachable Aspire dashboard/MCP endpoint for
  remote log/trace/metric access (optional — not all deployed environments do).

## Workflow

### 1. Confirm the Target Environment

1. Ask the user (if not already given) which environment to validate against and
   its base URL.
2. Confirm this is the intended environment before testing — testing the wrong
   environment (e.g. production instead of staging) is a serious mistake.

### 2. Check Environment Health

3. Verify basic reachability of the environment (a health endpoint, status page,
   or a simple navigation) before running any scenario.
4. If the environment is unreachable or unhealthy, stop and report this rather
   than proceeding with scenarios that will only produce noise.

### 3. Skip Local Startup

5. Do not apply `aspire-run` — the app is already running in the target
   environment. Resolve the endpoint(s) needed for Playwright directly from the
   confirmed base URL instead of from a local Aspire resource.

### 4. Monitor Logs (Best Effort)

6. If the environment exposes a reachable Aspire dashboard/MCP endpoint, apply
   `aspire-log-monitor` against that remote endpoint for the duration of testing,
   the same as for a local run.
7. If no such endpoint is available, log/trace monitoring is out of scope for
   this skill — proceed using Playwright console/network evidence only, and
   clearly note in the report that Aspire log monitoring was not available for
   this environment. For deeper observability needs, recommend a handoff to the
   `csharp-coding` plugin's `sre` skill instead of trying to access production
   logging systems directly from here.

### 5. Validate with Playwright

8. Apply `playwright-validation` (with `playwright-screenshot`/`playwright-recording`
   for evidence) against the confirmed environment URL, exactly as for a local
   run.
9. Prefix or tag all captured evidence and report entries with the environment
   name so results from different environments are never confused.

### 6. Respect Shared-Environment Constraints

10. Treat the environment as shared state: do not perform destructive or
    irreversible actions (data deletion, account creation with real-looking data,
    configuration changes) without explicit user confirmation, since other users
    or automated jobs may depend on the environment's current state.
11. Prefer read-only or clearly reversible scenarios where the environment's
    purpose is ambiguous; ask the user before anything destructive.

## Output

- A QA report clearly labeled with the target environment name.
- Evidence stored under `.wip/qa/<feature-name>/<environment>/` unless the user
  specifies another location.
- An explicit note on whether Aspire log/trace monitoring was available for this
  environment, and if not, what evidence was used instead.

## Constraints

- Never assume or infer an environment URL — always get explicit confirmation.
- Never hardcode credentials or secrets in scenarios, evidence, or reports.
- Never perform destructive actions against a shared environment without
  explicit user approval.
- Do not claim Aspire log monitoring occurred when it did not — report its
  absence honestly rather than omitting it.

## Related Skills

| Skill | When to use |
|---|---|
| `playwright-validation` | Drive the browser and capture evidence against the confirmed environment |
| `playwright-screenshot` / `playwright-recording` | Evidence capture per scenario |
| `aspire-log-monitor` | Monitor logs/traces/metrics if the environment exposes a reachable Aspire endpoint |
| `feature-test-from-issue` | Derive the scenario(s) to run from a GitHub issue or Jira ticket |
| `playwright-e2e-authoring` | Turn a scenario validated here into a durable, re-runnable test |
