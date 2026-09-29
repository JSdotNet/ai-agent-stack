---
name: update
description: 'Move a repository''s change lane forward after upgrading devbook-openspec or the OpenSpec CLI — check the CLI against the stamped range, run openspec update, replace the devbook schema and the change-folder rule wherever they still hash to what this plugin wrote, report the customized ones, and re-stamp components.openspec. Never rewrites openspec/config.yaml. Refused where no components.openspec stamp exists: run devbook-openspec:init. Use when: upgrading devbook-openspec, a new OpenSpec release, the schema or rule is stale. Triggers on: "devbook-openspec update", "update devbook-openspec", "upgrade the change lane", "openspec update".'
---

# devbook-openspec update

Open the reply with `devbook-openspec@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

Reconcile what `devbook-openspec:init` materialized with the installed release. What lands and
the CLI check are `../init/SKILL.md`; the stamp and hash rules are devbook's
`assets/reconcile-protocol.md` under **The stamp**. Neither is repeated here.

**Refuse when `components.openspec` is absent**: say "not initialized, run
`devbook-openspec:init`" and stop — with no stamp, every file on disk reads as customized.

1. **The CLI.** `openspec --version` against `components.openspec.cli`. Outside it, report the
   installed version and the range and stop; never install, and never widen the range yourself.
2. **Detect.** Hash every path in `components.openspec.materialized` and compare it with its
   stamped hash. Equal is stale-or-current and replaceable; different is customized.
3. **Plan.** One table — `update`, `skip-customized`, `orphan` — and write nothing. Never skip
   this, not even when the plan is empty. A path this release no longer ships is an orphan:
   reported, never deleted. `openspec/config.yaml` is always `skip`: it is the repository's.
4. **Run `openspec update .`** from the repository root, with `OPENSPEC_TELEMETRY=0` when the
   overlay's `ext["devbook-openspec"].telemetry` says so. It refreshes OpenSpec's own skills
   for the stamped `tools` and touches neither the schema nor the config.
5. **Materialize.** Overwrite only what step 2 found replaceable. Delete `openspec/specs/`
   again when it holds nothing but `.gitkeep`.
6. **Stamp.** Rewrite `components.openspec` — `pluginVersion` and `materialized`; keep `cli`,
   `tools`, `prototype`, and `workflow` as they were. A stamp without `workflow` reads as
   `single-branch`; leave it absent rather than writing a choice nobody made.
7. **Verify and report** exactly as `init` does, and leave the commit to the person.
