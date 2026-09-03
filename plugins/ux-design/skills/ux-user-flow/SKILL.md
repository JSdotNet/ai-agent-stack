---
name: ux-user-flow
description: Create user flow diagrams, navigation trees, and journey maps using Mermaid and Markdown.
---

# UX User Flow

## Purpose

Use this skill to map the paths users take through a product — from task flows and navigation trees to end-to-end journey maps with emotions, pain points, and opportunities.

## Trigger Conditions

Use when the user asks to:

- create a user flow, task flow, or navigation diagram
- map a user journey from discovery through conversion and retention
- document screen-to-screen navigation or state transitions
- visualise the happy path and error branches for a feature

## Inputs

Ask for the following when not already provided:

- **Flow type** — task flow, navigation tree, user journey map, or state diagram?
- **User persona or role** — who is performing this flow?
- **Starting point** — where does the flow begin?
- **Goal** — what is the user trying to accomplish?
- **Key decision points** — are there branching conditions or error paths to include?
- **Output location** — where should the artifact be saved? (default: `docs/design/flows/`)

## Required Resources

Load and apply before generating:

1. `instructions/ux/ux-global-instructions.md`
2. `instructions/ux/user-flow-instructions.md`

## Workflow

1. **Confirm the flow type and brief**
   - Clarify persona, entry point, goal, and scope.
   - Identify whether the output is a Mermaid diagram, Markdown table, or a combination.

2. **Map the happy path**
   - Identify the ideal sequence of steps from entry point to successful goal completion.

3. **Add branches and edge cases**
   - Identify decision points, validation failures, empty states, and abandonment paths.
   - For each branch, define what happens next (retry, fallback screen, error message).

4. **Choose the diagram type**
   - Task flow → `flowchart TD`
   - Navigation tree → `flowchart LR`
   - State transitions → `stateDiagram-v2`
   - User journey map → Markdown table + optional SVG swimlane

5. **Apply flow diagram rules**
   - Follow the Mermaid conventions from `user-flow-instructions.md`.
   - Label entry and exit nodes explicitly.
   - Annotate edges with user actions or system events.

6. **Write the flow document**
   - Include a brief preamble: persona, starting point, goal, and scope.
   - Embed the Mermaid diagram in a fenced code block.
   - For journey maps, include the Markdown table plus observations and opportunities.
   - Annotate open questions with `[TODO: clarify]`.

7. **Save and confirm**
   - Save to the agreed location.
   - Confirm output path, diagram type used, and any TODO items.

## Output

- One Markdown file per flow with:
  - Brief preamble (persona, goal, scope)
  - Mermaid diagram or journey map table
  - Open questions and follow-up items

## Quality Checks

- [ ] Persona or user role is identified.
- [ ] Entry point is clearly defined.
- [ ] Happy path is complete end-to-end.
- [ ] At least one error or edge-case branch is included.
- [ ] Exit points (success, abandonment, error) are explicit.
- [ ] Mermaid diagram is valid and renders correctly.
- [ ] Journey map (if applicable) includes emotions, pain points, and opportunities.
- [ ] Open questions are marked with `[TODO: clarify]`.
