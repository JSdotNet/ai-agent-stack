---
name: domain-event-flow-diagram
description: 'Generate Mermaid sequence diagrams showing how domain events flow from commands through aggregates and policies within or across bounded contexts.'
---

# Domain Event Flow Diagram

Use this skill to produce event flow diagrams that visualise the command-to-event-to-policy chain for one or more business processes.

## Trigger Conditions

Use after `domain-exploration` or `domain-model-design` has identified commands, domain events, and policies, or when the user wants to visualise event flow for a specific process.

## Inputs

- `domain.md` or bounded context file(s) with commands, domain events, and policies.
- Optionally: a named business process to focus the diagram on.

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/diagrams/ddd-diagram-instructions.md`.
2. Confirm scope with the user:
   - **Single process** — one end-to-end business process (e.g., "Place Order").
   - **Cross-context flow** — events crossing one or more bounded context boundaries.
   - **Full domain** — all significant processes in `domain.md`.
3. For each in-scope process:
   - Identify the actor or external trigger.
   - Trace the chain: actor → command → aggregate → domain event → policy → next command.
   - Mark every bounded context transition with a `Note over` separator.
4. Produce a Mermaid `sequenceDiagram` per process following `instructions/diagrams/ddd-diagram-instructions.md`:
   - Participants: actors, `ContextName::AggregateName` pairs, and named policies.
   - Commands: solid arrows (`->>`).
   - Domain events: dashed arrows (`-->>`).
   - Policy triggers: fire-and-forget arrows (`--)`).
5. Store diagrams in `domain.md` under a **Domain Event Flows** section, or in the relevant bounded context file under a **Domain Event Flows** subsection.
6. Produce one diagram per significant process; do not combine unrelated processes in a single diagram.
7. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-output-file>` from the plugin root to generate SVG files alongside the Markdown output.

## Output

- One or more Mermaid `sequenceDiagram` blocks showing the command-event-policy chain for each identified process.
- Diagrams embedded in `domain.md` or the relevant bounded context file(s).
