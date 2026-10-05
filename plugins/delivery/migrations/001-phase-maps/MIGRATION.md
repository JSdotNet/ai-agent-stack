# 001 — extensions, roles, and MCP bindings become phase maps, from 1.14.0

```meta
appliesTo: [delivery]
breaking: yes
```

## What

The engine's configuration moved from extension points and roles to one `phases` map per flow,
per `.devbook/arc42/adr/configuration.md` in the marketplace. The script rewrites the committed
`.devbook/config.json` and both overlay layers under the devbook config directory:

| 1.13.0 | 1.14.0 |
| --- | --- |
| `extensions.session.start` · `flow.start` · `flow.end` | `phase-update-base.before` · `phase-scope.after` · `phase-summary.after`, in both maps |
| `extensions.spec` | flow-code `phase-scope.skill`: the spec it returns is built from, and flow-spec builds none |
| `extensions.deliver` | `phase-create-pr.skill`, in both maps |
| `extensions.implement` | flow-code `phase-implement.agent`, or `.skill` when the provider is one; `null` is `agent: null` |
| `extensions.validate` · `verify` | flow-code `phase-build-test.skill` · `phase-spec-check.skill` |
| `extensions.app.start` | flow-code `phase-verify.app`, as written — except the retired `repo:start` or `delivery:phase-validation`, which is dropped, or becomes `repo:run` when it carries options |
| `extensions.qa.run` | flow-code `phase-verify.agent`, or `.skill` when the provider is one; `null` writes nothing |
| `extensions.data.prepare` | flow-code `phase-verify.before` |
| `delivery.roles.architecture` | `phase-scope.agent` in both maps, flow-code `phase-plan`, flow-spec `phase-drafting:arc42` and `:tech` |
| `delivery.roles.qa` | flow-code `phase-verify.agent`, unless `qa.run` set the agent; beside a `qa.run` skill it lands |
| `delivery.roles.domain` · `ux` · `docs` | flow-spec `phase-drafting:domain` · `:design` · `:ai` |
| `delivery.roles.product` · `security` | dropped, and reported: no phase names them |
| `delivery.mcp.<point>` | `phases.<phase>.mcp`, the phase the point belonged to; two points on one phase join |
| `gates[].at` on a point | the phase id that point belonged to — `deliver` is `create-pr`, `verify` is `spec-check` |
| `phases.flow-update-packages` · `phases.flow-project` | merged into `phases.flow-code`; what flow-code already sets wins |
| `policy["phases.verification"]` · `["phases.workItemUpdate"]` | `policy["phases.specCheck"]` · `["phases.reportBack"]`, named for the phase each switches; a new name already set wins |
| `policy["validate.retryBudget"]` | dropped, and reported: `review.retryBudget` and `ready.retryBudget` bound the only loops |
| `gates[].unattended: "skip-point"` | `"skip-phase"` |

In the committed file both maps come out complete: a phase the old config never named is `{}`.
An overlay stays partial and names only what it said. A role or provider bound to a bare plugin
resolves to that plugin's single agent; a plugin with more than one, or one not installed here,
is written as found and reported. Options on a service point other than `app.start` have no
place in a phase entry and are reported as dropped. `extensions.qa.run: null` meant no QA provider bound. It writes nothing, so `phase-verify` runs
its own procedure and a `qa` role still lands as its agent; `agent: null` would instead force the
phase inline, which the old value never said. `implement: null` keeps meaning inline. A
`repo:start` left in any layer — devbook's `004-start-binding-is-run` retires it only in the
committed file, and only when it runs first — is never carried, nor the
`delivery:phase-validation` an earlier 004 wrote in its place: the run recipe is
`phase-verify`'s default. Every other key and `components` are left
as they are; the file is re-serialized in its own indent and key order, `phases` where
`extensions` was. The policy and gate renames run in a file already on the phase maps as well, and
leave everything else in it as it is.

## Why

1.14.0's checker refuses `extensions`, `delivery.roles`, `delivery.mcp`, a gate on an
extension point, a map under a retired flow, the three retired policy keys, and `skip-point` by
name, so a repository on the old shape stops
validating until it is rewritten.

## What breaks

Nothing that worked, once the script has run. Two things it cannot settle are reported for a
person: a bare plugin with several agents, and a service point's options. A gate on `verify` in
a file holding nothing else 1.13.0 is read as the 1.14.0 verify phase, not as spec-check — check
it by hand. A personal `model-selection.md` is not this script's: `devbook-config:local`
converts it into overlay phase entries.
