# Upgrading delivery

Behaviour changes a consumer would notice, newest first.

## 2.2.0: the engine owns the capture contract, and seeds two procedures

**Not breaking. Nothing you have configured changes meaning, and no key moves.**

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

### `.claude/flow-context.md` is facts only

The file's stated purpose claimed that interactive startup — the URL to open, sign-in, an
area map — could live in it, which neither its schema nor its template ever offered. That
claim is gone. The file holds **declared facts**; the procedure that acts on them is the
`start` skill. Nothing in an existing context file needs changing.
