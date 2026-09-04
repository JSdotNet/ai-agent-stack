# Quick Reference — Customization Assets

Concise decision guide and troubleshooting checklist for authoring customization assets.

## When To Use Which Asset Type

| Asset | File pattern | Use when | Hosts |
|---|---|---|---|
| Repository instructions | `.github/copilot-instructions.md` | Repository-wide standards that apply to every conversation | Copilot |
| Path-specific instructions | `.github/instructions/*.instructions.md` | Rules that apply only to specific file paths or asset types | Both, but `applyTo` is Copilot-only |
| Agent | `.github/agents/*.agent.md` | You need a named persona with specific tools, tone, and handoff behavior | Both |
| Skill | `.github/skills/<skill>/SKILL.md` | You have a reusable multi-step workflow with defined inputs, steps, and outputs | Both |
| Prompt | `.github/prompts/*.prompt.md` | You want a slash-command-style shortcut for a specific, repeatable request | Copilot |
| Canvas extension | `.github/extensions/<name>/extension.mjs` | You need an interactive side-panel surface the agent can open and drive with actions | Copilot only |
| GitHub Actions workflow | `.github/workflows/*.yml` | You need CI/CD automation triggered by repository events, schedules, or manual dispatch | n/a |

## Dual-Host Rules

Plugin assets load in both GitHub Copilot and Claude Code from one copy. The rules — which
file each host reads, what the two manifests must agree on, and why `sessionStart` is the one
hook event that cannot be a prompt — are in
[dual-host-authoring.instructions.md](../instructions/authoring/dual-host-authoring.instructions.md),
and the always-on summary is in this plugin's `sessionStart` hook.

## Troubleshooting: Asset Not Being Picked Up

Work through this checklist when a customization file is not applied by Copilot:

- [ ] File is in the correct location for its type (see table above).
- [ ] File name and extension follow the required pattern (e.g. `*.agent.md`, `*.instructions.md`).
- [ ] Frontmatter is valid YAML with no syntax errors.
- [ ] `applyTo` glob matches the file currently open in the editor.
- [ ] Check Chat diagnostics (Copilot Chat → `...` menu → Show Diagnostics) to see which files were loaded.
- [ ] Verify relevant VS Code settings are enabled:
  - `chat.useAgentsMdFile`
  - `chat.includeApplyingInstructions`
  - `chat.instructionsFilesLocations`
