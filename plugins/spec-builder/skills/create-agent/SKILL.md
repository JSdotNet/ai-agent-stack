---
name: create-agent
description: Create or refine an agent file with correct frontmatter, scope, tools, and handoff documentation. Use when authoring or reviewing a *.agent.md.
---

# Create Agent Skill

## Inputs

- Agent role, intent, and scope boundaries.
- Required tools and handoff expectations.

## Workflow

1. Review related agent and instruction files, and reuse their patterns.
2. Define role, priorities, constraints, and quality expectations.
3. Draft frontmatter with `name` matching the file name, plus `description`. Author `tools`
   as one union list — Copilot ids, then their Claude equivalents — and record any model
   preference in a `## Model` body section rather than in frontmatter.
4. Draft the body: purpose first, then behavior, constraints, and references — adding each
   section only when the agent needs it.
5. Describe every handoff target in the body, since the `handoffs` key alone does not carry
   it to both hosts.
6. Prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md):
   80-line body budget, no rule stated twice.
7. Confirm the tools list resolves on both hosts, and that every MCP server is granted in
   both spellings.

## References

- [create-agent.instructions.md](../../instructions/authoring/create-agent.instructions.md)
- [dual-host-authoring.instructions.md](../../instructions/authoring/dual-host-authoring.instructions.md)
  — why `model`, `tools`, and `handoffs` are handled the way step 3 and step 5 require.
