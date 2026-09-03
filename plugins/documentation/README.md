# Documentation Plugin

A GitHub Copilot CLI plugin for writing and maintaining documentation artifacts, SVG infographics, and profile content.
Covers six documentation artifact types and three profile artifact types.

## What's included

| Asset | Path | Purpose |
|---|---|---|
| Agent | `agents/documentation.agent.md` | Orchestrates all six documentation artifact types |
| Agent | `agents/profile.agent.md` | Orchestrates GitHub, project, and LinkedIn profile artifacts |
| Instruction | `instructions/documentation/howto.instructions.md` | How-To writing rules |
| Instruction | `instructions/documentation/explanations.instructions.md` | Explanation writing rules |
| Instruction | `instructions/documentation/articles.instructions.md` | Article writing rules |
| Instruction | `instructions/documentation/ideas.instructions.md` | Idea writing rules |
| Instruction | `instructions/documentation/proposals.instructions.md` | Proposal writing rules |
| Instruction | `instructions/documentation/infographics.instructions.md` | SVG infographic authoring rules |
| Instruction | `instructions/profile/github.instructions.md` | GitHub profile writing rules |
| Instruction | `instructions/profile/projects.instructions.md` | GitHub project profile writing rules |
| Instruction | `instructions/profile/linkedin.instructions.md` | LinkedIn profile writing rules |
| Skill | `skills/create-howto` | Guided how-to creation workflow |
| Skill | `skills/create-explanation` | Guided explanation creation workflow |
| Skill | `skills/create-article` | Guided article creation workflow |
| Skill | `skills/create-idea` | Guided idea capture workflow |
| Skill | `skills/create-proposal` | Guided proposal creation workflow |
| Skill | `skills/create-infographic` | Guided infographic creation workflow from Markdown or prompt input |
| Skill | `skills/create-github-profile` | Guided GitHub profile creation workflow |
| Skill | `skills/create-project-profile` | Guided GitHub project profile workflow |
| Skill | `skills/create-linkedin-profile` | Guided LinkedIn profile workflow |
| Hooks | `hooks.json` | Session-start artifact structure guardrail prompt |

## Installation

Install from GitHub using the Copilot CLI:

```bash
copilot plugin install JSdotNet/Copilot:plugins/documentation
```

Re-install after any changes to pick up updates:

```bash
copilot plugin install JSdotNet/Copilot:plugins/documentation
```

## Usage

### Using the agents

Activate the appropriate agent for the artifact you want to maintain:

```
@documentation Write a how-to guide for setting up the local dev environment.
@documentation Create an explanation of why we use event sourcing.
@documentation Draft an article about our migration to .NET Aspire.
@documentation Capture an idea for offline-first sync.
@documentation Write a proposal for adopting a new branching strategy.
@profile Refresh my GitHub profile for platform engineering work.
@profile Draft a project profile for our internal developer portal.
@profile Rewrite my LinkedIn about section for solution architecture roles.
@documentation Create an infographic from docs/explanations/event-sourcing.md.
```

### Using skills directly

Invoke a specific skill to start a guided workflow:

```
/create-howto
/create-explanation
/create-article
/create-idea
/create-proposal
/create-infographic
/create-github-profile
/create-project-profile
/create-linkedin-profile
```

Each skill asks targeted clarifying questions and then drafts the artifact to your chosen location. Infographic outputs are generated as pure SVG assets by default.

## Documentation artifact types

| Artifact | Default output path | When to use |
|---|---|---|
| How-To | `**/howto/` | Step-by-step procedural guides for developers |
| Explanation | `**/explanations/` | Conceptual rationale and trade-off documentation |
| Article | `**/articles/` | Blog posts, stories, retrospectives, and deep dives |
| Idea | `**/ideas/` | Lightweight notes for capturing early-stage concepts |
| Proposal | `**/proposals/` | Structured recommendations for decisions or changes |
| Infographic | `**/infographics/` | Visual summaries, comparisons, timelines, KPI snapshots, and process storytelling in SVG |

## Profile artifact types

| Artifact | Default output path | When to use |
|---|---|---|
| GitHub Profile | `profiles/github/` | Public-facing GitHub profile or profile README content |
| Project Profile | `profiles/github/projects/` | Project showcase or portfolio-style GitHub project summaries |
| LinkedIn Profile | `profiles/linkedin/` | LinkedIn headline, about, or profile refresh artifacts |

## Instruction file scope

All instruction files use generic `applyTo` globs so they work in any repository layout:

- `**/howto/*.md`
- `**/explanations/*.md`
- `**/articles/*.md`
- `**/ideas/*.md`
- `**/proposals/*.md`
- `**/infographics/*.svg`
- `**/profiles/github/*.md`
- `**/profiles/github/projects/*.md`
- `**/profiles/linkedin/*.md`

## Updating

1. Edit the relevant agent, instruction, or skill file.
2. Re-install the plugin: `copilot plugin install JSdotNet/Copilot:plugins/documentation`
3. Test with a sample request to confirm the change takes effect.
