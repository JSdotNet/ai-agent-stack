---
name: deployment-diagram-generator
description: Generate deployment and infrastructure diagrams showing cloud or on-premises hosting topology using Mermaid architecture-beta or graph notation.
---

# Deployment Diagram Generator

Use this skill to produce deployment diagrams that show the physical and logical infrastructure hosting a system, complementing the C4 Level 2 Container diagram with an infrastructure perspective.

## Trigger Conditions

Use when the user asks to:

- Document how the system is hosted on cloud, on-premises, or hybrid infrastructure.
- Show environment-specific topology (production, staging, development).
- Map containers or services to cloud services, VMs, or Kubernetes resources.
- Visualise network zones, load balancers, or security boundaries for arc42 Section 7.

## Inputs

- Target environment (production, staging, development)
- Cloud provider or hosting platform (AWS, Azure, GCP, on-premises, Kubernetes)
- Infrastructure nodes: compute, databases, caches, queues, CDNs, load balancers
- Network zones, VPCs, subnets, or security groups (if relevant)
- Services or containers deployed to each node (reference the C4 Level 2 diagram)
- Scaling topology (single node, cluster, multi-region)

## Workflow

1. Load `instructions/deployment/deployment-global-instructions.md`.
2. Confirm environment, cloud provider, and key infrastructure nodes with the user.
3. Load `skills/deployment-diagram-generator/prompts/deployment-diagram.prompt.md`.
4. Ask focused clarifying questions only for missing network zones, protocols, or scaling details.
5. Select diagram type: prefer `architecture-beta` for Mermaid v11+ environments; fall back to `graph TD` otherwise.
6. Generate the diagram with named nodes, logical groupings, and labelled relationships.
7. Write a prose summary (3–5 sentences) explaining hosting choices, scaling strategy, and key security boundaries.
8. Add traceability notes to arc42 §7 and the related C4 Level 2 Container diagram.
9. Run `scripts/generate-diagram-svgs.ps1 -Path <directory-of-output-file>` from the plugin root to generate an SVG alongside the Markdown output.

## Output

- Mermaid `architecture-beta` or `graph TD` diagram embedded in a fenced `mermaid` code block
- Note on which Mermaid version is required
- Prose summary (3–5 sentences)
- Traceability links to arc42 §7 and the C4 Level 2 Container diagram
- ADR references for cloud provider, region, and scaling decisions
- List of open questions or assumptions

## Quality Checks

- [ ] Environment and cloud provider clearly labelled.
- [ ] Infrastructure nodes named with role and technology.
- [ ] Logical groups (VPCs, subnets, clusters) shown as boundaries.
- [ ] Relationships labelled with protocol and port where relevant.
- [ ] Diagram type appropriate for the target Mermaid renderer version.
- [ ] Diagram embedded in a fenced `mermaid` code block.
- [ ] Prose summary present.
- [ ] Traceability links to arc42 §7, C4 Container diagram, and relevant ADRs present.
- [ ] SVG file generated in `diagrams/` alongside the Markdown output using `scripts/generate-diagram-svgs.ps1`.
