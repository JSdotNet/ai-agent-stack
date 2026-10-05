---
name: phase-summary
description: 'Shared Summary phase, the last phase of every flow-* flow. States what the run produced and where it landed, runs the phase-summary.after chores, and publishes the run''s end to the surface. Invoked inline by the flow-runner agent, never directly.'
---

# Phase: Summary

Open the reply with `delivery@<version>`, `version` read from `../../.claude-plugin/plugin.json`, not recalled.

**Does**
- Summarizes the outcome and runs the summary.after chores
- Offers a retro after two or more revise rounds

**Doesn't**
- Author token, context or timing numbers: those come from the surface

Both flows, inline, last — after Create Pull Request and Report Back, or wherever the run
concludes without them.

1. **Summarize the delivered outcome**: the change, the pull request if one opened, the
   Personal Validation decision, and what Report Back reached or why it was skipped. With the
   `show-me` skill available, write it per that skill.
2. **Run the `phase-summary.after` chores** in order. Each contributes to the summary and
   captures what this run learned. A chore may fail without failing the run unless it
   declared itself required; name every failure in the summary.
3. **Offer a retro** when the run took two or more revise rounds at Personal Validation, read
   from the surface's pass count or the run's recorded decisions: one line asking whether to
   run the `retro` skill over this run. Offer, never run it unasked; an unattended run, or a
   host without the skill, offers nothing.
4. **Emit the run summary** and call `finish_run`, per **Reporting Contract** in
   `resources/surface-contract.md`.

Describe what the run did, never what it cost: token, context, and timing figures are the
surface's own telemetry. Its place in the order: `resources/flow-phases.md`.
