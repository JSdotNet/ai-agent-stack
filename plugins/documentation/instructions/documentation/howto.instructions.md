---
applyTo: '**/howto/*.md'
description: Rules for writing How-To guides — step-by-step, developer-focused procedural documentation.
---

# HowTo Instructions

## Purpose

- Apply these rules when editing any file under `**/howto/*.md`.
- Audience: developers who need practical, step-by-step instructions to complete a process.
- Focus on executable guidance (what to do, in what order, and how to verify success).

## Scope

- This folder is for **How-To guides** only.
- Typical examples: local development setup, developer laptop setup, tooling bootstrap, environment onboarding.

## Recommended Structure (Guideline)

Use this section order when it improves clarity. It is a guideline, not a strict requirement.

1. `# Title`
2. `## Overview` — short goal statement and target audience.
3. `## Prerequisites` — required accounts, access, software, and assumptions.
4. `## Steps` — numbered sequence (`1.`, `2.`, `3.`) with one action per step.
5. `## Validation` — checks to confirm the process worked.
6. `## Troubleshooting` — common issues and fixes.
7. `## References` — links to official docs, scripts, or related internal guides.

## Heading and Layout Conventions

- Use ATX headings (`#`, `##`, `###`) with one blank line before and after headings.
- Keep one blank line between paragraphs and lists.
- Use numbered lists for procedures and unordered lists for supporting details.
- Keep step text concise and avoid long narrative blocks.

## Writing Rules

- Use direct, concise language aimed at developers.
- Prefer imperative step wording (for example: "Install X", "Run Y", "Verify Z").
- Keep each step actionable and observable.
- Put commands, paths, environment variables, and file names in backticks.
- If required information is missing, use explicit placeholders like `[TODO: add script URL]`.
- Use bullets for lists and numbered lists for procedure steps.

## Step Quality Checklist

- State where to run a command (for example: terminal, repo root, admin shell).
- Include expected result after critical steps.
- Call out OS-specific differences only when needed.
- Mention restart/reboot/sign-out requirements explicitly.
- Add warnings before destructive or privileged actions.

## Quality Bar for Validation

- Ensure `## Validation` includes concrete checks (for example: command output, UI state, service health).
- Prefer observable outcomes over vague statements like "it should work."
- If manual verification is required, state who verifies and where.

## Safety and Accuracy

- Do not include secrets, tokens, private endpoints, or personal credentials.
- Prefer official documentation links for install/update steps.
- Avoid inventing versions, URLs, or access requirements.
- Keep scope minimal and task-focused; avoid unrelated background.

## Final Checklist

- [ ] Instructions are step-by-step and easy to follow.
- [ ] Prerequisites and validation are present when relevant.
- [ ] Commands and references are accurate and current.
- [ ] Any assumptions or unknowns are marked with TODO placeholders.
- [ ] No sensitive information is included.
