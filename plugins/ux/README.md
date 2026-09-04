# ux

Installable GitHub Copilot CLI plugin for UX design workflows — wireframes, design guidelines, user flows, and design reviews.

## Includes

- Agents:
  - `agents/ux.agent.md`
- Skills:
  - `skills/ux-wireframe/SKILL.md`
  - `skills/ux-design-review/SKILL.md`
  - `skills/ux-design-guidelines/SKILL.md`
  - `skills/ux-user-flow/SKILL.md`
- Instructions:
  - `instructions/ux/ux-global-instructions.md`
  - `instructions/ux/wireframe-instructions.md`
  - `instructions/ux/design-guidelines-instructions.md`
  - `instructions/ux/user-flow-instructions.md`
- Resources:
  - `resources/wireframe/wireframe-patterns.md`
  - `resources/design/design-principles.md`
- Hooks:
  - `hooks.json`

## Install

```bash
copilot plugin install JSdotNet/ai-agent-stack:plugins/ux
copilot plugin list
```

## Reinstall After Changes

```bash
copilot plugin install JSdotNet/ai-agent-stack:plugins/ux
```

## Uninstall

```bash
copilot plugin uninstall ux
```

## Usage

### Using the agent

Activate the `ux` agent for all UX design work:

```
@ux Create a mid-fidelity wireframe for the checkout screen.
@ux Map the user flow for new user onboarding.
@ux Create design guidelines for our web app.
@ux Review the dashboard screen for UX issues.
```

### Using skills directly

Invoke a specific skill to start a guided workflow:

```
/ux-wireframe
/ux-design-review
/ux-design-guidelines
/ux-user-flow
```

## Skill Overview

| Skill | Purpose |
|---|---|
| `ux-wireframe` | Create low-, mid-, or high-fidelity wireframes as SVG or Mermaid |
| `ux-design-review` | Review screens or components against design guidelines and heuristics |
| `ux-design-guidelines` | Create or maintain a project design system or style guide |
| `ux-user-flow` | Map task flows, navigation trees, and user journey maps |

## Default Output Paths

| Artifact | Default Path |
|---|---|
| Design guidelines | `.design/` when the repository has it, else `docs/design/` |
| Wireframes | `docs/design/wireframes/` |
| User flows | `docs/design/flows/` |
| Design reviews | `docs/design/reviews/` |

`.design/` is guideline-level only. Wireframes, flows, and reviews are artifacts produced from
those guidelines and never live there.

## Relationship to Other Plugins

- **arc42** — hand off UX decisions to the `arc42` agent to record them as ADRs or incorporate UX constraints into arc42 sections.
- **documentation** — hand off design artifacts to the `documentation` agent to wrap them in How-To guides, Explanations, or Proposals.

## Optional Enhancement — impeccable

Install the `impeccable` skill from `awesome-copilot` to get deep frontend design and UI-craft guidance (by Paul Bakaus, impeccable.style):

```bash
copilot plugin install impeccable@awesome-copilot
```

When installed, the `ux` agent and the `ux-design-review` and `ux-design-guidelines` skills will automatically invoke `/impeccable` for expert UI-craft input. Without it, the plugin falls back to its built-in design principles and wireframe pattern resources. Node 18+ on your PATH is required for impeccable's optional automation scripts.
