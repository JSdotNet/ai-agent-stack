---
applyTo: '.github/workflows/*.yml,.github/workflows/*.yaml'
description: Dedicated rules for creating and refining GitHub Actions workflow files.
---

# Create Workflow Instructions

## Purpose

- Standardize authoring of `.github/workflows/*.yml` assets planned, built, and reviewed through the spec workflow.
- Enforce security-first defaults so generated workflows are safe to merge without a separate hardening pass.
- Keep workflow scope explicit and traceable back to an approved plan.

## When To Apply

- Apply when a request asks to create, extend, or harden a GitHub Actions workflow file.
- Apply when a plugin composition requires CI/CD automation as part of its asset set.

## Required Structure

1. Descriptive workflow file name (e.g. `build-and-test.yml`, `deploy-production.yml`).
2. Explicit `name` key.
3. Explicit `on` triggers; avoid triggering on all events by default.
4. Workflow-level `permissions` block.
5. One or more `jobs` with explicit `needs` ordering when jobs depend on each other.

## Security Rules

- Pin every third-party and first-party action to a full-length commit SHA with a version comment, for example `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`.
- Never reference `@main`, `@latest`, or a bare major version tag.
- Set `permissions: contents: read` at the workflow level; narrow further only at the job level when a job needs more.
- Access secrets only through `${{ secrets.<NAME> }}`; never echo or log secret values.
- Prefer OIDC authentication over long-lived credentials for cloud provider steps.
- Review `pull_request_target` triggers carefully before use; they can expose secrets to untrusted fork code.

## Structure Rules

- Use `workflow_dispatch` for workflows that benefit from manual triggering.
- Use `concurrency` to cancel stale runs on the same ref when appropriate.
- Use `outputs` to pass data between jobs instead of shared external state.
- Cache dependencies with `actions/cache` keyed on a lock file hash when the ecosystem supports it.

## Rules

- Keep each workflow scoped to one clear purpose; split unrelated automation into separate files.
- Leave runtime application code changes to the plugin that owns that code.
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning and
  the 60-line budget.
- Reference an approved plan before editing an existing workflow file.

## Validation Checklist

- [ ] File name is descriptive and placed under `.github/workflows/`.
- [ ] `on` triggers are explicit and scoped.
- [ ] Workflow-level `permissions` is present and minimal.
- [ ] All actions are pinned to a full commit SHA with a version comment.
- [ ] Secrets are only referenced via `${{ secrets.* }}` and never logged.
- [ ] `pull_request_target` usage, if present, has documented justification.
- [ ] YAML is syntactically valid.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
