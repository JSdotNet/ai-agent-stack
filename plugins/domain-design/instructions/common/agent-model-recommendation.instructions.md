---
applyTo: 'agents/**/*.agent.md'
description: Standardizes model selection guidance for domain design agent frontmatter.
---

# Agent Model Recommendation Policy

## Purpose

- Standardize model selection for custom agents in this plugin.
- Ensure each agent frontmatter includes a single explicit `model` value.

## Policy

When creating or updating files under `agents/**/*.agent.md`, set the frontmatter `model` field to one valid option from this file.

Valid options:

- `GPT-5.3-Codex`
- `GPT-5`
- `auto`

## Selection Guidance

1. Use `GPT-5.3-Codex` for tool-heavy agents or workflow orchestration.
2. Use `GPT-5` for prose-heavy strategy or documentation-first work.
3. Use `auto` when responsibilities are mixed or no clear model preference exists.

## Default Rule For New Agents

- If there is no clear reason to choose `GPT-5.3-Codex` or `GPT-5`, use `auto`.

## Review Requirement

- In responses that create a new agent, include a one-sentence rationale for the selected model.
