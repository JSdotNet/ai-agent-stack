---
name: stack-update
description: 'Bring a repository already on this marketplace forward — refresh the catalog, report which installed plugins are behind the newest published version, re-validate the engine-owned keys of .github/ai-agent-stack.json against the schema, and hand each adopted component its own sync skill so outstanding migrations run and stale files are re-materialized. Use when: upgrading the stack, a plugin is out of date, a migration is outstanding, or the config no longer validates after an upgrade. Triggers on: "stack update", "upgrade the stack", "am I on the latest", "update my plugins", "run outstanding migrations", "the config stopped validating".'
---

# stack update

## Purpose

Move a repository that is already set up onto the installed release. It is `stack-init`'s
other half and owns the same four engine keys, with the same boundary: a
`components.<name>` stamp is written by that component's own sync skill and by nothing
else. Run it whole every time — a version bump, a migration, and a config change are one
operation, and the report is what says which of them applies.

## Steps

1. **Refresh, then look.** Update the marketplace catalog through the host, then run
   `node scripts/stack-report.mjs --root <repository>` from this plugin's root. A clone
   older than the source is the common cause of "already latest" being wrong.

2. **Report the drift before changing anything.** From the report: rows saying
   `update available`, rows enabled but not installed, and rows installed but missing from
   the catalog. Show it and let the user choose. If the report finds no
   `.github/ai-agent-stack.json`, this repository was never set up — run `stack-init`.

3. **Update the plugins the user approves**, through the host's own plugin command. This
   skill does not reach into the host's plugin cache.

4. **Let each component reconcile itself.** For every component with a stamp, invoke that
   component's own sync skill — `devbook:devbook-sync` — and let it run its outstanding
   migrations oldest first, overwrite what is stale, leave what is customized, and rewrite
   its own stamp. A migration applied from here would leave the ledger describing something
   that did not happen.

5. **Re-validate the engine keys.** Run the delivery plugin's `tools/stack-config/check.mjs`
   against the config; take its checkout root from the report's catalog line, or the
   plugin's `installPath` from `--json`. An upgrade can retire a key, and an unknown key is
   an error rather than a silently absent setting. Fix against
   `instructions/surface-contract.instructions.md` in that same plugin.

6. **Verify and report honestly.** Re-run the report and each component's own check skill.
   Name what was upgraded, what migrations ran, what was left customized, and anything
   still outstanding. An update that ends on a failing check is reported as failing.

## Do not

- Do not write, edit, or remove a `components.<name>` key, and do not apply a component's
  migration yourself. Both belong to that component's sync skill.
- Do not edit a generated file to make a check pass. Fix the source it was generated from.
- Do not silently drop a key an upgrade retired — say it was removed and why.
