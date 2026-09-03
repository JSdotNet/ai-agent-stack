# architecture

Installable GitHub Copilot CLI plugin for architecture design and documentation workflows.

## Includes

- Agents:
  - `agents/architect.agent.md`
- Skills:
  - `skills/architecture-arc42-generator/SKILL.md`
  - `skills/architecture-blueprint-generator/SKILL.md`
  - `skills/create-architectural-decision-record/SKILL.md`
  - `skills/create-technical-debt-record/SKILL.md`
  - `skills/c4-diagram-generator/SKILL.md`
  - `skills/sequence-diagram-generator/SKILL.md`
  - `skills/state-diagram-generator/SKILL.md`
  - `skills/deployment-diagram-generator/SKILL.md`
- Instructions:
  - `instructions/common/agent-handoff.instructions.md`
  - `instructions/common/agent-model-recommendation.instructions.md`
  - `instructions/blueprint/blueprint-global-instructions.md`
  - `instructions/adr/adr-global-instructions.md`
  - `instructions/tdr/tdr-global-instructions.md`
  - `instructions/c4/c4-global-instructions.md`
  - `instructions/sequence/sequence-global-instructions.md`
  - `instructions/state/state-global-instructions.md`
  - `instructions/deployment/deployment-global-instructions.md`
  - `instructions/arc42/arc42-global-instructions.md`
  - `instructions/arc42/arc42-section-01-instructions.md`
  - `instructions/arc42/arc42-section-02-instructions.md`
  - `instructions/arc42/arc42-section-03-instructions.md`
  - `instructions/arc42/arc42-section-04-instructions.md`
  - `instructions/arc42/arc42-section-05-instructions.md`
  - `instructions/arc42/arc42-section-06-instructions.md`
  - `instructions/arc42/arc42-section-07-instructions.md`
  - `instructions/arc42/arc42-section-08-instructions.md`
  - `instructions/arc42/arc42-section-09-instructions.md`
  - `instructions/arc42/arc42-section-10-instructions.md`
  - `instructions/arc42/arc42-section-11-instructions.md`
  - `instructions/arc42/arc42-section-12-instructions.md`

## Install

```bash
copilot plugin install JSdotNet/Copilot:plugins/architecture
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/Copilot:plugins/architecture
```

## Uninstall

```bash
copilot plugin uninstall architecture
```

## Relationship To Development Plugin

- This plugin contains architecture-focused assets that were previously bundled in `plugins/development`.
- This plugin is self-contained for architecture authoring workflows.
- Install this plugin together with `plugins/development` only when cross-plugin handoff workflows are explicitly needed.