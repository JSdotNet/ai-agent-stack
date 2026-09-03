---
applyTo: 'doc/arc42/07_deployment_view.md'
description: 'Defines requirements and output standards for arc42-section-07-instructions.'
---

# arc42 Section 7: Deployment View - Specific Instructions

## Section Purpose

**Why this section exists:**
Section 7 documents the technical infrastructure and how software building blocks are mapped to hardware/infrastructure elements. It shows where components run and how they're deployed.

**Value for stakeholders:**
- Shows physical/virtual infrastructure
- Documents deployment strategy
- Maps software to hardware/cloud resources
- Explains runtime environment configuration
- Critical for operations and DevOps teams
- Answers: Where do components run? How are they deployed? What's the infrastructure?

**Key insight:** Focus on technically relevant deployment aspects. Skip if deployment is trivial or obvious.

## Mandatory Content (ESSENTIAL)

### What MUST be included:

#### Infrastructure Overview
- **Infrastructure elements** (servers, containers, networks, storage)
- **Mapping** of building blocks (Section 5) to infrastructure
- **Communication channels** between infrastructure elements
- **Technology/protocols** used for deployment

**Note:** For cloud deployments: regions, availability zones, services used.

### When Section 7 Can Be Empty:
- Desktop applications with standard installation
- Simple web applications (standard 3-tier)
- No special infrastructure requirements
- Deployment is obvious from technology stack

## Lean Variant (Minimum Viable Documentation)

### Format:
Simple deployment diagram + table

### Minimum Content:
- One deployment diagram showing main infrastructure nodes
- Simple table mapping components to infrastructure

### Example:

```
[Load Balancer] --> [App Server 1] --> [Database]
                --> [App Server 2] â”€â”€â”˜
```

| Infrastructure Node | Hosted Components | Technology |
|--------------------|------------------|-----------|
| Load Balancer | Traffic distribution | AWS ELB |
| App Server 1/2 | UI Layer, Search Engine | Kubernetes pods |
| Database | Product Catalog data | AWS RDS PostgreSQL |

## Thorough Variant (Complete Version)

### Structure:

#### Infrastructure Level 1
[Highest abstraction - data centers, cloud regions, networks]

**Diagram:** Physical/cloud infrastructure overview
**Description:** Regions, zones, networks, security boundaries

#### Infrastructure Level 2
[Refinement - servers, containers, services within Level 1]

**For each infrastructure node:**

##### Node: <n>

**Technical Description:**
- Hardware specifications (CPU, RAM, storage)
- Operating system
- Virtualization/containerization technology
- Network configuration

**Hosted Building Blocks:**
[Which software components from Section 5 run here]

**Quality Attributes:**
- Performance characteristics
- Availability/redundancy
- Scalability approach
- Security measures

**Deployment Process:**
- How software is deployed to this node
- Deployment tools/automation
- Configuration management

**Communication Channels:**
[How this node communicates with others]

### Multiple Environments:
Document differences between:
- Development
- Testing/Staging
- Production

## Output Format

```markdown
# 7. Deployment View

## Overview
[1-2 paragraphs explaining infrastructure approach and deployment strategy]

## Infrastructure Level 1: Overall Infrastructure

### Deployment Diagram
![Infrastructure Overview](./diagrams/deployment-overview.png)

**Legend:**
- [Server] = Physical/virtual server
- <Container> = Container/pod
- {Database} = Database instance
- === = Network connection

### Infrastructure Description
[Describe cloud regions, data centers, network zones, security boundaries]

## Infrastructure Level 2: Detailed Nodes

### Node: <n>

**Description:**
[What this node is - server, container cluster, database, etc.]

**Technical Specifications:**
- **Type:** [Physical server / VM / Container / Cloud service]
- **Compute:** [CPU, RAM specifications]
- **Storage:** [Type and capacity]
- **OS:** [Operating system and version]
- **Location:** [Data center, region, availability zone]

**Hosted Components:**
| Building Block | Version | Configuration |
|---------------|---------|---------------|
| <Component from Section 5> | <Version> | <Key config> |

**Quality Attributes:**
- **Performance:** <Capacity, response time>
- **Availability:** <Redundancy, failover>
- **Scalability:** <Horizontal/vertical scaling approach>
- **Security:** <Firewall, access control, encryption>

**Deployment:**
- **Method:** [CI/CD pipeline, manual, automated scripts]
- **Tools:** [Kubernetes, Ansible, Terraform, etc.]
- **Frequency:** [Continuous, daily, weekly]

**Communication Channels:**
| Target Node | Protocol | Port | Purpose |
|------------|----------|------|---------|
| <Other node> | HTTPS | 443 | API calls |
| <Database> | PostgreSQL | 5432 | Data access |

---
applyTo: 'doc/arc42/07_deployment_view.md'
description: 'Defines requirements and output standards for arc42-section-07-instructions.'
---
*Based on docs.arc42.org/section-7/ and official arc42 sources*

