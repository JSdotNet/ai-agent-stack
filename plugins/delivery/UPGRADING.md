# Upgrading delivery

Behaviour changes a consumer would notice, newest first.

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
