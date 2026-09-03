---
applyTo: 'doc/arc42/12_glossary.md'
description: 'Defines requirements and output standards for arc42-section-12-instructions.'
---

# arc42 Section 12: Glossary - Specific Instructions

## Section Purpose

**Why this section exists:**
Section 12 defines important domain and technical terms used throughout the documentation. It establishes a ubiquitous language that prevents misunderstandings and ensures consistent terminology.

**Value for stakeholders:**
- Prevents misunderstandings through clear definitions
- Establishes shared vocabulary across team and stakeholders
- Helps new team members understand domain language
- Provides translation between business and technical terms
- Essential reference for consistent communication
- Answers: What do we mean by X? What is the official definition of Y?

**Key insight:** This section SHOULD exist for virtually every system. Domain language is always present, even if implicit.

## Mandatory Content (ESSENTIAL)

### What MUST be included:

#### Domain Terms
- **Business concepts** specific to the domain
- **Entities and objects** from the domain model
- **Processes and activities** with special meaning

#### Technical Terms
- **Technology-specific terms** not commonly known
- **Acronyms and abbreviations** used in documentation
- **System-specific terminology**

### For Each Term:
- **Term** (the word or phrase)
- **Definition** (clear, unambiguous explanation)
- **Synonyms** (if any)
- **Related terms** (links to other glossary entries)
- **Examples** (optional, but helpful)

**Note:** Include ONLY terms actually used in the documentation that require definition.

## Lean Variant (Minimum Viable Documentation)

### Format:
Simple alphabetically sorted table

### Minimum Content:
- 10-30 key terms from domain and technical vocabulary
- One-sentence definitions
- Basic structure

### Example Lean Glossary:

| Term | Definition |
|------|------------|
| Account | A customer record in the system containing profile information and order history |
| API Gateway | Central entry point for all external API requests, handles authentication and routing |
| Checkout Process | The sequence of steps a user follows from cart review to payment completion |
| Inventory | Real-time record of available products and their stock levels |
| Microservice | An independently deployable service implementing a single business capability |
| Order | A customer purchase request containing line items, shipping info, and payment details |
| Product Catalog | The master database of all products available for purchase |
| SKU | Stock Keeping Unit - unique identifier for each distinct product variant |
| User Session | A temporary authenticated state for a logged-in user, expires after 1 hour of inactivity |

## Thorough Variant (Complete Version)

### Structure per Term:

#### Term: <n>

**Definition:**
[Clear, unambiguous definition - 1-3 sentences]

**Domain:** [Business | Technical | Hybrid]

**Category:** [Entity | Process | Concept | Technology | Metric]

**Synonyms:**
- [Alternative term 1]
- [Alternative term 2]

**Related Terms:**
- [Link to related glossary entry 1]
- [Link to related glossary entry 2]

**Example:**
[Concrete example showing the term in context]

**Appears In:**
- [Section where this term is used]
- [Section where this term is used]

**Translation:**
[If multilingual system, translations to other languages]

**Historical Note:**
[If term meaning has changed, note previous meaning]

---
applyTo: 'doc/arc42/12_glossary.md'
description: 'Defines requirements and output standards for arc42-section-12-instructions.'
---

## Output Format

```markdown
# 12. Glossary

## Overview
[1 paragraph explaining the purpose and scope of this glossary]

**Total Terms:** [Number]

**Domains Covered:** Business, Technical, Infrastructure

**Last Updated:** YYYY-MM-DD

---
applyTo: 'doc/arc42/12_glossary.md'
description: 'Defines requirements and output standards for arc42-section-12-instructions.'
---

#### API Gateway

**Definition:** [Clear definition]

**Category:** Technical Infrastructure

**Related:** [Microservice](#microservice), [Authentication](#authentication)

---
applyTo: 'doc/arc42/12_glossary.md'
description: 'Defines requirements and output standards for arc42-section-12-instructions.'
---

## Terms by Category

### Business Domain Terms
- Account
- Cart
- Checkout
- Customer
- Order
- Product

### Technical Terms
- API Gateway
- Container
- Microservice
- Service Mesh

### Infrastructure Terms
- Availability Zone
- Load Balancer
- Replica

### Metrics & Measurements
- Latency
- Throughput
- Uptime

---
applyTo: 'doc/arc42/12_glossary.md'
description: 'Defines requirements and output standards for arc42-section-12-instructions.'
---

## Translations (if multilingual)

| English | Deutsch | FranÃ§ais |
|---------|---------|----------|
| Order | Bestellung | Commande |
| Cart | Warenkorb | Panier |
| Checkout | Kasse | Caisse |

---
applyTo: 'doc/arc42/12_glossary.md'
description: 'Defines requirements and output standards for arc42-section-12-instructions.'
---
*Based on docs.arc42.org/section-12/ and official arc42 sources*

