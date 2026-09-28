---
name: status
description: 'Report where a change under openspec/changes/ stands in one table — OpenSpec''s artifact progress, every step''s state, the verify-change verdict for every delta, and both gates, approval and acceptance, each with whether its fingerprint still holds — and name the one next move. Writes nothing. Use when: "where is this change", "what is left before I can accept it", "can this change be archived", "is the approval still current", or before devbook-openspec:archive. Triggers on: "devbook-openspec status", "change status", "status of the change".'
---

# devbook-openspec status

Open the reply with `devbook-openspec@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

OpenSpec's `status` answers whether the artifacts are written; this answers whether the change
is agreed, built, and ready to fold in. One change, or every open one when none is named. Write
nothing: every edit this report points at is a person's or another skill's.

1. **Artifacts.** `openspec status --change <name> --json`: each artifact's state and whether
   the change is complete. `node .devbook/_tools/devbook-meta/delta.mjs --check <name>`: every
   delta resolves, or which does not.
2. **Steps.** Each step of `tasks.md` with its state, read exactly as
   `../tracker/SKILL.md` reads it, its `owner`, and its pull request.
3. **Verdicts.** Run `devbook:verify-change` over the chapters the deltas target, which reads
   an agreed change as pending truth. One row per delta: the verdict, and for `code-ahead`
   whether it is `covered by change <name>, step N`. Where `verify-change` is not installed, say
   the column is empty and why.
4. **Gates.** From `proposal.md`'s file block: `status`, who approved and accepted it and when,
   and whether each `-hash` still equals `node .devbook/_tools/devbook-meta/chapter-hash.mjs
   openspec/changes/<name>`. A hash that no longer matches is a lapsed gate, not a passed one.
   Any open `kind: question` fence in the proposal or a delta is listed: it blocks both gates.
5. **Next move**, exactly one: approve (`devbook-collaboration:chapter-approve` on the change),
   build the first open step (`/opsx:apply`), fix a verdict, accept
   (`devbook-collaboration:chapter-accept` — every step `done` and every delta aligned), or
   archive (`devbook-openspec:archive` — accepted, both hashes current).
