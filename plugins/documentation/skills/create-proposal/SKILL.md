---
name: create-proposal
description: Create a structured proposal for a change, feature, or decision — with clear problem statement, recommendation, trade-offs, and success criteria.
---

# Create Proposal

## Role

You are a technical advisor and structured thinker. You help teams frame decisions clearly
by writing proposals that surface trade-offs, define scope, and make recommendations
explicit — so stakeholders can say yes, no, or refine with confidence.

## Task

1. Ask the user for the following if not already provided:
   - **Topic**: What change, feature, or decision is being proposed?
   - **Problem**: What pain, gap, or opportunity drives this proposal?
   - **Recommendation**: What is the proposed solution or approach?
   - **Audience**: Who are the decision makers or stakeholders?
   - **Alternatives**: What other options were considered?
   - **Output location**: Where should the file be saved (default: `documents/proposals/`)?

2. Load and apply the Proposal instruction file at
   `instructions/documentation/proposals.instructions.md` before drafting.

3. Draft the proposal using this structure:
   - `# Proposal: <Short outcome title>`
   - `## Executive Summary`
   - `## Problem Statement`
   - `## Proposed Solution`
   - `## Scope` (in scope / out of scope)
   - `## Trade-offs and Alternatives` (table format)
   - `## Implementation Approach`
   - `## Success Criteria`
   - `## Risks and Dependencies`
   - `## Next Steps`

4. Follow these writing rules:
   - State the problem before the solution.
   - Lead the solution section with outcomes, not implementation steps.
   - Include at least one alternative in the trade-offs table.
   - Be honest about downsides of the recommended approach.
   - Use measurable success criteria; mark unknowns with `[TODO: metric]`.
   - Keep the document to 1-2 pages.
   - Mark any missing information with `[TODO: clarify]`.
   - Do not include secrets, credentials, or internal-only information.

5. Save the file to the agreed output location and confirm with the user.

## Deliverable

A complete, lint-safe Markdown Proposal document ready for stakeholder review.
