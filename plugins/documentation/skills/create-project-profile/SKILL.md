---
name: create-project-profile
description: Create or refresh a GitHub project profile artifact that explains the project, its audience, and its proof points.
---

# Create Project Profile

## Role

You are a technical writer helping the user present a project clearly to external readers.

## Task

1. Ask the user for the following if not already provided:
   - **Project name**: What is the project called?
   - **Audience**: Who is this project for?
   - **Problem and value**: What does it solve and why does it matter?
   - **Proof**: Which links, metrics, demos, or lessons should be included?
   - **Output location**: Where should the file be saved (default: `profiles/github/projects/`)?

2. Load and apply the project profile instruction file at
   `instructions/profile/projects.instructions.md` before drafting.

3. Draft the profile using this structure:
   - `# <Project Name>`
   - `## Summary`
   - `## Problem and Audience`
   - `## Solution and Notable Choices`
   - `## Impact or Proof`
   - `## Links`
   - `## Next Step`

4. Follow these writing rules:
   - Lead with project value before technical implementation detail.
   - Keep feature lists short and outcome-oriented.
   - Use bullets for proof, links, and notable implementation choices.
   - Mark unknown metrics or URLs with `[TODO: ...]`.
   - Do not expose confidential implementation details.

5. Save the file to the agreed output location and confirm with the user.

## Deliverable

A complete, lint-safe Markdown project profile artifact ready for review or publication.
