---
name: create-workflow
description: Create or refine a GitHub Actions workflow file with secure, minimal, and traceable structure.
---

# Create Workflow Skill

## Inputs

- Workflow purpose and trigger events (push, pull_request, schedule, workflow_dispatch, etc.).
- Target jobs, ordering, and required permissions.
- Any existing workflow file to extend or harden.

## Workflow

1. Confirm the trigger events, jobs, and required permissions before drafting.
2. Draft `name`, `on`, workflow-level `permissions`, and `jobs` sections.
3. Pin every action reference to a full commit SHA with a version comment.
4. Add `concurrency`, `workflow_dispatch`, and `outputs` only where they serve the stated purpose.
5. Validate the file against
   [create-workflow.instructions.md](../../instructions/authoring/create-workflow.instructions.md)
   and prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md).

## Output

- A complete, valid `.github/workflows/<name>.yml` file.
- A short summary of trigger scope, jobs, and security decisions made.
