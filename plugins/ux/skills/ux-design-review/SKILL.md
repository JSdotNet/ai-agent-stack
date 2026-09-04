---
name: ux-design-review
description: Review existing UI screens or components against project design guidelines and UX heuristics. Produces a severity-rated findings report.
---

# UX Design Review

## Purpose

Use this skill to evaluate one or more screens, components, or user flows against design guidelines and established usability heuristics. The output is a structured findings report with severity ratings and actionable recommendations.

## Trigger Conditions

Use when the user asks to:

- review a wireframe, mockup, or live screen for UX quality
- audit a component or page against the project design system
- check accessibility or contrast compliance
- identify usability issues before development or release

## Inputs

Ask for the following when not already provided:

- **Artifact to review** — file path to the screen (SVG, image), Markdown description, or URL
- **Design guidelines path** — path to the project style guide or design guidelines document, if available
- **Review scope** — full review or specific concern (accessibility, visual consistency, flow clarity)?
- **Platform** — web, mobile, or desktop?
- **Output location** — where should the review report be saved? (default: `docs/design/reviews/`; never `.design/`, which is guideline-level only)

## Required Resources

Load and apply before reviewing:

1. `instructions/ux/ux-global-instructions.md`
2. Project design guidelines document (if available)
3. `resources/design/design-principles.md`

### Optional — `/impeccable`

If the `impeccable` skill is installed, invoke `/impeccable` as the first step of the review to get frontend design and UI-craft guidance. Incorporate its output into findings. If not installed, continue with the resources above.

## Workflow

1. **Confirm the artifact and scope**
   - Load or read the artifact being reviewed.
   - Confirm whether a project design guideline document is available. If not, apply the global UX principles and design principles resource.

2. **Evaluate against heuristics**
   Apply Nielsen's 10 usability heuristics from `ux-global-instructions.md` as the primary evaluation lens.

3. **Check accessibility**
   - Text contrast ratio (WCAG 2.1 AA minimum).
   - Keyboard navigation and focus management.
   - Colour-alone reliance for meaning.
   - Missing or inadequate labels and alt text.

4. **Check design consistency**
   - Typography and colour token usage vs. the project design system.
   - Spacing and layout grid compliance.
   - Component variant and state consistency.

5. **Check flow and clarity**
   - Is the user goal clear on first glance?
   - Is the primary action visually prominent?
   - Are error states and empty states handled?

6. **Write the findings report**
   Use the report template below. Rate each finding:

   | Severity | Definition |
   |---|---|
   | **Critical** | Blocks the user from completing their task |
   | **Major** | Significantly degrades usability or accessibility |
   | **Minor** | Reduces polish or convenience without blocking task completion |
   | **Suggestion** | Potential improvement that is not a defect |

7. **Save and confirm**
   - Save to the agreed location.
   - Summarise finding counts by severity.

## Report Template

```markdown
# UX Design Review: [Screen / Component Name]

**Date:** YYYY-MM-DD
**Reviewer:** UX Designer Agent
**Artifact:** [path or description]
**Platform:** [web / mobile / desktop]
**Scope:** [Full review / Accessibility / Visual consistency / Flow clarity]

## Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 0 |
| Minor | 0 |
| Suggestion | 0 |

## Findings

### [Finding ID] — [Short Title] _(Severity)_

**Heuristic / Principle:** [Which heuristic or guideline is violated?]
**Location:** [Screen region or element]
**Observation:** [What is the issue?]
**Impact:** [Why does it matter?]
**Recommendation:** [What should be changed?]

---
```

## Quality Checks

- [ ] All Nielsen heuristics considered.
- [ ] Accessibility (contrast, keyboard, labels) checked.
- [ ] Consistency against design system verified.
- [ ] Findings are rated by severity.
- [ ] Each finding has a clear recommendation.
- [ ] Report saved to the agreed location.
