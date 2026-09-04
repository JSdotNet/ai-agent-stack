---
applyTo: '**/*.md'
description: Core UX design principles, usability heuristics, and accessibility rules for all design work.
---

# UX Global Instructions

## Purpose

Define shared UX design principles that apply to all design artifacts produced by this plugin.

## Core Principles

1. **User-centred design.** Every design decision must serve the user's goals, context, and mental model. Start with user needs, not features.
2. **Clarity over cleverness.** Prefer obvious, conventional UI patterns over novel interactions unless novelty directly benefits usability.
3. **Consistent language and layout.** Use the same terminology, labels, icons, and layout patterns throughout a product. Inconsistency is a usability defect.
4. **Accessibility by default.** Design for WCAG 2.1 AA compliance as a baseline. Accessibility is not an afterthought.
5. **Progressive disclosure.** Show only what is needed at each step. Reveal complexity on demand, not up front.
6. **Feedback and status.** Always give users clear, timely feedback about system status and the result of their actions.

## Usability Heuristics (Nielsen)

Apply these heuristics in design reviews and during artifact creation:

1. Visibility of system status
2. Match between system and the real world
3. User control and freedom (undo, back, cancel)
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognise, diagnose, and recover from errors
10. Help and documentation

## Accessibility Requirements

- All interactive elements must be keyboard-navigable.
- Text contrast ratio must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).
- Do not rely on colour alone to convey meaning.
- All images and icons must have descriptive alt text or accessible labels.
- Use semantic structure (headings, landmarks, lists) in any HTML or rendered output.
- Annotate wireframes with ARIA labels and keyboard focus order where meaningful.

## Platform Scope

Specify the target platform in every design artifact:

- **Web** — responsive layouts, desktop-first or mobile-first depending on user context
- **Mobile** — iOS and/or Android; touch targets ≥ 44 × 44 px
- **Desktop app** — native platform conventions and keyboard accessibility

## Fidelity Levels

Match fidelity to the current design stage:

| Level | Content | Purpose |
|---|---|---|
| Low | Boxes and labels, no styling | Explore layout and structure |
| Mid | Realistic content, states, interactions annotated | Validate flow and usability |
| High | Full visual design tokens applied | Prepare for developer handoff |

## Quality Standards

- Every wireframe must identify the target user, platform, and fidelity level.
- Every design guideline document must cover at minimum: typography, colour, spacing, and interaction states.
- Every user flow must show entry points, the primary happy path, and at least one error or edge-case branch.
- Every design review must categorise findings by severity: Critical, Major, Minor, or Suggestion.
