---
name: c4-diagram-generator
description: Generate C4 model architecture diagrams (System Context, Container, Component, Code) as Mermaid-embedded Markdown artifacts.
---

# C4 Diagram Generator

Use this skill to produce C4 model diagrams at any abstraction level as Mermaid diagrams embedded in Markdown documents.

## Trigger Conditions

Use when the user asks to:

- Create or refresh a C4 System Context, Container, Component, or Code diagram.
- Visualise system boundaries, major containers, or component relationships.
- Add architecture diagrams to arc42 sections 3, 5, 6, or 7.
- Produce an architecture overview suitable for a specific stakeholder audience.

## Inputs

- System or component name and purpose
- Known users (personas) and external systems
- Container or component inventory (Level 2 / Level 3)
- Technology stack for containers and components
- Target audience and required level of detail

## Workflow

1. Load `instructions/c4/c4-global-instructions.md`.
2. Identify the required C4 level based on audience and scope.
3. Load the matching level prompt from `skills/c4-diagram-generator/prompts/`.
4. Ask focused clarifying questions only for information that is missing or conflicting.
5. Generate the Mermaid C4 diagram with correct element types and labelled relationships, applying the Color Conventions palette from `instructions/c4/c4-global-instructions.md` via `UpdateElementStyle`.
6. Write a prose summary (3–5 sentences) explaining the diagram's key design decisions.
7. Add traceability notes linking the diagram to relevant arc42 sections, ADRs, or blueprint artifacts.
8. List open questions or assumptions explicitly.
9. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-output-file>` from the plugin root to generate an SVG alongside the Markdown output.

## Prompt Pack

| Level | Prompt File |
| --- | --- |
| Level 1 — System Context | `skills/c4-diagram-generator/prompts/c4-level1-system-context.prompt.md` |
| Level 2 — Container | `skills/c4-diagram-generator/prompts/c4-level2-container.prompt.md` |
| Level 3 — Component | `skills/c4-diagram-generator/prompts/c4-level3-component.prompt.md` |
| Level 4 — Code | `skills/c4-diagram-generator/prompts/c4-level4-code.prompt.md` |

## Output

- Mermaid C4 diagram embedded in a fenced `mermaid` code block
- Prose summary of the diagram (3–5 sentences)
- Traceability links to related arc42 sections, ADRs, or blueprints
- List of open questions or assumptions

## Quality Checks

- [ ] Correct C4 level used for the audience and scope.
- [ ] All elements have a name, technology tag (if applicable), and description.
- [ ] All relationships are labelled with a verb phrase.
- [ ] External systems and personas are marked as external (`_Ext`).
- [ ] `UpdateElementStyle` color convention applied per `instructions/c4/c4-global-instructions.md`.
- [ ] Diagram is embedded in a fenced `mermaid` code block.
- [ ] Prose summary accompanies the diagram.
- [ ] Traceability links are present where relevant.
- [ ] SVG file generated in `diagrams/` alongside the Markdown output using `scripts/generate-diagram-svgs.ps1`.
