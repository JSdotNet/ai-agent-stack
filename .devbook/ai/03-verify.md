# 3. Verify

```meta
status: candidate
type: stage
```

Checking that an asset does what it says: that a skill triggers when it should, that an agent
loads, that a chapter parses.

## Plugin Evaluation

```meta
status: candidate
type: practice
related: [".devbook/tech/hosts.md#claude-code-plugin-api"]
```

`claude plugin eval` runs a suite against a plugin's skills.

- **Used for** — nothing here yet. It is the only way to check an asset actually triggers when
  it should, which no amount of reading the description settles.
- **Adopted by** — nobody. What is checked today is the loadable half: `claude plugin validate
  --strict` on every manifest, `tools/check-assets.mjs` over the manifests, agents, and hooks,
  the Node suites, and the generator's `--check` over `.devbook/`.
- **Evidence** — none yet. The first plugin to get a suite is the first thing to evaluate; the
  candidates are the role plugins, whose skill descriptions are the triggers a flow relies on.
- **Limits** — an eval exercises a skill's trigger and output, not the load-time shape both
  hosts reject; those stay with the validator, the checker, and the review rules in
  `CLAUDE.md`.
