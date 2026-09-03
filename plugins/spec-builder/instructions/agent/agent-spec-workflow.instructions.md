---
applyTo: 'agents/spec-*.agent.md'
description: Defines the single-agent authoring workflow for GitHub customization assets.
---

# Spec Workflow Instructions

## Purpose

- Enforce one predictable workflow for customization asset authoring.
- Keep the plugin to a single agent that uses the plugin `create-*` skills.

## Required Sequence

Scope, Plan, Build, Verify, Report — in that order, as expanded in the agent's `## Workflow`
section in [spec-builder.agent.md](../../agents/spec-builder.agent.md).

## Role Boundaries

- `spec-builder.agent.md` owns planning, execution, and verification.
- Asset-specific rules stay in `instructions/authoring/*.instructions.md` and the `create-*`
  skills.
- Keep this plugin to one agent; route planning-only or review-only work through its phases.

## Tool Policy

- The agent may include the read, search, and edit tools required to author assets.
- Canvas work requires `extensions_manage` and `extensions_reload`.

## Handoff Policy

- Hand off to another plugin's agent only when the request leaves customization authoring
  scope, and only with explicit user approval using the wording:
  - "I recommend handing this off to `<agent>` because `<reason>`. Do you approve this handoff?"

## Validation Checklist

- [ ] The plugin exposes exactly one agent, named `spec-builder`.
- [ ] The agent maps each asset type to a `create-*` skill.
- [ ] The five workflow phases are followed in order.
- [ ] Changed file paths are reported.
- [ ] Any cross-plugin handoff is approval-gated.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
