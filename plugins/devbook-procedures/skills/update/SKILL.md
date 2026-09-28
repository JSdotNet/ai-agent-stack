---
name: update
description: 'Move a repository''s procedure skills — run, show, capture, debug, estimate, prototype — forward after upgrading devbook-procedures or changing which are adopted: refresh every wrapper and every body that still hashes to a shipped seed, seed a newly adopted procedure, orphan a dropped one, and re-stamp components.devbook-procedures. Refused where no stamp exists: run devbook-procedures:init. Use when: upgrading devbook-procedures, a run, show, capture, debug, estimate, or prototype skill is missing, a start skill is still there, or the adopted list changed. Triggers on: "devbook-procedures update", "update devbook-procedures", "upgrade devbook-procedures", "adopt the debug skill", "adopt the estimate skill", "adopt the prototype skill", "drop the show skill".'
user-invocable: false
---

# devbook-procedures update

Open the reply with `devbook-procedures@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

Reconcile what `devbook-procedures:init` wrote with the installed release. What lands is
`../init/SKILL.md` under *What lands*; the shape and the goal are `assets/skill-wrappers.md`;
the stamp and the hashes are `assets/reconcile-protocol.md` in the devbook plugin under
**The stamp**. None of it is repeated here. This plugin writes `components.devbook-procedures`
and touches no other entry.

**Refuse when `components.devbook-procedures` is absent.** Say "not initialized, run
`devbook-procedures:init`" and stop.

## The run

1. **Migrate.** Run `../../migrations/001-start-is-run/migrate.mjs --check` with node, the
   repository root as the working directory; while it exits `1`, show its plan, run it without `--check`, and report
   what moved. It turns a `start` procedure into the `run` recipe and its Copilot twin.
2. **Resolve.** `adopted` from the stamp is the list. Never re-ask what it answers; a
   procedure is added or dropped only when the user asks for it.
3. **Detect**, **Plan**, **Materialize** exactly as `init` steps 2–4, with one more plan
   row: a name dropped from `adopted` orphans its three files — reported, never deleted.
4. **Stamp.** Rewrite `components.devbook-procedures` — `pluginVersion`, `adopted`, and
   `materialized`.
5. **Report** what moved, name every customized file left alone, name each shipped
   procedure missing from `adopted` as available without asking about it, and leave the
   commit to the user.
