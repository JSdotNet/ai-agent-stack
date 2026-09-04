---
name: create-skill
description: Create or refine a focused SKILL.md with clear trigger conditions, workflow steps, and outputs. Use when authoring or reviewing a skill.
---

# Create Skill Skill

## Inputs

- Skill name and primary purpose.
- Trigger phrases and expected inputs.
- Required workflow steps and outputs.

## Workflow

1. Define one primary workflow for the skill.
2. Decide the invocation mode: could the model usefully reach for this skill on its own, or
   must another skill or agent reach it? If neither, set `disable-model-invocation: true`.
3. Draft frontmatter with a `name` matching the folder and a `description` that matches the
   mode — each distinct case it handles when model-invoked, one human-facing line when not.
4. Draft the workflow steps, then add inputs, outputs, and quality checks only where the
   steps leave them unclear.
5. Describe actions rather than host-specific tool names, so both hosts read the skill alike.
6. Reference instruction and resource files by relative path.
7. Prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md):
   40-line budget, no rule stated twice.

## Output

- A `skills/<skill-name>/SKILL.md` file that passes
  [create-skill.instructions.md](../../instructions/authoring/create-skill.instructions.md).
