---
applyTo: 'agents/**/*.agent.md'
description: Dedicated rules for creating and refining GitHub Copilot agent files.
---

# Create Agent Instructions

## Purpose

- Define a consistent standard for agent authoring.
- Ensure agent files are discoverable, maintainable, and safe.

## Minimum Structure

Required: YAML frontmatter with `name` and `description`, a title, and a purpose section.

Add expected behavior, constraints, references, and custom instruction sections when the
agent needs them. An empty or restating section is a section to delete.

## Rules

- Keep scope explicit and responsibilities narrow.
- Record the model preference in a `## Model` body section; leave `model` out of frontmatter.
- Author `tools` as one union list: Copilot ids, then their Claude equivalents.
- Describe every `handoffs` target in the body, and require explicit approval for each.
- Leave runtime application code guidance to the plugin that owns that code.
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning and
  the 80-line body budget.
- The dual-host rules behind the `model`, `tools`, and `handoffs` items above are in
  [dual-host-authoring.instructions.md](dual-host-authoring.instructions.md).
