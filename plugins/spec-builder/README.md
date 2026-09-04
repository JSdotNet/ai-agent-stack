# spec-builder

Installable plugin for creating customization assets that load in both GitHub Copilot and
Claude Code from a single copy of every file.

## Includes

- Agent:
  - `agents/spec-builder.agent.md`
- Skills:
  - `skills/create-agent/SKILL.md`
  - `skills/create-instruction/SKILL.md`
  - `skills/create-plugin/SKILL.md`
  - `skills/create-skill/SKILL.md`
  - `skills/create-workflow/SKILL.md`
- Instructions:
  - `instructions/agent/agent-naming.instructions.md`
  - `instructions/agent/agent-spec-workflow.instructions.md`
  - `instructions/authoring/create-agent.instructions.md`
  - `instructions/authoring/create-instruction.instructions.md`
  - `instructions/authoring/create-plugin.instructions.md`
  - `instructions/authoring/create-skill.instructions.md`
  - `instructions/authoring/create-canvas.instructions.md`
  - `instructions/authoring/create-workflow.instructions.md`
  - `instructions/authoring/dual-host-authoring.instructions.md`
  - `instructions/authoring/spec-conciseness.instructions.md`
- Resources:
  - `resources/quick-reference.md`
- Hooks:
  - `hooks.json` (Copilot: session-start authoring guardrail prompt)
  - `hooks/` (Claude Code: the same guardrail as a command hook and its sidecar)

## Scope

- This plugin focuses on creating and refining GitHub customization assets: agents, instructions, plugins, skills, canvas extensions, and GitHub Actions workflow files.
- A single `spec-builder` agent owns the full flow: scope, plan, build, verify, and report.
- Asset-specific rules live in the `create-*` skills and matching authoring instructions.
- It does not provide runtime application code implementation.
- It is self-contained and does not require assets from an external source repository.

## Dual-Host Authoring

Every asset this plugin produces is authored once and read by both GitHub Copilot and Claude
Code. Nothing is generated: both manifests and both hook files are hand-authored, so a change
to one host's side is a change owed to the other in the same commit.

Canvas extensions are the one Copilot-only asset type. Full rules:
[dual-host-authoring.instructions.md](instructions/authoring/dual-host-authoring.instructions.md).

## Install

Claude Code:

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

Then `/plugin install spec-builder@jsdotnet`.

Copilot:

```bash
copilot plugin install JSdotNet/ai-agent-stack:plugins/spec-builder
copilot plugin list
```

Reinstall after changes with the same command; the CLI caches plugin components. Uninstall with
`copilot plugin uninstall spec-builder`.

## Resources

- [GitHub Copilot Customization Docs](https://docs.github.com/en/copilot/customizing-copilot) — official reference for agents, instructions, prompts, and skills.
- [VS Code Copilot Chat Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) — host environment for `.agent.md`, `.instructions.md`, and `SKILL.md` files.
- [GitHub Copilot for Azure](https://docs.github.com/en/copilot/github-copilot-enterprise) — enterprise context and deployment considerations.
- [YAML Frontmatter Reference](https://jekyllrb.com/docs/front-matter/) — general frontmatter syntax used in Copilot customization assets.

## Future Upgrades

- **Review create naming**
- **Prompt authoring skill** — add a `create-prompt` skill and matching `instructions/authoring/create-prompt.instructions.md` to cover `.prompt.md` assets.
- **Multi-action canvas templates** — add reusable canvas renderer templates (static-file server, Vite dev server wiring) to `resources/` referenced by the `create-canvas` instructions.
- **Spec authoring skill** — add a `create-spec` skill for structured specification documents that drive multi-step agent workflows.
- **`plugin.json` schema validation** — add a `validate-plugin` skill that checks manifest completeness and path integrity before install, including that the two hand-authored manifests agree.
- **Hooks and MCP authoring** — add skills for `hooks.json` and `.mcp.json` to support lifecycle automation and MCP server wiring.
- **Resource templates folder** — add a `resources/` folder with reusable checklists, frontmatter templates, and example assets for bootstrapping new customization work.
- **Marketplace publishing workflow** — extend `create-plugin` to include `marketplace.json` composition and publishing readiness checks.
