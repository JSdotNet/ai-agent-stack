---
name: domain-exploration
description: 'Discover domain events, commands, actors, subdomains, and ubiquitous language through guided Event Storming-style exploration.'
---

# Domain Exploration

Use this skill to start domain discovery for a new or existing project.

## Trigger Conditions

Use when the user wants to explore a business domain, identify key domain concepts, or start from scratch with domain modelling.

## Inputs

- Business requirements, user stories, or domain expert knowledge.
- Existing documentation, API specs, or codebase references (optional).

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md`.
2. Confirm input sources with the user (business docs, verbal requirements, existing systems).
3. Run **Big Picture** exploration:
   - Identify all significant domain events (past tense: `OrderPlaced`, `PaymentReceived`).
   - Arrange events chronologically by business process.
   - Mark pivotal events and hot spots (areas of uncertainty or conflict).
4. Run **Process Modelling**:
   - For each process, identify commands (what triggers the event), actors (who or what issues the command), and policies (automated rules: "whenever X happens, do Y").
   - Identify read models needed for decision-making.
   - Note external systems involved.
5. Run **Subdomain Discovery**:
   - Group related events and commands into candidate subdomains.
   - Classify each subdomain as core, supporting, or generic.
   - Identify initial bounded context candidates.
6. Build **Ubiquitous Language Glossary**:
   - For each discovered term, capture: name, definition, context, and related terms.
   - Flag terms that mean different things in different areas of the business.
7. Produce structured output following `instructions/output/domain-documentation-structure-instructions.md`.

## Output

- Initial `domain.md` with subdomain overview and ubiquitous language.
- Candidate bounded contexts with preliminary boundaries.
- List of open questions and areas needing domain expert validation.

## Guiding Principles

- Events first: discover what happened before what triggered it.
- Business language only: no technical jargon during exploration.
- Embrace uncertainty: mark hot spots rather than forcing premature decisions.
- Iterate: revisit and refine as understanding deepens.
