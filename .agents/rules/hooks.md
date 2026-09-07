---
name: hooks
description: Hook file shapes for both hosts, and the sessionStart exception.
paths:
  - "plugins/*/hooks.json"
  - "plugins/*/hooks/hooks.json"
  - "plugins/*/hooks/*.mjs"
---

# Hooks

`hooks/hooks.json` is discovered automatically — an event maps to a list of matcher groups:

```json
{ "hooks": { "PreToolUse": [ { "matcher": "Edit|Write",
  "hooks": [ { "type": "command", "command": "node",
               "args": ["${CLAUDE_PLUGIN_ROOT}/hooks/check.mjs"], "timeout": 10 } ] } ] } }
```

- Matchers take a tool name on tool events, and a start reason (`startup`, `resume`, `clear`,
  `compact`, `fork`) on `SessionStart`. Omitted or `"*"` matches everything.
- Use `${CLAUDE_PLUGIN_ROOT}` for anything shipped with the plugin, `${CLAUDE_PLUGIN_DATA}` for
  state it keeps. Prefer the exec form above — `command` plus `args` — over one shell string:
  no quoting to get wrong on a path with spaces.
- A `command` hook reads the event JSON on stdin and answers with `hookSpecificOutput` on
  stdout: `additionalContext` to tell the session something, `permissionDecision` to allow or
  deny a tool call. Exit 2 blocks the action; any other non-zero is a non-blocking error.
- `type: prompt` is documented for every event, but on `SessionStart` Claude Code rejects it at
  runtime ("no conversation context is available") and logs a non-blocking error, so it fails
  silently. Author that one as a `command` hook printing `additionalContext`.
- A tool matcher names the tools the hook needs. `"*"` is one process spawn per tool call in
  every session the plugin is enabled in, so a wildcard is a claim that every tool matters.
- A `SessionStart` hook is enabled per machine but its guidance is per repository. Guard it:
  read the repository's own `enabledPlugins` and the assets the guidance is about, and exit 0
  silently when neither says this repository adopted the plugin. See
  `plugins/devbook/hooks/emit-session-context.mjs`; only its `MARKERS` differs per plugin.

Copilot reads `hooks.json` at the plugin root instead, where hooks are `type: prompt` and the
event names are camelCase (`sessionStart`, `preToolUse`). Both files are authored. A prompt
hook cannot guard itself, so a Copilot `sessionStart` prompt stays unconditional and hedges the
opening sentence its Claude counterpart can decide.
