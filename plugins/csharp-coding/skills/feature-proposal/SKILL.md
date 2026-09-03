---
name: feature-proposal
description: 'Create a structured proposal for a new feature or improvement in a C# .NET codebase. Use when the user requests a new capability, enhancement, or change that requires scoping before implementation.'
---

# Feature Proposal

Create a clear, actionable proposal for a new feature or code improvement.

## Proposal Structure

Store proposals under `.wip/proposals/<feature-name>.md`.

```markdown
# Feature Proposal: <Feature Name>

## Summary

One-paragraph description of the feature and its purpose.

## Motivation

Why is this feature needed? What problem does it solve?

## Affected Areas

List the affected layers or modules:

- Domain: <yes/no — describe impact>
- Application: <yes/no — describe impact>
- Infrastructure: <yes/no — describe impact>
- API/UI: <yes/no — describe impact>
- Tests: <test changes needed>

## Proposed Approach

High-level technical approach. Include:

- New types, interfaces, or services.
- Changed public APIs.
- Dependencies (new NuGet packages, MCP services).

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests pass: `dotnet test`

## Effort Estimate

| Scope | Estimate |
|---|---|
| Small (< 1 day) | |
| Medium (1–3 days) | |
| Large (> 3 days) | |

## Assumptions and Open Questions

- Assumption 1
- Open question 1

## Out of Scope

What this proposal does NOT cover.
```

## Workflow

1. Understand the request and gather context.
2. Fill in the proposal template above.
3. Save to `.wip/proposals/<feature-name>.md`.
4. Report the proposal path to the user and ask for approval to proceed with implementation.
5. If implementation is approved, apply TDD workflow (see `tdd` skill).
