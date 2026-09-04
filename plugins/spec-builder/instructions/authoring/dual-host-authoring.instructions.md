---
applyTo: 'agents/**/*.agent.md,**/plugin.json,hooks.json,hooks/hooks.json'
description: How one authored copy of an asset loads in both GitHub Copilot and Claude Code, and which file each host reads.
---

# Dual-Host Authoring Instructions

Both hosts ignore frontmatter keys and tool names they cannot resolve, which is what lets one
file serve both. Only the manifest location and the hook shape genuinely differ, and every
file below is hand-authored: there is no generator, so nothing regenerates after an edit.

Over the 60-line budget by design: the host contract below is reference an author cannot look
up in the repository.

## Which File Each Host Reads

| Path | Read by |
| --- | --- |
| `agents/`, `skills/`, `instructions/`, `resources/` | both |
| `.github/plugin/plugin.json` | Copilot |
| `.claude-plugin/plugin.json` | Claude Code |
| `hooks.json` (plugin root) | Copilot |
| `hooks/hooks.json` | Claude Code; Copilot only when the root file is absent |

The two manifests agree on `name`, `version`, and `description`. Author both in the same
change — a plugin that updates one is a plugin the other host describes wrongly.

## Agent Frontmatter

| Field | Resolution |
| --- | --- |
| `name`, `description` | Both required; Claude refuses to load an agent without a description |
| `model` | Omit — Claude refuses an id it does not recognise. Record the preference in a `## Model` body section |
| `tools` | One union list: Copilot ids first, then their Claude equivalents. Each host keeps what it knows |
| `agents`, `handoffs` | Copilot reads them, Claude ignores both — name every target in the body prose |

On the Claude side `tools` is an exact-match allowlist. Give every agent `Skill` to reach the
plugin's own skills, and `Agent` only when it delegates. For an MCP server, grant the server
rather than its tools and emit both spellings — `mcp__plugin_<plugin>_<server>` for a server
the plugin provides, `mcp__<server>` for one registered in a repository's `.mcp.json` —
because naming one form costs every tool of that server, silently.

## Manifests

Omit `skills` and `hooks` from the Claude manifest: it scans `skills/` and loads
`hooks/hooks.json` already, and naming the hooks file makes the plugin fail to load with
"Duplicate hooks file detected". List `agents` explicitly, including `agents-internal/` ones,
or a handoff target dangles. `mcpServers` uses the same syntax on both sides.

## Hooks

For every event but one, only the nesting and the event casing change: Copilot takes a flat
list under a camelCase event (`preToolUse`), Claude a list of matcher groups under a
PascalCase one (`PreToolUse`). Both accept `type: prompt` there.

`sessionStart` is the exception. A prompt hook issues a sub-prompt into a conversation that
does not exist yet, so Claude Code refuses it, records a *non-blocking* error, and starts the
session with the guidance silently absent. Author that one as a `command` hook plus a sidecar:

| File | Contents |
| --- | --- |
| `hooks/session-start-context.md` | the prompt text, verbatim |
| `hooks/emit-session-context.mjs` | reads it, prints `hookSpecificOutput.additionalContext` |
| `hooks/hooks.json` | `"command": "node"`, `"args": ["${CLAUDE_PLUGIN_ROOT}/hooks/emit-session-context.mjs"]` |

Prefer that exec form over a single shell string — no quoting to get wrong on a path with
spaces. Keep the Copilot prompt and the sidecar text in step by hand.

## Instructions

Claude does not auto-apply `applyTo`; an instruction file reaches it only when something
references its path. Reference every one explicitly from the asset that depends on it, because
a rule relying purely on glob matching does not fire there at all.
