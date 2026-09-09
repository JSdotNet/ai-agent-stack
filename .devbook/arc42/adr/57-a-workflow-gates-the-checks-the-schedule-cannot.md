# 57. A Workflow Gates the Checks the Schedule Cannot

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/29-automation-owns-the-_meta-refresh.md", ".devbook/ai/03-verify.md#plugin-evaluation"]
```

Three checks decide whether this repository's assets load: `tools/check-assets.mjs` over the
manifests, agents, and hooks; the generator's `--check` over `.devbook/`; and `claude plugin
validate --strict` over the marketplace and every plugin manifest. All three passed when run by
hand, and nothing ran them. `AGENTS.md` named the first two as a pre-commit instruction and the
validator not at all, so the one check that knows the host's current manifest schema — the only
thing that catches an unknown field or a bad dependency range — ran when somebody remembered.

**`.github/workflows/repo-checks.yml` runs all three on every pull request and every push to
`main`.** A check that cannot block a merge is a report, and this repository is reviewed by its
diffs: a manifest that a host rejects has to fail before it lands, not the next morning.

**This narrows [record 29](29-automation-owns-the-_meta-refresh.md); it does not reverse it.**
That record's rule is about the *refresh* — automation owns it, a session runs `--check` and
never regenerates. It observed the absence of `.github/workflows/` as evidence that no refresh
path existed, not as a rule that none may exist. The new workflow never regenerates and never
commits `_meta/`; `--check` only reads. So the single refresh path stands, `devbook-check` still
owns it, and the deny rule in `.claude/settings.json` is untouched.

**The schedule was the alternative and it does not fit twice over.** It runs daily on the
default branch, so it finds a broken manifest after the merge it should have stopped. And
`schedule-catalog-contract.md` says a schedule is a trigger and never a procedure: it names a
skill, and no skill runs this repository's own asset checks — `tools/check-assets.mjs` is
repo-local, not a plugin asset. Extending the catalog would have meant inventing a skill for one
consumer, or writing a body that restates the procedure the contract forbids.

**The CLI install is deliberately unpinned.** The validator is worth running because it tracks
the host's schema; pinning it freezes the one thing it is there to catch. The cost is a release
of the CLI turning the gate red without a change here, and the fix when that happens is to read
what the validator now rejects rather than to pin around it.

Consequence: the repository has its first workflow, and `.github/` now holds CI beside the
Copilot instruction wrappers. The nine Node suites under `plugins/*/tools/` are still run by
nobody — they were left out of this gate deliberately, and adding them is a separate call.
