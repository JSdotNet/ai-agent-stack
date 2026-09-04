# domain

Installable GitHub Copilot CLI plugin for Domain-Driven Design workflows.

## Includes

- Agents:
  - `agents/domain.agent.md`
- Skills:
  - `skills/domain-exploration/SKILL.md`
  - `skills/context-mapping/SKILL.md`
  - `skills/domain-interaction-model/SKILL.md`
  - `skills/domain-model-design/SKILL.md`
  - `skills/aggregate-diagram/SKILL.md`
  - `skills/domain-event-flow-diagram/SKILL.md`
  - `skills/domain-interaction-diagram/SKILL.md`
  - `skills/subdomain-landscape-diagram/SKILL.md`
- Instructions:
  - `instructions/ddd/ddd-global-instructions.md`
  - `instructions/ddd/strategic-design-instructions.md`
  - `instructions/ddd/tactical-design-instructions.md`
  - `instructions/diagrams/ddd-diagram-instructions.md`
  - `instructions/output/domain-documentation-structure-instructions.md`
- Resources:
  - `resources/ddd-checklist.md`
  - `resources/ddd-anti-patterns.md`

## Install

```bash
copilot plugin install JSdotNet/ai-agent-stack:plugins/domain
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/ai-agent-stack:plugins/domain
```

## Uninstall

```bash
copilot plugin uninstall domain
```

## Relationship To Architecture Plugin

- This plugin owns domain design and modelling workflows.
- The `arc42` plugin owns arc42, blueprints, ADRs, and TDRs.
- Install both when you need end-to-end coverage from domain discovery through architecture documentation.
- Handoff from `domain` to `arc42` is supported for recording decisions as ADRs or mapping results into arc42 sections.
