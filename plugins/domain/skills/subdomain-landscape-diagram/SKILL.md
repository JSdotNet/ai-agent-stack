---
name: subdomain-landscape-diagram
description: 'Generate a Mermaid landscape diagram showing subdomains classified by type (core, supporting, generic) with their bounded contexts.'
---

# Subdomain Landscape Diagram

Use this skill to produce a high-level visual of the domain's subdomain landscape, classifying each subdomain and its bounded contexts by type.

## Trigger Conditions

Use after `domain-exploration` has produced `domain.md` with a subdomain overview, or to refresh the landscape diagram when bounded contexts are added or reclassified.

## Inputs

- `domain.md` with the Subdomains table and Bounded Context Index.
- Context map (optional) to show cross-context relationships on the diagram.

## Workflow

1. Apply `instructions/ddd/ddd-global-instructions.md` and `instructions/diagrams/ddd-diagram-instructions.md`.
2. Read `domain.md` and extract:
   - All subdomains with their type (core, supporting, generic).
   - All bounded contexts and their owning subdomain.
   - Cross-context relationships from the context map (optional).
3. Build a Mermaid `flowchart TD` with three labelled subgraphs following `instructions/diagrams/ddd-diagram-instructions.md`:
   - **🎯 Core** — competitive-advantage subdomains.
   - **🔧 Supporting** — necessary but non-differentiating subdomains.
   - **📦 Generic** — commodity subdomains.
4. Place each bounded context as a rectangle node inside its owning subdomain's subgraph.
5. If context map relationships are available, add simplified directional edges between bounded context nodes (direction only, no pattern labels, to keep the landscape readable).
6. External systems referenced by any bounded context appear as stadium-shape nodes `([SystemName])` outside the subgraphs.
7. Insert or update the diagram in `domain.md` under a **Subdomain Landscape** section, positioned above the Bounded Context Map section.
8. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-domain.md>` from the plugin root to generate an SVG alongside the Markdown output.

## Output

- Updated `domain.md` with an embedded Mermaid `flowchart TD` subdomain landscape diagram.

## Quality Checks

- All subdomains from the Subdomains table appear on the diagram.
- All bounded contexts appear within their owning subdomain subgraph.
- The three subdomain type subgraphs are clearly labelled.
- The diagram is consistent with the Bounded Context Index in `domain.md`.
- No pattern labels clutter the landscape; relationship detail belongs on the context map.
- SVG file generated in `diagrams/` alongside the Markdown output using `scripts/generate-diagram-svgs.ps1`.
