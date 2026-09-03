---
applyTo: 'doc/arc42/11_risks_and_technical_debt.md'
description: 'Defines requirements and output standards for arc42-section-11-instructions.'
---

# arc42 Section 11: Risks and Technical Debt - Specific Instructions

## Section Purpose

**Why this section exists:**
Section 11 documents known technical risks, potential problems, and technical debt that could impact the system. It provides transparency about issues and enables proactive risk management.

**Value for stakeholders:**
- Makes risks visible and manageable
- Documents technical debt for future planning
- Enables informed decision-making
- Provides transparency to stakeholders
- Helps prioritize technical improvements
- Answers: What could go wrong? What technical debt exists? What are the mitigation plans?

**Key insight:** This section should be reviewed and updated regularly. Risks and technical debt evolve over time.

## Mandatory Content (ESSENTIAL)

### What MUST be included:

#### Technical Risks
- **Identified risks** with potential negative impact
- **Probability and impact** assessment
- **Mitigation strategies** or contingency plans
- **Priority/severity** ranking

#### Technical Debt
- **Known shortcuts or compromises** in the architecture
- **Impact** of the technical debt
- **Plan for addressing** the debt (or conscious decision to accept it)

**Note:** Empty section is acceptable if truly no significant risks or technical debt exist (rare!).

## Lean Variant (Minimum Viable Documentation)

### Format:
Simple tables for risks and technical debt

### Minimum Content:
- 5-10 identified risks with priority
- 3-5 technical debt items
- Brief mitigation/plan for each

### Example Lean Risks:

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-01 | Single database is bottleneck | High | High | Plan database sharding for Q2 2025 |
| R-02 | Key developer leaves | Medium | High | Cross-training, documentation |
| R-03 | Third-party API rate limits | Medium | Medium | Implement caching, negotiate higher limits |
| R-04 | AWS region failure | Low | Critical | Multi-region deployment by Q3 2025 |

### Example Lean Technical Debt:

| ID | Technical Debt | Impact | Plan |
|----|---------------|--------|------|
| TD-01 | No automated integration tests | Medium | Add in Sprint 15-16 |
| TD-02 | Monolithic user service needs splitting | High | Refactor in Q1 2025 |
| TD-03 | Legacy code in payment module | Medium | Rewrite planned for Q2 2025 |

## Thorough Variant (Complete Version)

### Risk Documentation Structure:

#### Risk: R-<XXX> - <Name>

**Category:** [Technical | Organizational | External | Business]

**Description:**
[Detailed explanation of the risk]

**Probability:** [Low | Medium | High | Very High] (percentage if known)

**Impact:** [Low | Medium | High | Critical]

**Priority:** [Calculated from Probability Ã— Impact]

**Indicators:**
[What signals that this risk is becoming reality?]

**Consequences if Risk Occurs:**
- [Consequence 1]
- [Consequence 2]
- [Consequence 3]

**Mitigation Strategy:**

**Prevention:**
[Actions to reduce probability]

**Containment:**
[Actions to reduce impact if risk occurs]

**Contingency Plan:**
[What to do if risk occurs]

**Responsible:** [Who is monitoring/mitigating this risk]

**Review Date:** [When to reassess this risk]

**Status:** [New | Under Observation | Mitigated | Occurred | Closed]

**Related Architecture Elements:**
[Which components from Section 5 are affected]

**Historical Notes:**
[Has this risk occurred before? When? How was it handled?]

---
applyTo: 'doc/arc42/11_risks_and_technical_debt.md'
description: 'Defines requirements and output standards for arc42-section-11-instructions.'
---

## Risks

### Risk Register Summary

| ID | Risk | Probability | Impact | Priority | Status |
|----|------|-------------|--------|----------|--------|
| R-001 | <Name> | High | High | Critical | Under Observation |
| R-002 | <Name> | Medium | Medium | Medium | Mitigated |

### Detailed Risk Descriptions

#### Risk R-001: <Name>

**Category:** Technical

**Description:**
[What is the risk?]

**Probability:** High (60-80%)

**Impact:** High (Significant service degradation)

**Priority:** Critical

**Consequences:**
- [Consequence 1]
- [Consequence 2]

**Mitigation:**
- **Prevention:** [Actions to reduce likelihood]
- **Containment:** [Actions to reduce impact]
- **Contingency:** [Plan if it occurs]

**Responsible:** [Name/Role]

**Review Date:** 2025-Q2

**Status:** Under Observation

---
applyTo: 'doc/arc42/11_risks_and_technical_debt.md'
description: 'Defines requirements and output standards for arc42-section-11-instructions.'
---

## Technical Debt

### Technical Debt Register

| ID | Debt Item | Impact | Effort to Fix | Target Date | Status |
|----|-----------|--------|---------------|-------------|--------|
| TD-001 | <Name> | High | 5 days | 2025-Q1 | Scheduled |
| TD-002 | <Name> | Medium | 10 days | 2025-Q2 | Identified |

### Detailed Technical Debt Items

#### Technical Debt TD-001: <Name>

**Category:** Architecture

**Description:**
[What is the technical debt?]

**Origin:**
- Created: Sprint 12 (2024-06-15)
- Reason: Deadline pressure for MVP launch
- Decision: Product Owner + Tech Lead

**Current Impact:**
- **Maintainability:** Code duplication across 3 services makes changes slow
- **Performance:** Unnecessary data serialization adds 200ms latency
- **Development:** Slows feature development by ~20%

**Estimated Cost to Fix:**
- **Effort:** 5 developer-days
- **Risk:** Medium - requires careful testing of affected services

**Remediation Plan:**

**Decision:** Fix in Q1 2025 (Sprint 20-21)

**Approach:** Refactor to shared library, migrate services one by one

**Responsible:** Backend Team Lead

**Status:** Scheduled

---
applyTo: 'doc/arc42/11_risks_and_technical_debt.md'
description: 'Defines requirements and output standards for arc42-section-11-instructions.'
---
*Based on docs.arc42.org/section-11/ and official arc42 sources*

