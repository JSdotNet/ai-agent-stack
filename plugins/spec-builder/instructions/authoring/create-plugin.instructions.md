---
applyTo: '.github/plugin/plugin.json,README.md'
description: Dedicated rules for creating and refining Copilot plugin package assets.
---

# Create Plugin Instructions

## Purpose

- Standardize plugin bundle composition so plugins stay installable and maintainable.
- Keep plugin assets modular and discoverable.

Over the 60-line budget by design: the Copilot CLI manifest contract below is reference the
author cannot look up in the repository.

## When To Apply

- Apply when a request asks to create or evolve a plugin package.
- Apply when a request combines multiple customization assets into one reusable capability.

## Required Plugin Composition Flow

1. Define plugin intent: name, target audience, and primary outcomes.
2. Define the asset set: which agents, skills, hooks, and MCP/LSP configurations are required.
3. Define the resource strategy: which reusable templates and checklists become resource files.
4. Define component paths: how `plugin.json` maps `agents`, `skills`, `hooks`, `mcpServers`.
5. Define maintenance metadata: ownership, update triggers, and semantic version notes.
6. Validate installability: `copilot plugin install <local-path>`, then `copilot plugin list`.

## Required Files

- `.github/plugin/plugin.json`
- `README.md` with install and usage notes
- Referenced component folders (`agents/`, `skills/`, and optional config assets)

## Mandatory Copilot CLI Requirements

- Place the manifest at `plugin.json`, `.plugin/plugin.json`, or `.github/plugin/plugin.json`.
- `plugin.json` requires `name` (kebab-case) and should carry `description`, `version`,
  `author`, `license`, and `keywords`.
- Declare component paths where used: `agents`, `skills`, `hooks`, `mcpServers`, `lspServers`,
  `commands`. Follow CLI defaults unless there is a strong reason to override.
- Reinstall local plugins after changes; the CLI caches plugin components.

## Recommended Asset Layout

- `plugins/<plugin-name>/.github/plugin/plugin.json`
- `plugins/<plugin-name>/agents/*.agent.md`
- `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`
- Optional config: `hooks.json`, `.mcp.json`, `lsp.json`
- Optional overview page: `.github/plugins/<plugin-name>.md`

## Rules

- Use a kebab-case `name` and a semantic `version`.
- Keep the manifest description aligned with actual scope, and ensure every manifest path
  maps to an existing directory.
- Author both manifests and both hook files by hand — `.github/plugin/plugin.json` and
  `hooks.json` for Copilot, `.claude-plugin/plugin.json` and `hooks/hooks.json` for Claude —
  plus the repo-root marketplace entry. Nothing is generated, so a change to one side is a
  change owed to the other. Full rules:
  [dual-host-authoring.instructions.md](dual-host-authoring.instructions.md).
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning and
  the 60-line budget.

## Resource Rules

- Reference reusable resources by relative path from each consuming skill or agent instead of
  repeating guidance inline.
- Keep resources focused and single-purpose, and update them when process behavior changes.
- Keep examples realistic and free of secrets.
