---
name: create-plugin
description: Create or refine a Copilot plugin package with valid manifest paths, scope, and documentation. Use when adding a plugin, adding components to one, or fixing its manifest.
---

# Create Plugin Skill

## Inputs

- Plugin name, version, and scope.
- Required components (agents, skills, hooks, optional config).
- Packaging or install constraints.

## Workflow

1. Define plugin intent and boundaries.
2. Draft or update both manifests — `.github/plugin/plugin.json` and
   `.claude-plugin/plugin.json` — and confirm every component path maps to an existing
   folder.
3. Update the plugin `README.md` with install and reinstall guidance.
4. Verify metadata and scope consistency across the manifest, README, and components.
5. Prune against
   [spec-conciseness.instructions.md](../../instructions/authoring/spec-conciseness.instructions.md):
   state each rule once and point at its owner from everywhere else.
6. Add the marketplace entry, then confirm the two manifests agree on `name`, `version`,
   and `description`.

## Output

- Updated plugin package metadata and Markdown documentation.
- Both manifests, any hook files, and the marketplace entry, in step with each other.

## References

- [create-plugin.instructions.md](../../instructions/authoring/create-plugin.instructions.md)
- [dual-host-authoring.instructions.md](../../instructions/authoring/dual-host-authoring.instructions.md)
  — which file each host reads, and what the two sides must agree on.
