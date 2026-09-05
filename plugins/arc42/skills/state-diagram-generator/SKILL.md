---
name: state-diagram-generator
description: Generate state machine diagrams for entity lifecycles, workflows, and protocol states using Mermaid stateDiagram-v2 notation.
---

# State Diagram Generator

Use this skill to produce Mermaid state machine diagrams that model the lifecycle of stateful entities, domain aggregates, or protocol objects.

## Trigger Conditions

Use when the user asks to:

- Document the lifecycle of a domain aggregate or entity (e.g., `Order`, `Subscription`, `Payment`).
- Model a workflow or approval process with explicit state transitions.
- Clarify ambiguous or complex state transitions for developers or reviewers.
- Describe a protocol-level state machine (e.g., circuit-breaker states, connection states).

## Inputs

- Entity or protocol name being modelled
- List of possible states
- Events or commands that trigger transitions
- Guard conditions for conditional transitions (if any)
- Entry, exit, or transition actions (if any)
- Composite or concurrent sub-states (if any)

## Workflow

1. Load `instructions/state/state-global-instructions.md`.
2. Confirm the entity name, states, and key transitions with the user.
3. Load `skills/state-diagram-generator/prompts/state-diagram.prompt.md`.
4. Ask focused clarifying questions only for missing guards, terminal states, or sub-state structure.
5. Generate the Mermaid `stateDiagram-v2` with labelled transitions and composite states where needed.
6. Write a prose summary (2–4 sentences) explaining the lifecycle, key guards, and any side effects.
7. Add traceability notes to arc42 §6 or §8 and the related domain model.
8. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-output-file>` from the plugin root to generate an SVG alongside the Markdown output.

## Output

- Mermaid `stateDiagram-v2` embedded in a fenced `mermaid` code block
- Prose summary of the lifecycle (2–4 sentences)
- Traceability links to arc42 §6 (scenario) or §8 (crosscutting pattern) and the related domain definition
- List of open questions or assumptions
