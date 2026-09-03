---
applyTo: '.arc42/05-building-block-view.md'
description: 'Defines requirements and output standards for arc42-section-05-instructions.'
---

# arc42 Section 5: Building Block View - Specific Instructions

## Section Purpose

**Why this section exists:**
Section 5 documents the static decomposition of the system into building blocks (modules, components, subsystems, classes, interfaces, packages, libraries, frameworks, layers, partitions, tiers, functions, macros, operations, data structures, ...) at multiple levels of abstraction.

**Value for stakeholders:**
- Shows how source code is organized
- Enables developers to find their way through the codebase
- Documents component responsibilities and interfaces
- Hierarchical refinement from coarse to fine-grained
- Provides "map" for understanding implementation
- Answers: How is the system structured? What are the main components? What does each component do?

**Key insight:** "Level-1 is your friend" - The first level of decomposition is MANDATORY and most important.

## Mandatory Content (ESSENTIAL)

### What MUST be included:

#### Level 1 (MANDATORY)
- **White-box diagram** of overall system
- **All top-level building blocks** shown
- **Interfaces between building blocks**
- **Brief responsibility** for each building block
- **Rationale** for this decomposition

**Critical rule:** Level-1 is MANDATORY. Without it, nobody can understand your system structure.

#### Further Levels (Optional)
- Level 2: Refinement of interesting Level-1 blocks
- Level 3+: Further refinement as needed
- Stop when reaching source code level or when further detail adds no value

### Black-box vs. White-box Descriptions

**Black-box (External View):**
- Purpose/responsibility
- Interfaces (provided and required)
- Quality attributes
- Directory/file location
- Dependencies (what it needs)
- Open issues

**White-box (Internal View):**
- Internal structure diagram
- Internal building blocks
- Rationale for internal structure

## Lean Variant (Minimum Viable Documentation)

### Level 1 (MANDATORY):
- **One diagram** showing all top-level components
- **Simple table** with component responsibilities:

| Building Block | Responsibility | Interfaces |
|---------------|----------------|-----------|
| <Component 1> | <What it does> | <Key APIs> |
| <Component 2> | <What it does> | <Key APIs> |

- **Brief decomposition rationale** (1 paragraph)

### Example Lean Level-1:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚         Product Search System          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚   UI   â”‚  Search   â”‚ Product  â”‚  Auth  â”‚
â”‚ Layer  â”‚  Engine   â”‚  Catalog â”‚ Serviceâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

| Component | Responsibility |
|-----------|---------------|
| UI Layer | User interface, displays results |
| Search Engine | Query processing, ranking |
| Product Catalog | Product data management |
| Auth Service | Authentication & authorization |

**Rationale:** Layered architecture separates concerns. Search Engine is isolated for independent scaling.

## Thorough Variant (Complete Version)

### Level 1: Overall System Structure

#### White-box: Overall System

**Purpose:** [Overall system purpose, copied from Section 1.1]

**Diagram:**
[Professional diagram showing all Level-1 building blocks with interfaces]

**Contained Building Blocks:**
[List all Level-1 components]

**Important Interfaces:**
[Describe key interfaces between Level-1 blocks]

**Decomposition Rationale:**
[Why this particular structure? What criteria were used? Link to Solution Strategy]

#### Building Block: <Name of Block 1> (Black-box)

**Purpose/Responsibility:**
[What does this component do? What's its role?]

**Interfaces:**
| Interface | Description | Type | Protocol |
|-----------|-------------|------|----------|
| IF-01 | <Description> | Provided | HTTP REST |
| IF-02 | <Description> | Required | Database |

**Quality Attributes:**
- Performance: [Requirements]
- Scalability: [Approach]
- Security: [Measures]

**Directory/File Location:**
- Source code: `/src/component1/`
- Configuration: `/config/component1/`

**Fulfilled Requirements:**
[Which functional requirements does this component satisfy?]

**Open Issues/Problems:**
- [Known limitations]
- [Technical debt]

### Level 2: Refinement of <Component Name>

**Selection Rationale:**
[Why refine this particular component? Complexity? Size? Critical functionality?]

#### White-box: <Component Name> Internal Structure

**Purpose:**
[Refined understanding of component internals]

**Internal Structure Diagram:**
[Diagram showing internal sub-components]

**Contained Building Blocks:**
[List sub-components]

**Internal Interfaces:**
[Describe how sub-components interact]

**Rationale:**
[Why this internal structure?]

#### Building Block: <Sub-component 1> (Black-box)
[Same structure as Level-1 black-box description]

#### Building Block: <Sub-component 2> (Black-box)
[Same structure as Level-1 black-box description]

### Level 3+: Further Refinements
[Continue pattern as needed]

**Stopping criteria:**
- Reached source code level (classes, functions)
- Further detail adds no architectural value
- Component is simple enough to understand from code
- Team agrees no further documentation needed

## Output Format

```markdown
# 5. Building Block View

## Overview
[1-2 paragraphs explaining the hierarchical decomposition approach]

## Level 1: Overall System (White-box)

### Overview Diagram

![Level 1 Structure](./diagrams/level1-structure.png)

**Legend:**
- [Component] = Building block
- --> = Dependency/uses
- <--> = Bidirectional dependency

### Contained Building Blocks

| Name | Responsibility | Key Interfaces |
|------|---------------|----------------|
| <Block 1> | <What it does> | <IF-01, IF-02> |
| <Block 2> | <What it does> | <IF-03> |

### Decomposition Rationale
[Why this structure? What criteria? How does it support quality goals?]

Links:
- Solution Strategy: See Section 4
- Runtime Behavior: See Section 6

## Building Block: <Name> (Black-box Description)

### Purpose/Responsibility
[What does this block do?]

### Interfaces

| Interface ID | Description | Type | Technology |
|-------------|-------------|------|-----------|
| IF-01 | <Description> | Provided | REST API |
| IF-02 | <Description> | Required | PostgreSQL |

### Quality/Performance Characteristics
- **Performance:** <Requirements>
- **Availability:** <Requirements>
- **Security:** <Measures>

### Directory/File Location
- Source: `/src/<path>/`
- Tests: `/tests/<path>/`

### Fulfilled Requirements
- REQ-001: <Requirement>
- REQ-005: <Requirement>

### Open Issues
- ISSUE-123: <Description>

---
applyTo: '.arc42/05-building-block-view.md'
description: 'Defines requirements and output standards for arc42-section-05-instructions.'
---
*Based on docs.arc42.org/section-5/ and official arc42 sources*

