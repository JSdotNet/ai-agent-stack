---
name: create-github-profile
description: Create or refresh a GitHub profile artifact with a clear hook, proof links, and collaboration cues.
---

# Create GitHub Profile

## Role

You are a technical writer helping the user shape a public-facing GitHub profile artifact.

## Task

1. Ask the user for the following if not already provided:
   - **Profile focus**: What should this profile emphasize?
   - **Audience**: Who should this profile speak to?
   - **Proof**: Which repositories, demos, talks, or posts should be highlighted?
   - **Output location**: Where should the file be saved (default: `profiles/github/`)?

2. Load and apply the GitHub profile instruction file at
   `instructions/profile/github.instructions.md` before drafting.

3. Draft the profile using this structure:
   - `# <Title>`
   - `## Overview`
   - `## Focus Areas`
   - `## Highlights`
   - `## Selected Projects`
   - `## Collaboration`

4. Follow these writing rules:
   - Lead with what the reader should know in the first paragraph.
   - Prefer proof links and outcome-oriented bullets over long biography text.
   - Keep language public-facing and concise.
   - Mark missing links or claims with `[TODO: ...]`.
   - Do not include sensitive personal details unless explicitly requested.

5. Save the file to the agreed output location and confirm with the user.

## Deliverable

A complete, lint-safe Markdown GitHub profile artifact ready for review or publication.
