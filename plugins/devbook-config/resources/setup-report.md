# Setup report template

`init` and `update` close on this report, filled in and printed as the last thing in the reply.
Fill every section from the final `scripts/report.mjs` run, `devbook-config:doctor`, and what
this run did — never from memory. Keep the headings and their order so two runs compare line by
line; an empty section says `none`, never disappears. Drop these instructions and every
`<…>` placeholder from the output.

```markdown
## Devbook setup — <config id>

<init | update> by devbook-config@<version>, <YYYY-MM-DD>. Result: **<done | failing — what failed>**.

### This run

| Component | Before | After | What happened |
| --- | --- | --- | --- |
| `<component>` | <stamped version, or not adopted> | <stamped version> | <initialized / updated / migrations <ids> ran / <n> customized files left / skipped: <scope> / failed: <why>> |

Config: <engine keys written or changed, a retired key removed and why — or unchanged>.
Plugins upgraded by the user: <plugin old → new, or none>.

### Plugins

| Plugin | Installed | Newest | Scope |
| --- | --- | --- | --- |
| `<plugin>` | <version or –> | <version> | <reconcile / blocked / frozen / adoptable / enabled / available / out-of-scope> |

### Adopted

- **Devbook folders:** <`arc42`, `tech`, … from components.devbook, with its contract version>; not adopted: <…>.
- **Committed index:** <devbook-derived stamped, or not adopted>.
- **Change lane:** <devbook-openspec stamped and CLI version, or not adopted>.
- **Engine:** <delivery stamped, or not adopted>. Bound: <roles, tracker, extension points, and gates actually set>; policy: <switches set>. Everything else takes the engine default.

### Procedures

| Procedure | Where | State |
| --- | --- | --- |
| `<run / show / capture / debug / estimate / prototype>` | <path to the repository's copy> | <seeded / customized / orphaned> |

Flows reachable: <flow-* the installed delivery ships, or none — delivery not adopted>.

### Routines

| Schedule | Cadence | Target |
| --- | --- | --- |
| `<name>` | <cadence, marking an override> | <schedule-* skill> |

Scheduler: <created or updated on the host's page / prompts printed — no scheduler reachable / not adopted>.

### Still open

- <doctor finding, and the skill that fixes it>
- <a plugin not installed and therefore not offered or skipped>
- <no user overlay or model-selection file: `devbook-config:local` offered>
```
