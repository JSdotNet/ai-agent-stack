---
name: create-architectural-decision-record
description: 'Create an Architectural Decision Record (ADR) document for AI-optimized decision documentation.'
---

# Create Architectural Decision Record

Use this skill to produce structured ADRs with clear context, decision rationale, alternatives, and consequences.

## Trigger Conditions

Use when the user requests a decision record for an architectural choice, trade-off, or standard.

## Inputs

- Decision statement and scope
- Constraints, assumptions, and quality goals
- Candidate alternatives

## Workflow

1. Apply `instructions/adr/adr-global-instructions.md`.
2. Capture context, problem statement, and decision drivers.
3. Record selected option and rejected alternatives with rationale.
4. Document consequences, risks, and rollback/mitigation notes.
5. Link the ADR to impacted arc42 sections and related TDR entries.
6. Save as Markdown in the repository ADR location.

## Output

Create ADRs in the repository ADR location with standardized metadata and sections.
