---
applyTo: '**/explanations/*.md'
description: Rules for writing Explanations — conceptual, rationale-driven documentation for developers and stakeholders.
---

# Explanation Instructions

## Purpose

- Apply these rules when editing any file under `**/explanations/*.md`.
- Audience: developers and stakeholders who need conceptual understanding, rationale, and trade-offs.
- Focus on clarity of concepts, decisions, and implications instead of procedural steps.

## Scope

- This folder is for **Explanations** only.
- Typical examples: architecture rationale, domain concepts, design trade-offs, and decision context.

## Recommended Structure (Guideline)

Use this section order when it improves clarity. It is a guideline, not a strict requirement.

1. `# Title`
2. `## Overview` — what concept is explained and for whom.
3. `## Context` — background and constraints.
4. `## Explanation` — core concept in clear subsections.
5. `## Trade-offs` — alternatives, pros/cons, and why this approach.
6. `## Practical Impact` — what this means in day-to-day work.
7. `## References` — related docs, ADRs, specs, or links.

## Heading and Layout Conventions

- Use ATX headings (`#`, `##`, `###`) with one blank line before and after headings.
- Keep one blank line between paragraphs and lists.
- Use unordered lists for concise comparisons and key points.
- Keep paragraphs concise; split dense topics into short subsections.

## Writing Rules

- Use direct, concise language aimed at technical readers.
- Explain terms before using project-specific shorthand.
- Favor cause-and-effect phrasing to make reasoning explicit.
- Put commands, paths, environment variables, and file names in backticks when mentioned.
- If required information is missing, use explicit placeholders like `[TODO: add decision date]`.

## Quality Bar

- Define the concept before discussing implementation details.
- Make assumptions, constraints, and non-goals explicit.
- Include at least one trade-off or alternative when decisions are described.
- End with practical guidance on when to apply the explained concept.

## Safety and Accuracy

- Do not include secrets, tokens, private endpoints, or personal credentials.
- Avoid inventing facts, measurements, or stakeholder decisions.
- Mark unknowns explicitly with TODO placeholders.
- Keep explanations aligned with current project conventions.

## Final Checklist

- [ ] Document explains the concept clearly for the intended audience.
- [ ] Context, constraints, and trade-offs are visible.
- [ ] Practical impact is clear and actionable.
- [ ] Assumptions or unknowns are marked with TODO placeholders.
- [ ] No sensitive information is included.
