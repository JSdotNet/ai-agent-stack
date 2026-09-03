---
applyTo: 'doc/arc42/06_runtime_view.md'
description: 'Defines requirements and output standards for arc42-section-06-instructions.'
---

# arc42 Section 6: Runtime View - Specific Instructions

## Section Purpose

**Why this section exists:**
Section 6 describes dynamic behavior of the system - how building blocks interact at runtime. It shows concrete scenarios of system execution, helping stakeholders understand operational behavior.

**Value for stakeholders:**
- Shows how static structures (Section 5) come to life
- Documents important use cases and scenarios
- Explains error handling and exceptional situations
- Provides concrete examples of system behavior
- Validates that building blocks work together correctly
- Answers: How do components interact? What happens during execution? How are errors handled?

**Key insight:** Document only the most important scenarios (typically 1-5). Not every possible scenario needs documentation.

## Mandatory Content (ESSENTIAL)

### What MUST be included:

#### Important Runtime Scenarios
- **3-5 key scenarios** showing how building blocks collaborate
- **Sequence of interactions** between components
- **Data exchanged** between components
- **Error handling** for critical scenarios

**Selection criteria for scenarios:**
- Architecturally significant
- Complex interactions
- Critical for understanding
- Frequent or important use cases
- Error/failure scenarios

**NOT needed:**
- Every possible scenario
- Trivial CRUD operations
- Obvious interactions
- Implementation details

## Lean Variant (Minimum Viable Documentation)

### Format:
For each scenario:
1. **Name and brief description**
2. **Simple numbered steps** or bullet points
3. **Participating building blocks**

### Minimum Content:
- 1-3 most important scenarios
- Text description with numbered steps
- Optional: Simple diagrams

### Example Lean Runtime Scenario:

**Scenario: User Search for Product**

Participating components: UI Layer, Search Engine, Product Catalog

Steps:
1. User enters search term in UI Layer
2. UI Layer sends search query to Search Engine
3. Search Engine requests product data from Product Catalog
4. Product Catalog returns matching products
5. Search Engine ranks results
6. Search Engine returns ranked results to UI Layer
7. UI Layer displays results to user

**Error handling:** If Product Catalog unavailable, Search Engine returns cached results.

## Thorough Variant (Complete Version)

### Structure per Scenario:

#### Scenario: <Name>

**Overview:**
[1-2 sentences describing what this scenario shows]

**Preconditions:**
- System state before scenario starts
- Required data/configuration
- User authentication status

**Main Flow:**
[Sequence diagram or numbered steps showing normal execution]

**Alternative Flows:**
[Important variations of the main flow]

**Exception Flows:**
[Error conditions and how they're handled]

**Postconditions:**
- System state after scenario completes
- Data changes
- Side effects

**Quality Attributes:**
- Performance requirements for this scenario
- Security considerations
- Scalability aspects

**Related Scenarios:**
[Links to other scenarios that follow or precede this one]

### Diagram Options:
- UML Sequence Diagrams (recommended)
- UML Activity Diagrams
- BPMN Process Diagrams
- Simple flowcharts
- Text-based sequence descriptions

## Output Format

```markdown
# 6. Runtime View

## Overview
[1-2 paragraphs explaining which scenarios are documented and why these were selected]

## Scenario 1: <Name>

### Overview
[Brief description of what happens]

### Sequence Diagram
![Scenario 1 Sequence](./diagrams/scenario1-sequence.png)

### Step-by-Step Description

1. **[Actor]** â†’ **[Component A]**: <Action>
   - Data: <What data is sent>
   - Protocol: <How it's sent>

2. **[Component A]** â†’ **[Component B]**: <Action>
   - Processing: <What Component A does>
   - Data: <What is sent to B>

3. **[Component B]** â†’ **[Component C]**: <Action>
   [Continue...]

### Alternative Flows

#### Alternative: <Name>
**Condition:** <When this alternative is taken>
**Steps:** [Different steps]

### Error Handling

#### Error: <Error Name>
**Condition:** <What triggers this error>
**Handling:** [How system responds]
**Recovery:** [How system recovers]

### Quality Aspects
- **Performance:** <Response time, throughput>
- **Security:** <Authentication, authorization checks>
- **Availability:** <Fallback mechanisms>

---
applyTo: 'doc/arc42/06_runtime_view.md'
description: 'Defines requirements and output standards for arc42-section-06-instructions.'
---
*Based on docs.arc42.org/section-6/ and official arc42 sources*

