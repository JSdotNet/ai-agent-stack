# 25. Devbook Payload Named After Its Plugin

```meta
date: 2026-09-05
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/domain/plugin-authoring/domain.md", ".devbook/arc42/05-building-block-view.md#plugin-folder", ".devbook/arc42/adr/2-one-folder-per-plugin.md", ".devbook/arc42/11-risks-and-technical-debt.md"]
```

Every `knowledge-` name inside `devbook` becomes `devbook-`: the two tool folders
(`tools/devbook-meta`, `tools/devbook-tech`), the two shipped workflows, the nine instruction
files, the `devbook-tech-update` skill, `assets/build/Update-DevbookIndex.ps1`, and the module
constants (`DEVBOOK_FOLDER_NAMES`, `DEVBOOK_PATH_PREFIX`) behind them. `knowledge` survived
this decision as the English word for what a chapter holds, and no longer does — see
[The Word Knowledge Is Retired](35-the-word-knowledge-is-retired.md).

The prefix was the old plugin's name, `knowledge-base`. The canvas extension was already
renamed on this reasoning — see [devbook Still Ships the Graph Canvas](5-devbook-still-ships-the-graph-canvas.md) — and leaving the payload
behind left one plugin shipping two vocabularies. It also broke the naming rule the convention
states about itself: a name does not repeat what its location already says, and inside
`plugins/devbook/` the old prefix said nothing except which plugin used to own the folder.
`devbook-` is not redundant at the *destination*, which is the shared `.github/tools/`,
`.github/workflows/`, and `.github/instructions/` of a consuming repository.

**Consequence, and the part that is not yet closed: the renamed assets are payload.** A
repository synced before this rename holds `.github/tools/knowledge-meta/`,
`.github/workflows/knowledge-meta*.yml`, `.github/instructions/knowledge-*.instructions.md`,
and `build/Update-KnowledgeIndex.ps1`, all recorded under those keys in the stamp's
`materialized` map. Re-syncing installs the new names beside the old ones rather than over
them — exactly the two-spellings outcome the plugin README tells adopters to avoid. Closing it
needs a migration that moves the six materialized paths, rewrites the references inside them,
and rekeys the stamp; that migration is not written, so it is carried as debt in
[chapter 11](../11-risks-and-technical-debt.md) rather than claimed here.

Migration `006-drop-backlog` is the one asset the rename could not simply follow. It runs
*before* a repository is renamed, so it now matches both workflow spellings; its id and its
contract version are unchanged, because a shipped migration is never rewritten into something
different, only made to keep working.
