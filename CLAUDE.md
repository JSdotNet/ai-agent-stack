# ai-agent-stack

A Claude Code plugin marketplace named `jsdotnet`: the agents, skills, instructions, and hooks
that drive delivery work. One folder per plugin under `plugins/`, each installable on its own.

Assets are authored once and loaded by both Claude Code and GitHub Copilot — both hosts ignore
keys they do not know, which is what lets one file serve both. There is no generator: every
file here is hand-authored.

## Validating a change

The design these plugins implement is written down outside this repository. Before writing,
read the artifacts the change touches; when the repository and an artifact disagree, the
artifact is right — fix the repository, or record the divergence as a decision in
`.devbook/arc42/09-architecture-decisions.md` with the reason. Never leave the two silently
apart.

| Artifact | Governs |
| --- | --- |
| [devbook](https://claude.ai/code/artifact/2229020b-18d3-4d4d-9613-de82be7add04) | The `.devbook/` convention: folders, the fenced `meta` block, addressing, reading order, the approval gate, the plugin family. |
| [Knowledge Base Internals 2.0](https://claude.ai/code/artifact/63e86cb8-f258-4836-8cd4-5a32c6235fa0) | The schema underneath it: which fields become edges, each folder's status ladder and `type` set, the `tests` field, the converters. |
| [Layered Plugin Stack](https://claude.ai/code/artifact/591deaa8-c29a-4159-8146-dcbbfba46f81) | How plugins couple: the four layers, dependency vs bridge vs surface, enabling a combination per repository. |
| [The Rename Wave](https://claude.ai/code/artifact/aea8acf9-5335-4000-8e0f-450653349a90) | Naming and the host split: `flow-`, `fleet-`, `phase-`, `automation-`, and what belongs in the `delivery` plugin. |
| [Layered Annotations](https://claude.ai/code/artifact/219b5bbb-8ea1-4ae2-8dbc-4cd10f4d6d19) | Annotations as a second fenced block in the chapter, their lifecycle, and what the app layer on top may not own. |
| [devbook Retrieval](https://claude.ai/code/artifact/a50fc1f6-413d-4767-aad8-45be44c85107) | How knowledge is retrieved: the canon is walked, never searched; semantic search belongs over the `_inbox` intake only, as a capability that may be absent. |

Name the artifact you validated against when reporting the change.

Before committing, run the checker and the generator over this repository's own knowledge:

```bash
node tools/check-assets.mjs && node plugins/devbook/tools/knowledge-meta/build.mjs --check
```

The first fails on a manifest, agent, or hook shape a host rejects or a decision forbids, and
reports body budgets. The second fails on a chapter whose `meta` block or reference does not
resolve. Run the generator without `--check` to refresh `_meta/` after a chapter edit, and
commit what it wrote.

## Committing

- Commit after every change, one logical change per commit. Diffs are how this repository is
  reviewed, so a commit that mixes two decisions hides both.
- Leave nothing uncommitted when handing back. Whenever the session stops for input, the
  working tree is clean.
- Never push and never open a pull request until asked. Committing locally is not publishing.

## Plugin layout

```
plugins/<name>/
  .claude-plugin/plugin.json      Claude manifest
  .github/plugin/plugin.json      Copilot manifest — same name, version, description
  agents/<role>.agent.md          frontmatter name must equal <role>
  skills/<skill>/SKILL.md
  instructions/*.instructions.md
  hooks/hooks.json                Claude hooks
  hooks.json                      Copilot hooks
  resources/
  assets/  tools/                 payload a sync skill copies into a repository
  migrations/<version>-<slug>/    MIGRATION.md plus an idempotent migrate.mjs --check
```

A new plugin also needs an entry in `.claude-plugin/marketplace.json` — `name`, `source`
(`./plugins/<name>`), `description`, `version` — or Claude Code will not offer it.

## Claude manifest

List agent files explicitly under `agents`, including `agents-internal/` ones, or handoff
targets dangle. Omit `skills` and `hooks`: Claude scans `skills/` and loads `hooks/hooks.json`
already, and naming the hooks file makes the plugin fail with "Duplicate hooks file detected".
Declare MCP servers under `mcpServers`.

## Agents

- `description` is required — Claude refuses to load an agent without one.
- No `model` pin unless the value is `opus`/`sonnet`/`haiku`/`fable`/`inherit` or a real
  `claude-*` id; anything else fails to load. Put the preference in a `## Model` body section.
- `tools` is an exact-match allowlist. Include `Skill` to let the agent reach plugin skills,
  and `Agent` only when it delegates.
- For MCP, grant the whole server and emit both spellings — `mcp__plugin_<plugin>_<server>`
  (plugin-provided, namespaced) and `mcp__<server>` (from a repo `.mcp.json`) — because the
  prefix depends on how the server was registered.
- Claude ignores the `handoffs` key: name every handoff target in the body prose.
- Claude does not auto-apply `applyTo`: reference instruction files by relative path.

## Skills

`skills/<name>/SKILL.md` with `name` and `description` frontmatter. The description is the
trigger — say when to use it, in the words a user would use. Keep host-specific tool names out
of skill prose.

## Hooks

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

Copilot reads `hooks.json` at the plugin root instead, where hooks are `type: prompt` and the
event names are camelCase (`sessionStart`, `preToolUse`). Both files are authored.

## Knowledge

`.devbook/` holds this repository's own knowledge as addressed chapters — `domain/` (the
vocabulary), `arc42/` (structure and decisions), `tech/`, `design/`, `ai/`. Load the chapters a
task names, not the folder, and reach the rest by walking `related` and `depends-on` from it —
the folders are walked, never searched. Every chapter carries a fenced `meta` block; write it
in the same change as the content, and never hand-edit a generated `_meta/` file.

## Writing

An asset is read by a model on every load, so prose costs context and vagueness costs
behaviour.

- Imperative, present tense, no hedging. "Run the suite before pushing", not "you may want to
  consider running the suite". A softened rule is a rule that does not fire.
- Cut what the model already does by default, and state each rule in exactly one file — point
  at it by relative path from everywhere else.
- Body budgets: `SKILL.md` 40 lines, `*.instructions.md` 60, `*.agent.md` 80. The budget is a
  disclosure trigger, not a hard limit: past it, move reference behind a pointer, split by
  branch, or state the reason in the file. Full rule:
  `plugins/spec-builder/instructions/authoring/spec-conciseness.instructions.md`. Staged
  procedures, converters, schema and contract instruction files, and the two runner agents are
  long by kind, recorded once in `.devbook/arc42/09-architecture-decisions.md` rather than in
  each file.
- A rule that must survive a long session says so in the asset, and repeats itself at the point
  of use. Instructions decay as context fills.
- Exempt safety-critical text from any terseness rule: confirmations before irreversible
  actions, and anything a fragment could make ambiguous, stay in full prose.

## Trying a change

```bash
claude plugin marketplace add JSdotNet/ai-agent-stack
```

During development, add this working copy by path instead of by repo, then `/plugin` to enable
what you are editing.
