---
name: create-instruction
description: Create or refine a .instructions.md file with scoped applyTo rules and actionable standards. Use when authoring or reviewing an instruction file.
---

# Create Instruction Skill

## Inputs

- Target file scope (`applyTo`).
- Desired behavior rules and quality checks.
- Existing conventions that must be preserved.

## Workflow

1. Identify the narrowest scope where the instruction should apply.
2. Draft frontmatter with a specific `applyTo` and `description`.
3. Draft the rules, then add purpose, examples, and a validation checklist where they change
   how the rules are applied.
4. Check existing instruction files for the same rule, and point at the owner instead of
   restating it.
5. Add an explicit path reference from every skill or agent that depends on the file, since
   `applyTo` alone does not load it in both hosts.
6. Prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md):
   60-line budget, no rule stated twice.

## Output

- An `.instructions.md` file that passes
  [create-instruction.instructions.md](../../instructions/authoring/create-instruction.instructions.md).
