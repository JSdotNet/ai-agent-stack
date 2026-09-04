---
name: create-technical-debt-record
description: "Create a Technical Debt Record (TDR) document for tracking debt, impact, and remediation planning."
---

# Create Technical Debt Record

Use this skill to document technical debt with impact, ownership, traceability, and remediation options.

## Trigger Conditions

Use when technical debt needs to be captured, prioritized, or tracked for remediation.

## Inputs

- Debt item description and affected scope
- Impact and risk signals
- Potential remediation options

## Workflow

1. Apply `instructions/tdr/tdr-global-instructions.md`.
2. Describe the debt item, origin, and affected components.
3. Record impact across quality attributes, delivery, and operations.
4. Assign severity, owner, and target remediation window.
5. Add links to related ADRs, arc42 sections, and milestone plans.
6. Save as Markdown in the repository TDR location.

## Output

Create TDR entries in the repository TDR location using the agreed structure and status model.

## Quality Checks

- Debt scope and impact are measurable.
- Ownership and status are explicit.
- Remediation path is actionable and time-bounded.