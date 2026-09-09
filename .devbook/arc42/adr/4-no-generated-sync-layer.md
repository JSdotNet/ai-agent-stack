# 4. No Generated Sync Layer

```meta
date: 2026-09-02
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/tech/tooling.md#powershell"]
```

A generator that derived the Claude-side files from the Copilot ones was written, verified, and
then dropped: it bought consistency for a plugin set that does not exist yet, and it made every
Claude manifest a file nobody was allowed to edit. Both manifests are hand-authored instead.

Consequence: what the generator used to lint — a missing description, an unloadable model pin,
a handoff the body never mentions — is now a review responsibility, written down in
[AGENTS.md](../../../AGENTS.md) and the rules it points at. Revisit once the number of plugins makes that unreliable.

**Revisited, 2026-09-05.** Seventeen plugins and 161 budgeted assets made it unreliable: a
review found five role agents still carrying tools a decision one day earlier said were gone.
The lint is back as `tools/check-assets.mjs`, but as a checker over hand-authored files, not a
generator that owns them — it reports, it writes nothing, and both manifests stay hand-authored.
That is the half of the original that was worth keeping.
