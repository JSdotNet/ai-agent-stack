# 27. One Rule, One Wrapper Per Host

```meta
date: 2026-09-07
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/3-one-authored-copy-per-asset.md", ".devbook/arc42/adr/4-no-generated-sync-layer.md", ".devbook/arc42/adr/28-devbook-owns-one-section-of-agentsmd.md", ".devbook/domain/plugin-authoring/domain.md#plugin-rule"]
```

Both hosts inject rules scoped to a path glob, and no single file can serve both: Claude reads
`.claude/rules/*.md` with a `paths` list, Copilot reads `.github/instructions/*.instructions.md`
with `applyTo`. Different directory, different filename, different key. So this repository used
neither, and `CLAUDE.md` carried 154 lines that loaded on every session whatever was being
edited.

[One Authored Copy Per Asset](3-one-authored-copy-per-asset.md) does not stretch here — it rests on
both hosts ignoring keys they do not know, and these two disagree on the *filename*. The
layering used for manifests and hooks applies instead: one authored rule, a thin wrapper per
host.

```
.agents/rules/<topic>.md            the rule. One copy. name / description / paths.
  ├── .claude/rules/<topic>.md      wrapper: paths verbatim → pointer
  └── .github/instructions/<topic>.instructions.md
                                    wrapper: applyTo = paths.join(",") → pointer
```

A wrapper is frontmatter and one sentence. It never restates a rule, so a third host adds a
third wrapper and never a second copy. Because `applyTo` is exactly `paths.join(",")`, the
wrappers are derivable from the shared file and `tools/check-assets.mjs` fails on drift — a
checker over hand-authored files, which is the bargain
[No Generated Sync Layer](4-no-generated-sync-layer.md) already struck.

Three things follow, and each is deliberate:

- **`.agents/rules/` is a local convention, not a standard.** `AGENTS.md` is the standard for
  the *root* file and defines no globs; its answer to scoping is nested files, closest-wins.
  [agents.md#179](https://github.com/agentsmd/agents.md/issues/179) is the open proposal for
  glob-scoped rules, and its `name` / `description` / `paths` shape is what this uses.
- **A plugin cannot ship rules.** There is no rules component, no `rules` key in
  `plugin.json`, and a plugin-root `CLAUDE.md` is not loaded
  ([claude-code#21163](https://github.com/anthropics/claude-code/issues/21163)). Everything
  under `.agents/rules/` is repository-scoped: it serves people working *in* this repository,
  never someone who installed a plugin from it. A plugin instruction file keeps its filename
  and its glob, both part of the plugin contract, but is authored in the same host-neutral
  frontmatter as everything here. Reaching a *consumer* is the install skill's job, not the
  wrapper's, and
  [A Plugin's Rules Reach a Host Through the Install](37-a-plugins-rules-reach-a-host-through-the-install.md)
  settles how.
- **A rule that already has one home both hosts read stays there.** The topic set is plugin
  authoring only.
- **The root file is `AGENTS.md`, and each host gets a root wrapper pointing at it.**
  `CLAUDE.md` is an `@AGENTS.md` import; `.github/copilot-instructions.md` is one sentence
  telling Copilot to read it. Only the Claude wrapper is load-bearing — Copilot resolves
  `AGENTS.md` natively and Claude does not — but the root files then follow the same
  wrapper-per-host shape as the rules above, and Copilot still lands on the rules on a
  surface that does not resolve the root file. That is the same choice
  [devbook Owns One Section of AGENTS.md](28-devbook-owns-one-section-of-agentsmd.md) made for the
  file devbook writes into, and it makes the `repo-instructions` slot resolve here for the
  first time.

The topic set stops at plugin authoring. `.devbook/**` gets no topic, because
[devbook Owns One Section of AGENTS.md](28-devbook-owns-one-section-of-agentsmd.md) already puts
the folder routing table and the `_meta/` rule in front of both hosts, and a second copy here
would be exactly what this layering exists to prevent. Where a rule already has one home that
both hosts read, it keeps it.

Consequence: six authored files and twelve wrappers where there were none, against a `CLAUDE.md`
that shrank from 154 lines to four. The context cost is lower, not higher — only the running
host's wrapper loads, and only on a matching read. The cost is paid in file count and in a
checker rule.

That rule is `check-assets.mjs`'s `rules` pass, and it refuses six things: a shared file whose
`name` does not match its filename or that carries no `paths`, a missing wrapper on either
side, a Claude wrapper whose `paths` differ, a Copilot wrapper whose `applyTo` is not those
paths comma-joined or whose `description` differs, a wrapper body past three lines, and a
wrapper with no shared file behind it. The fifth is the one the layering actually rests on:
a wrapper that grows a rule is how the second copy gets in.
