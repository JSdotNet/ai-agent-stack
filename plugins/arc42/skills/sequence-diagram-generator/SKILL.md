---
name: sequence-diagram-generator
description: Generate sequence diagrams for runtime scenarios, integration flows, and API call chains using Mermaid sequenceDiagram notation.
---

# Sequence Diagram Generator

Use this skill to produce Mermaid sequence diagrams that document runtime behaviour and message flows between participants.

## Trigger Conditions

Use when the user asks to:

- Document a runtime scenario, use case flow, or API call chain.
- Illustrate how components or services interact during a specific operation.
- Add runtime views to arc42 Section 6 or complement a C4 diagram with a dynamic perspective.
- Make implicit ordering, timing, or error handling behaviour explicit.

## Inputs

- Scenario name and triggering actor or event
- Participants involved (services, components, actors, external systems)
- Message sequence: what is sent, by whom, and in what order
- Error paths or alternative branches that are architecturally significant
- Relevant protocol or technology for each message (optional)

## Workflow

1. Load `instructions/sequence/sequence-global-instructions.md`.
2. Confirm the scenario name, participants, and message flow with the user.
3. Load `skills/sequence-diagram-generator/prompts/sequence-diagram.prompt.md`.
4. Ask focused clarifying questions only for missing ordering decisions or error paths.
5. Generate the Mermaid `sequenceDiagram` with correctly typed arrows and labelled messages.
6. Add `alt`/`opt`/`loop` fragments for conditionals and error paths.
7. Write a prose summary (2–4 sentences) explaining key ordering decisions and error handling.
8. Add traceability notes to arc42 §6 and the related C4 diagram.
9. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-output-file>` from the plugin root to generate an SVG alongside the Markdown output.

## Output

- Mermaid `sequenceDiagram` embedded in a fenced `mermaid` code block
- Prose summary of the scenario (2–4 sentences)
- Traceability links to arc42 §6 and the relevant C4 Container or Component diagram
- List of open questions or assumptions

## Quality Checks

- [ ] One scenario per diagram.
- [ ] Participants named by role.
- [ ] All messages labelled with a verb phrase.
- [ ] Synchronous vs asynchronous arrows used correctly.
- [ ] Significant error and alternative paths shown.
- [ ] Diagram embedded in a fenced `mermaid` code block.
- [ ] Prose summary present.
- [ ] Traceability links to arc42 §6 and related C4 diagram present.
- [ ] SVG file generated in `diagrams/` alongside the Markdown output using `scripts/generate-diagram-svgs.ps1`.
