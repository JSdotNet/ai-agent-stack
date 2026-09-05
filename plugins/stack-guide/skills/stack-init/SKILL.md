---
name: stack-init
description: 'Set a repository up for this marketplace for the first time — decide which plugins it will actually use, write the engine-owned keys of .github/ai-agent-stack.json (bindings, extensions, policy, gates), validate them against the schema, and then hand each component its own sync skill to materialize what it installs. Writes the engine keys only, never another component''s stamp. Use when: adopting the stack in a repository, wiring flows for the first time, or creating the stack config. Triggers on: "stack init", "set up the stack here", "adopt the delivery engine", "create ai-agent-stack.json", "wire up my flows", "onboard this repo".'
---

# stack init

## Purpose

Turn a repository with no stack config into one the engine can run in. This skill owns the
four engine keys — `bindings`, `extensions`, `policy`, `gates` — and nothing else. Every
`components.<name>` entry belongs to that component's own sync skill, which is the only
thing that knows what it materialized; writing one from here would record work this skill
did not do.

## Steps

1. **Look before writing.** Run `node scripts/stack-report.mjs --root <repository>` from
   this plugin's root. If it reports a `.github/ai-agent-stack.json` already present, stop
   and run `stack-update` instead — this skill is for the empty case.

2. **Decide what this repository will actually use.** Ask; do not impose a default shape.
   Bind only roles a plugin is installed for, and only extension points this repository
   really has a provider for. An unset key takes the engine's documented default, which is
   almost always better than a binding nobody maintains.

3. **Write the engine keys.** Start from the delivery plugin's
   `resources/ai-agent-stack-template.json` — take its checkout root from the report's
   catalog line, or the plugin's `installPath` from `--json` — and keep only the keys step
   2 chose. Read `instructions/surface-contract.instructions.md` in that same plugin for
   what each point and gate means. Never put a model or a secret in this file.

4. **Validate.** Run that plugin's `tools/stack-config/check.mjs` against the file. An
   unknown key is an error, not a warning: a typo must never become a silently absent
   setting. Fix and re-run until it exits `0`.

5. **Let each component install itself.** For every component this repository is adopting,
   invoke that component's own sync skill and let it materialize its payload and write its
   own stamp — `devbook:devbook-sync` for the knowledge folders. Do not copy a component's
   files by hand: a copy made here lands unstamped, and the next reconcile cannot tell it
   from a file someone deliberately customized.

6. **Verify and report.** Re-run the report, run each component's own check skill, and say
   plainly what was set up, what was deliberately left unbound, and anything that ended
   failing. A setup that ends on a failing check is reported as failing, never as done.

## Do not

- Do not write, edit, or remove a `components.<name>` key. It is not yours.
- Do not invent a policy switch, an extension point, or a gate purpose. All three sets are
  closed and declared by the engine; configuration chooses among behaviour it already has.
- Do not remove a gate. Configuration may add one anywhere and may never take one away.
