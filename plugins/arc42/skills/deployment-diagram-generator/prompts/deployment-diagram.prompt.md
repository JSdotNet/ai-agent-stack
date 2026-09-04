---
name: deployment-diagram
description: Prompt for generating a Mermaid deployment or infrastructure diagram for arc42 Section 7.
---

# Deployment Diagram Prompt

## Purpose

Produce a Mermaid deployment diagram that shows the physical or cloud infrastructure hosting the system, grouped by environment and network boundary.

## Pre-Draft Checklist

Confirm the following before generating the diagram:

1. What is the target environment? (production, staging, development)
2. What cloud provider or hosting platform is used? (AWS, Azure, GCP, on-premises, Kubernetes)
3. What are the key infrastructure nodes? (compute instances, managed databases, caches, queues, CDNs, load balancers)
4. Which services or containers from the C4 Level 2 diagram are deployed to each node?
5. What network zones are relevant? (VPC, subnet, DMZ, availability zone)
6. What are the key network relationships and protocols between nodes?
7. Is Mermaid v11+ (`architecture-beta`) supported in the target environment, or is `graph TD` required?

## Mermaid Template — `architecture-beta` (Mermaid v11+)

```mermaid
architecture-beta
  %% Deployment: {Environment} — {Cloud Provider / Platform}
  group internet(internet)[Public Internet]
  group cloud(cloud)[{Cloud Provider} {Region}]
  group private(server)[Private Subnet]

  service cdn(internet)[CDN] in internet
  service lb(gateway)[Load Balancer] in cloud
  service api1(server)[{Service} Instance 1] in private
  service api2(server)[{Service} Instance 2] in private
  service db(database)[{Database} Primary] in private
  service cache(disk)[{Cache}] in private

  cdn:R --> L:lb
  lb:R --> L:api1
  lb:R --> L:api2
  api1:B --> T:db
  api2:B --> T:db
  api1:R --> L:cache
  api2:R --> L:cache
```

## Fallback Template — `graph TD` (All Mermaid Versions)

```mermaid
graph TD
  %% Deployment: {Environment} — {Cloud Provider / Platform}
  Internet((Internet))

  subgraph Cloud["{Cloud Provider} {Region}"]
    LB["Load Balancer\n[{Technology}]"]
    subgraph Private["Private Subnet"]
      API1["{Service} Instance 1\n[{Technology}]"]
      API2["{Service} Instance 2\n[{Technology}]"]
      DB["{Database} Primary\n[{Technology}]"]
      CACHE["{Cache}\n[{Technology}]"]
    end
  end

  Internet -->|HTTPS| LB
  LB -->|HTTP| API1
  LB -->|HTTP| API2
  API1 -->|TCP:{port}| DB
  API2 -->|TCP:{port}| DB
  API1 -->|TCP:{port}| CACHE
  API2 -->|TCP:{port}| CACHE
```

## Guidance

- Label every node with its role and technology (e.g., `"API Instance [Docker / ECS]"`).
- Group nodes into logical boundaries (cloud account, VPC, subnet, availability zone).
- Label all relationships with protocol and port when they are architecturally relevant.
- Show security boundaries (firewalls, security groups) as group labels or notes, not as separate nodes.
- Reference the C4 Level 2 Container diagram for the logical services deployed to each node; do not repeat logical structure here.
- Prefer `architecture-beta` for cleaner visual output; note the Mermaid version requirement in the prose summary.

## Output Requirements

- One fenced `mermaid` code block (either `architecture-beta` or `graph TD`) with a `%% Deployment:` comment header.
- Nodes named with role and technology.
- Network groups shown as boundaries.
- All relationships labelled with protocol and port where relevant.
- Prose summary (3–5 sentences) covering hosting choices, scaling topology, and key security boundaries.
- Note on Mermaid version required for the selected diagram type.
- Traceability link to arc42 Section 7 (Deployment View).
- Cross-reference to the C4 Level 2 Container diagram.
- ADR references for cloud provider, region, and scaling decisions.
- List of assumptions for any infrastructure detail not confirmed by the user.
