# Upgrading delivery

Behaviour changes a consumer would notice, newest first.

## 2.5.0: the pull request skills read the `pr-lane` slot

**Not breaking. Nothing you have configured changes meaning, and no key moves.**

`pr-merge-ready`, `update-pr-branch`, `fix-pr-checks`, `push-branch`, and `flow-repo` used to
call `gh` directly, so a session without the CLI failed on a missing binary. Each now states
the `pr-lane` slot read before its first command and degrades to *no pull request* — the
default that slot has always documented:

| Skill | With no lane bound |
| --- | --- |
| `pr-merge-ready` | Reports the branch and ends the pass |
| `update-pr-branch` | Takes the base from the repository default and works from git alone |
| `fix-pr-checks` | Says so and stops — the failing job logs were its whole input |
| `push-branch` | Pushes, and drops the pull request status line |
| `flow-repo` | Writes the settings as file artifacts and reports them as manual follow-up |

With `gh` present nothing changes: the commands stay in the prose as the lane's `gh` spelling.
Bind the lane explicitly under `bindings["delivery.slots"]` in `.devbook/config.json` to name
a different pull-request CLI or API.

## 2.4.0: the two pickup skills go through the tracker binding

**Breaking in one place: a skill was renamed.** Nothing you have configured changes meaning,
and no key moves.

### `azure-sre-to-github-issue` is now `sre-alerts-to-work-items`

The old id named the tracker in the skill's own identity, which
`bindings["delivery.tracker"]` exists to prevent — see **A Tracker Is a Binding, Not a Phase
Name** in the devbook. Azure is the alert *source* and stays in the name; GitHub was the
tracker and is gone from it. If you invoke the skill by name from a schedule, a routine, or a
repository's own instructions, update the id. Nothing else referenced it.

### Both pickup skills name tracker operations, not `gh`

`start-session-from-issue` and `sre-alerts-to-work-items` used `gh issue list`, `gh issue
create`, and `gh issue edit` directly, and offered Jira only as a closing aside. They now
name `find_item`, `read_item`, `create_item`, `comment`, and `transition`, resolved from
`bindings["delivery.tracker"]` like every other tracker touchpoint in the engine.

On a repository bound to `github` the behaviour is what it was: the operations resolve to the
same GitHub calls. On one bound to `jira` or `markdown` the two skills work for the first
time instead of assuming GitHub. With no tracker bound, `start-session-from-issue` stops —
there is nothing to pick up — and `sre-alerts-to-work-items` reports the alerts it would have
filed and creates nothing.

Their inputs generalized with them: a repository in `owner/repo` became the target the bound
tracker addresses, and an issue number became an item id. Both still accept what they did
before when the binding is `github`.

**Bindings → Tracker** in `resources/surface-contract.md` now says how any tracker operation
resolves — the bound tracker's own tooling first, then the host's CLI for it.

## 2.3.0: the engine owns the capture contract, and seeds two procedures

**Nothing you have configured changes meaning, and no key moves.** Two checks get stricter —
see *The config check* below.

### Capture no longer depends on a QA plugin

Every rule about what evidence a run captures used to live in two skills of an external QA
plugin. A repository that bound no `qa.run` provider therefore got no capture rules at all,
and the QA Validation phase could only hope one was installed.

`resources/capture-contract.md` is now engine-owned and the phase enforces it directly. It
says what is captured, when it is required, what comes back, and that an unavailable capture
marks the stage `blocked` rather than degrading it — **with or without** a QA plugin, a
`qa.run` binding, or a capture skill.

Capture resolves in a named order, reported once in the stage output:

1. the repository's own `capture` skill,
2. the `qa.run` provider's capture, when it has one,
3. the phase, driving the browser server itself.

If you relied on `qa:playwright-screenshot` or `qa:playwright-recording`, nothing breaks
today — a bound provider is still consulted second. Those two skills are being removed from
the QA plugin separately; the contract is what you point at from here.

### `delivery:install` is new, and optional

The first install skill this plugin has had. It writes two seeds into a repository:

| Seed | Lands at | Fills |
|---|---|---|
| `start` | `.agents/skills/start.md` + a wrapper per host | the `app.start` point, as `repo:start` |
| `capture` | `.agents/skills/capture.md` + a wrapper per host | evidence capture inside QA Validation |

Edit the copy under `.agents/skills/` — that is what it is for. Once its hash matches no
release, it is yours: reported on every later reconcile, never overwritten. The wrappers stay
managed, so the name and description a phase matches on keep refreshing.

Running it is not required. Skipping it leaves the engine exactly where it was: `app.start`
falls back to `phase-qa-validation`, and capture runs from the contract.

### The config check catches two things it used to wave through

`node tools/stack-config/check.mjs` now fails on a **top-level** key that is neither
engine-owned nor `components`. `polciy` used to validate clean and take every default in
silence, which is the one failure the whole "unknown key is rejected" rule exists to prevent.
The test is ownership, not a list: `components` and each component's entry under it are
untouched, and a `$schema` or `$comment` annotation is still allowed.

If your config carries a stray top-level key, the check reports it by name and exits 1. Fix
the spelling or move the key under `components.<name>`; nothing was reading it.

`policy["pr.base"]` is now checked against the shape of a git ref name, so `"the default
branch"` is refused where any non-empty string used to pass. Whether the ref *exists* is still
resolved at flow time — Update Base fetches it, the pull-request lane opens against it — and
the check never touches the network. The contract and the decision that both claimed the check
resolved it now say so.

### `.claude/flow-context.md` is facts only

The file's stated purpose claimed that interactive startup — the URL to open, sign-in, an
area map — could live in it, which neither its schema nor its template ever offered. That
claim is gone. The file holds **declared facts**; the procedure that acts on them is the
`start` skill. Nothing in an existing context file needs changing.

## 2.2.0: the Personal Validation handoff becomes a phase skill

**Not breaking. No configuration changes, and no migration.** The stage keeps its name, its
place in every tier, and its recorded `approval` values, so an existing run, an existing
`.devbook/config.json`, and an existing surface all behave as before.

What changed is that the phase's two halves are now separate. The **review handoff** — bring
the application up and confirm it healthy, publish the review links, say what to check by
hand, present the code and QA reviews — moved out of `resources/flow-phases.md` into
`skills/phase-personal-validation/SKILL.md`, joining `phase-build-test` and
`phase-qa-validation`. The **gate** stayed where it was.

Three things a consumer will actually see:

- **The links arrive as clickable URLs in the conversation**, not only as `links` on the
  stage. A run with no surface bound used to hand back with nothing to click.
- **The handback now says what to check by hand** — a short list derived from the change set
  and the acceptance criteria, leading with what QA cannot judge. Nothing produced one before.
- **The handoff re-runs on every revise round**, so a revised change set is presented from
  scratch rather than pointing back at the previous handback.

The gate is unchanged and stays unconfigurable: `policy.gate.personalValidation` is still
`required` and nothing else, an overlay still cannot name it, and the skill presents without
ever deciding. A repository that wants an extra checkpoint declares one **in front of** it in
`gates`, which is what that array was always for.
