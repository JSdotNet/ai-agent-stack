# 008 — the stack config moves to `.devbook/config.json`

```meta
contractVersion: 8
appliesTo: [arc42, domain, tech, design, ai]
breaking: yes
```

## What

The one file a repository commits for the whole stack is now
`.devbook/config.json`. It was `.github/ai-agent-stack.json`. devbook's stamp —
`components.devbook` — moves with it, unchanged in shape.

## Why

`.github/` is one host's folder, and both hosts read this file. `.devbook/`
already holds the repository's own account of how it works, and the wiring it
declares belongs beside the folders it adopted. The decision is
`.devbook/arc42/09-architecture-decisions.md#the-stack-config-lives-in-devbook`
in the marketplace.

## What breaks

Nothing reads the old path any more, and there is no fallback — two supported
paths is two places for a repository to disagree with itself. Until this runs:

1. `devbook-check` finds no stamp and reports the repository as never
   reconciled, whatever is actually materialized.
2. The delivery engine finds no `bindings`, `extensions`, `policy`, or `gates`,
   so every role, extension point, and policy switch silently falls back to its
   default. That is the dangerous one: the run does not fail, it just stops
   doing what the repository asked for.
3. `delivery-schedule` finds no `components.schedule`, so `schedule-status` has
   no selection to read.

## Run it

```bash
node migrate.mjs --check
```

`--check` exits `1` while work remains and `0` when the repository is clean; it
writes nothing, and it is what CI and the plan phase of `devbook:install` call.
Drop the flag to apply. Running it twice changes nothing. Both forms take
`--root <path>`, defaulting to the working directory.

## What the script does, and does not

It moves the file whole — every top-level key, every component's stamp, byte for
byte — and creates `.devbook/` when the repository keeps its folders flat.
It rewrites no key, because none of them changed.

It refuses rather than guesses when both files exist and differ: two configs
with different content is a merge only a person can make, and picking one would
discard settings nobody agreed to lose. Identical, it deletes the old one.
