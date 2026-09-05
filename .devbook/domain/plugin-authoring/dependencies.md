# Plugin Authoring

```meta
type: dependencies
related: [".devbook/domain/context-map.md#plugin-authoring", ".devbook/tech/hosts.md#claude-code-plugin-api", ".devbook/tech/hosts.md#copilot-plugin-api"]
```

> What this context depends on and who depends on it. The hosts sit outside the boundary and
> are conformed to; the repositories that adopt a plugin sit outside it and are supplied.

## Outbound dependencies

| Depends on (context/module) | DDD pattern | Integration mechanism | Contract | Why |
|---|---|---|---|---|
| Claude Code Plugin API | Conformist | Files read at load: `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json`, `skills/`, `hooks/hooks.json` | The manifest schema `claude plugin validate --strict` enforces | The host decides what loads; this context has no say in the shape and writes to it. |
| Copilot Plugin API | Conformist | Files read at load: `.github/plugin/plugin.json`, `hooks.json`, `applyTo` globs, `handoffs` | The manifest and frontmatter shapes that host documents | Same host relationship, second reader. Both hosts ignoring unknown keys is what lets one file serve both. |

## Inbound dependents (known)

| Consumer (context/module) | DDD pattern | Integration mechanism | Contract | What it relies on |
|---|---|---|---|---|
| A consuming repository | Customer-Supplier, this context supplying | Install by `plugin@jsdotnet`; a sync skill copies payload and writes the stamp under `components.<name>` in `.github/ai-agent-stack.json` | Plugin name and version, the contract version, migration ids, the stack-config schema `delivery` ships | Names never renamed after release, migrations never rewritten, one component never writing another's key. |
| The delivery engine and its bridges | Customer-Supplier, this context supplying | `plugin:asset` references from `delivery` and `devbook-flows` into the role plugins | The asset names those references spell | A reference that resolves to nothing costs a stage, not a load — which is why a role is bound, never depended on. |

## Notes

- Both outbound rows are Conformist by choice: there is no anti-corruption layer between an
  asset and its host because the asset *is* the host's format. The cost is paid in the
  authored file, see [One Authored Copy Per Asset](../../arc42/09-architecture-decisions.md#one-authored-copy-per-asset).
- Nothing here depends on a host's runtime behaviour — how it ranks a skill, when it applies
  an instruction — which is what keeps the boundary in [domain.md](domain.md) honest.
