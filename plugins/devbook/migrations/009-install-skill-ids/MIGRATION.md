# 009 — every install skill is called `install`

```meta
contractVersion: 9
appliesTo: [arc42, domain, tech, design, ai]
breaking: yes
```

## What

Three install skills lost the prefix that repeated their own plugin's name:

| Was | Is |
| --- | --- |
| `devbook:devbook-install` | `devbook:install` |
| `devbook-collaboration:collaboration-install` | `devbook-collaboration:install` |
| `delivery-schedule:schedule-install` | `delivery-schedule:install` |

A repository names these ids in `extensions`, so the rename reaches committed
files and this migration rewrites them.

## Why

Every plugin that installs something now spells the operation the same way, so
knowing one plugin's install skill means knowing all of them. The plugin half of
`plugin:skill` already carries the scope, which is what made the prefix a second
copy of the plugin name rather than information. The decision is
`.devbook/arc42/adr/39-every-install-skill-is-called-install.md`
in the marketplace.

## What breaks

An `extensions` point naming an old id resolves to a skill that no longer
exists. The engine degrades rather than failing there — a chore whose provider
does not resolve is reported and skipped — so until this runs the symptom is a
documentation update or a schedule reconcile that quietly stops happening, not a
run that stops.

Nothing else moves. No stamp key changes: `components.devbook`,
`components.collaboration`, and `components.schedule` were never named after the
skill that writes them.

## Run it

```bash
node migrate.mjs --check
```

`--check` exits `1` while work remains and `0` when the repository is clean; it
writes nothing, and it is what CI and the plan phase of `devbook:install` call.
Drop the flag to apply. Running it twice changes nothing. Both forms take
`--root <path>`, defaulting to the working directory.

## What the script does, and does not

It rewrites the three ids under `extensions` in `.devbook/config.json` and, when
present, in the gitignored `.devbook/config.local.json` — an overlay names
providers with the same vocabulary, and one left behind keeps pointing at a
skill that is gone.

It touches only the two keys that hold a provider id, `provider` and `run`. A
gate `prompt` quoting the old name in prose is left exactly as written: this
migration renames bindings, not sentences.
