---
applyTo: '**/proposals/*.md'
description: Rules for writing Proposals — structured suggestions for changes, features, or decisions with clear trade-offs and success criteria.
---

# Proposal Writing Instructions

## Purpose

- Apply these rules to proposal artifacts stored in `**/proposals/*.md`.
- Audience: team members, stakeholders, or decision makers who need a clear recommendation.
- Focus on structured argumentation: problem, solution, trade-offs, and measurable outcomes.

## Location and Naming

- Use filename pattern: `proposal-<short-title>.md`.
- Keep titles concise and outcome-oriented.

## Core Quality Standard

- State the problem before proposing a solution.
- Make the recommendation explicit and actionable.
- Show alternatives considered and why this approach is preferred.
- Define how success is measured.

## Required Structure (in order)

1. `# Proposal: <Short outcome title>`
2. `## Executive Summary`
3. `## Problem Statement`
4. `## Proposed Solution`
5. `## Scope`
6. `## Trade-offs and Alternatives`
7. `## Implementation Approach`
8. `## Success Criteria`
9. `## Risks and Dependencies`
10. `## Next Steps`

## Section Rules

### Executive Summary

- Max 3 sentences.
- State the problem, the recommendation, and the expected benefit.

### Problem Statement

- Describe the current pain, gap, or opportunity.
- Include impact if unresolved.
- Keep evidence-based; avoid opinion without grounding.

### Proposed Solution

- Describe the recommended approach clearly.
- Lead with outcomes, not implementation steps.
- Keep concise; detail belongs in Implementation Approach.

### Scope

- Include:

  - `In scope`
  - `Out of scope`

- Keep boundaries explicit to prevent uncontrolled growth.

### Trade-offs and Alternatives

- List at least one alternative considered.
- Explain why this proposal is preferred over alternatives.
- Be honest about downsides of the recommended approach.

### Implementation Approach

- Outline the key steps or phases at a high level.
- Avoid solution design detail unless it is needed for the decision.
- Mark unknowns with `[TODO: clarify]`.

### Success Criteria

- Use measurable outcomes where possible.
- Prefer leading indicators over lagging indicators where relevant.
- Add `[TODO: metric]` where data is not yet available.

### Risks and Dependencies

- Capture top delivery and adoption risks.
- Capture cross-team or external dependencies.

### Next Steps

- Choose one clear path:

  - Approve and begin implementation
  - Refine with stakeholder input
  - Request further analysis
  - Reject and document reasoning

## Conciseness Rules

- Target 1-2 pages per proposal.
- Keep paragraphs short (2-3 sentences max).
- Use bullets for comparisons and one-line items.
- Remove background that does not influence the decision.

## Proposal Readiness Check

- [ ] Problem and impact are clear.
- [ ] Recommendation is explicit and actionable.
- [ ] At least one alternative is considered.
- [ ] Scope boundaries are explicit.
- [ ] Success criteria are measurable or marked TODO.
- [ ] Risks and dependencies are visible.
- [ ] Next step is unambiguous.

## Proposal Template

```md
# Proposal: <Short outcome title>

## Executive Summary

<3-sentence summary: problem, recommendation, and expected benefit.>

## Problem Statement

<Describe the current pain, gap, or opportunity and its impact.>

## Proposed Solution

<Describe the recommended approach and expected outcomes.>

## Scope

- In scope:
  - <item>
- Out of scope:
  - <item>

## Trade-offs and Alternatives

| Option | Pros | Cons |
|--------|------|------|
| This proposal | <pro> | <con> |
| Alternative A | <pro> | <con> |

## Implementation Approach

1. <Step or phase>
2. <Step or phase>
3. [TODO: clarify remaining steps]

## Success Criteria

- <Measurable outcome>
- [TODO: metric]

## Risks and Dependencies

- Risk: <item>
- Dependency: <item>

## Next Steps

- <Approve | Refine | Analyse further | Reject>
```
