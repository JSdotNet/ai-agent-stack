---
applyTo: 'agents/**/*.agent.md'
description: Defines plugin-local naming conventions for agent-related instruction assets.
---

# Agent Naming Instructions

## Purpose

- Define plugin-local naming conventions for instruction files that steer agent behavior.
- Keep plugin instruction files easy to recognize and maintain.

## Naming Convention

- Name agent-governance instruction files `agent-<topic>.instructions.md`, using lowercase
  letters and hyphens in a short, specific `<topic>`.
- Keep agent-governance instructions in `instructions/agent/`.
- Keep asset-authoring instructions in `instructions/authoring/`, named after the skill they
  govern — `create-agent`, `create-instruction`, `create-plugin`, `create-skill`,
  `create-canvas`, `create-workflow`.

## Scope Note

- This convention covers the plugin-local `instructions/` folder only. Repository-wide
  grouping conventions live in the root `.github/instructions/` assets.

## Quick Compliance Check

- [ ] Agent-governance files follow `agent-<topic>.instructions.md` and sit in `instructions/agent/`.
- [ ] Authoring instructions sit in `instructions/authoring/` and match their skill name.
- [ ] Topic names are specific and readable.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
