---
applyTo: '**/articles/*.md'
description: Rules for writing blog posts and articles — narrative, audience-first documentation with practical takeaways.
---

# Article Instructions

## Purpose

- Apply these rules when editing any file under `**/articles/*.md`.
- Audience: internal or external readers who need a clear narrative with practical insights.
- Focus on readable storytelling, concrete lessons, and audience-relevant takeaways.

## Scope

- This folder is for **blog posts and articles**.
- Typical examples: implementation stories, lessons learned, retrospectives, and deep dives.

## Recommended Structure (Guideline)

Use this section order when it improves clarity. It is a guideline, not a strict requirement.

1. `# Title`
2. `## Hook` — short opening that frames the problem or opportunity.
3. `## Context` — relevant background and constraints.
4. `## Main Story` — chronological or thematic sections.
5. `## Key Takeaways` — concise lessons or recommendations.
6. `## Next Steps` — optional actions, follow-ups, or CTA.
7. `## References` — links to related docs, repos, or resources.

## Heading and Layout Conventions

- Use ATX headings (`#`, `##`, `###`) with one blank line before and after headings.
- Keep one blank line between paragraphs and lists.
- Prefer short paragraphs (2-4 sentences) and scannable bullets.
- Use numbered lists only when sequence matters.

## Writing Rules

- Lead with reader value before implementation detail.
- Keep a consistent narrative tense in each article.
- Prefer concrete examples over generic claims.
- Put commands, paths, environment variables, and file names in backticks.
- If required information is missing, use explicit placeholders like `[TODO: add metric]`.

## Quality Bar

- The opening clearly explains why the article matters.
- The body maintains a coherent narrative flow.
- Key takeaways are explicit and actionable.
- Claims are grounded in examples, outcomes, or links.

## Safety and Accuracy

- Do not include secrets, tokens, private endpoints, or personal credentials.
- Avoid disclosing internal-only information in external-facing content.
- Avoid inventing metrics, timelines, or decisions.
- Mark unknowns explicitly with TODO placeholders.

## Final Checklist

- [ ] Article has a clear hook and audience value.
- [ ] Story flow is coherent and concise.
- [ ] Takeaways are practical and specific.
- [ ] Assumptions or unknowns are marked with TODO placeholders.
- [ ] No sensitive information is included.
