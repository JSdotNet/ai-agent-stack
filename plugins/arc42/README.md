# arc42

Architecture documentation: arc42 sections, blueprints, ADRs, TDRs, and the diagram set
that belongs inside them. Fills the `architecture` role and the `spec` service.

## Includes

- Agents:
  - `agents/arc42.agent.md`
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
copilot plugin install JSdotNet/ai-agent-stack:plugins/arc42
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/ai-agent-stack:plugins/arc42
```

## Uninstall

```bash
copilot plugin uninstall arc42
```

## Output

Writes to the repository's `.arc42/` knowledge folder when it has one — `NN-name.md` per
section, `.arc42/adr/` and `.arc42/tdr/` for local records — following that folder's own
structure and metadata rules. Otherwise it asks for a path.

## Relationship To Other Plugins

- Self-contained: it declares no dependency and names no flow.
- Hands off to `domain` for bounded contexts and ubiquitous language, `coding` for
  implementation, and `ux` for design constraints that shape a section.