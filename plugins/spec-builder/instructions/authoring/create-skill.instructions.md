---
applyTo: 'skills/**/SKILL.md'
description: Dedicated rules for creating and refining GitHub Copilot skills.
---

# Create Skill Instructions

## Purpose

- Define a consistent approach for skill authoring.
- Ensure each skill is focused and easy for the model to discover.

## Minimum Structure

Required: YAML frontmatter with `name` and `description`, a title, and the workflow steps.

Add inputs, outputs, and quality checks when the steps do not already make them obvious.

## Invocation Mode

Choose the mode before writing the description; it decides what the description is for.

- **Model-invoked** (omit `disable-model-invocation`) — the model may fire the skill, and
  another skill or agent may reach it. `description` carries explicit trigger language and
  is loaded on every turn, so it is a permanent cost.
- **User-invoked** (`disable-model-invocation: true`) — only the human typing the name can
  invoke it. `description` is one human-facing line with the trigger lists stripped.

The test: could the model usefully reach for this skill on its own, or must another skill or
agent reach it? If neither, make it user-invoked and pay no context load. Never mark one
user-invoked when an agent, a hook prompt, or another skill invokes it by name — nothing but
the human can reach it, so that dispatch would break.

Claude Code honours the key and Copilot ignores unknown frontmatter, so a user-invoked skill
stays model-invocable there. It degrades safely, and it is why a shortened description must
still be accurate prose: on Copilot it remains the model's only signal.

## Rules

- Keep one primary workflow per skill.
- Match `description` to the invocation mode, naming each distinct case a model-invoked
  skill handles.
- Describe the action — "read the file", "search the codebase" — so each host picks its own
  tool; skills are read verbatim by Copilot and Claude Code alike.
- Reference instruction and resource files by relative path. Claude does not auto-apply
  `applyTo`, so the explicit reference is what loads the guidance in both hosts.
- Note optional MCP dependencies in the body, with a fallback for when the server is absent.
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning and
  the 40-line budget.
