# Flow Flow Diagrams

Centralized workflow diagrams for the `delivery` flow skills. This keeps the
individual `SKILL.md` files focused on execution rules while preserving one reviewable
overview of stage order, approval gates, and PR handoff points.

## flow-repo

```mermaid
flowchart TD
    A["Repository Creation (Manual)"] --> B["README"]
    B --> C["MCP Configuration"]
    C --> D["Repository Instructions"]
    D --> E["Branch Protection"]
    E --> F["Issue and PR Templates"]
    F --> G["Repository Governance"]
    G --> H["Personal Validation"]
    H --> I{User approves?}
    I -->|Yes| J["Create Pull Request or Skip"]
    I -->|No| K["Return to the relevant earlier stage"]
    K --> A
    J --> U["Work Item Update or Skip"]
    U --> L["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Repository Creation (Manual) | — | — |
| README | the `docs` role, default agent | — |
| MCP Configuration | Default agent | `jsdotnet-guidelines-mcpserver`, `jsdotnet-design-mcpserver` *(enable for future UX flows)*, `microsoft-learn`, `playwright` |
| Repository Instructions | Default agent | `jsdotnet-guidelines-mcpserver` |
| Branch Protection | Default agent | — |
| Issue and PR Templates | Default agent | `jsdotnet-guidelines-mcpserver` |
| Repository Governance | Default agent | — |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-project

```mermaid
flowchart TD
    A["GitHub Folder Setup (Foundation)"] --> B["GitHub Actions Workflows"]
    B --> C["Specification & Architecture Intake"]
    C --> D["Tooling & Dependencies"]
    D --> E["Implementation"]
    E --> F["Build & Test"]
    F --> G["QA Validation"]
    G --> H["Personal Validation"]
    H --> I{User approves?}
    I -->|Yes| J["Create Pull Request or Skip"]
    I -->|No| K["Return to the relevant earlier stage"]
    K --> A
    J --> U["Work Item Update or Skip"]
    U --> L["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| GitHub Folder Setup (Foundation) | the `implement` service | `jsdotnet-guidelines-mcpserver` |
| GitHub Actions Workflows | the `implement` service | — |
| Specification & Architecture Intake | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Tooling & Dependencies | the `implement` service | `microsoft-learn` |
| Implementation | the `implement` service | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture for new functionality only)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-create-mvp

```mermaid
flowchart TD
    S["Scope Discovery"] --> A["MVP Scope Intake"]
    A --> B["Implementation Planning"]
    B --> C["Implementation"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> U["Work Item Update or Skip"]
    U --> J["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Scope Discovery | `flow-runner` agent, optionally the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| MVP Scope Intake | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Implementation Planning | the `architecture` role | — |
| Implementation | the `implement` service | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture for new functionality only)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-update-packages

```mermaid
flowchart TD
    A["Dependency Analysis"] --> B["Update Planning"]
    B --> C["Implementation"]
    C --> D["Security Validation"]
    D --> E["Build & Test"]
    E --> F["QA Validation"]
    F --> G["Personal Validation"]
    G --> H{User approves?}
    H -->|Yes| I["Create Pull Request or Skip"]
    H -->|No| J["Return to the relevant earlier stage"]
    J --> A
    I --> U["Work Item Update or Skip"]
    U --> K["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Dependency Analysis | the `implement` service | `microsoft-learn` |
| Update Planning | the `implement` service | — |
| Implementation | the `implement` service | `microsoft-learn` |
| Security Validation | the `implement` service | — |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(only when new user-facing behavior is introduced)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-aspire-update

```mermaid
flowchart TD
    A["Upgrade Intake & Baseline"] --> B["Plan Refinement"]
    B --> C["Implementation"]
    C --> D["New Feature Adoption"]
    D --> E["Build & Test"]
    E --> F["QA Validation"]
    F --> G["Personal Validation"]
    G --> H{User approves?}
    H -->|Yes| I["Create Pull Request or Skip"]
    H -->|No| J["Return to the relevant earlier stage"]
    J --> A
    I --> U["Work Item Update or Skip"]
    U --> K["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Upgrade Intake & Baseline | the `implement` service | `microsoft-learn` |
| Plan Refinement | the `architecture` role | `microsoft-learn` |
| Implementation | the `implement` service | `microsoft-learn` |
| New Feature Adoption | the `implement` service, the `architecture` role | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture only for adopted new functionality)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-architecture

```mermaid
flowchart TD
    A["Goal & Guideline Retrieval"] --> B["Architecture Investigation"]
    B --> C["Drafting & Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> U["Work Item Update or Skip"]
    U --> H["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Goal & Guideline Retrieval | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Architecture Investigation | the `architecture` role | — |
| Drafting & Review | the `architecture` role | — |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-arc42

```mermaid
flowchart TD
    A["Context & Guideline Retrieval"] --> B["Section Drafting"]
    B --> C["Cross-Section Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> U["Work Item Update or Skip"]
    U --> H["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Context & Guideline Retrieval | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Section Drafting | the `architecture` role | — |
| Cross-Section Review | the `architecture` role | — |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-adr

```mermaid
flowchart TD
    A["Decision Context Retrieval"] --> B["ADR Drafting"]
    B --> C["Traceability Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> U["Work Item Update or Skip"]
    U --> H["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Decision Context Retrieval | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| ADR Drafting | the `architecture` role | — |
| Traceability Review | the `architecture` role | — |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-tdr

```mermaid
flowchart TD
    A["Debt Context Retrieval"] --> B["TDR Drafting"]
    B --> C["Risk & Follow-Up Review"]
    C --> D["Personal Validation"]
    D --> E{User approves?}
    E -->|Yes| F["Create Pull Request or Skip"]
    E -->|No| G["Return to the relevant earlier stage"]
    G --> A
    F --> U["Work Item Update or Skip"]
    U --> H["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Debt Context Retrieval | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| TDR Drafting | the `architecture` role | — |
| Risk & Follow-Up Review | the `architecture` role | — |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-feature

```mermaid
flowchart TD
    S["Scope Discovery"] --> A["Specification & Architecture Intake"]
    A --> B["Implementation"]
    B --> C["Build & Test"]
    C --> D["QA Validation"]
    D --> E["Personal Validation"]
    E --> F{User approves?}
    F -->|Yes| G["Create Pull Request or Skip"]
    F -->|No| H["Return to the relevant earlier stage"]
    H --> A
    G --> U["Work Item Update or Skip"]
    U --> I["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Scope Discovery | `flow-runner` agent, optionally the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Specification & Architecture Intake | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Implementation | the `implement` service | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture for new functionality only)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-bug

```mermaid
flowchart TD
    S["Scope Discovery"] --> A["Bug Intake & Reproduction"]
    A --> B["Root Cause Analysis"]
    B --> C["Implementation"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> U["Work Item Update or Skip"]
    U --> J["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Scope Discovery | `flow-runner` agent, optionally the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Bug Intake & Reproduction | the `implement` service, the `qa.run` provider (runtime repro) | — |
| Root Cause Analysis | the `implement` service | — |
| Implementation | the `implement` service | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture only when needed for failure or on request)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-structure

```mermaid
flowchart TD
    S["Scope Discovery"] --> A["Structure & Architecture Intake"]
    A --> B["Refactor Planning"]
    B --> C["Implementation"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> V["Documentation Update or Skip"]
    V --> U["Work Item Update or Skip"]
    U --> J["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Scope Discovery | `flow-runner` agent, optionally the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Structure & Architecture Intake | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Refactor Planning | the `architecture` role, the `implement` service | — |
| Implementation | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(targeted validation when a runnable surface exists)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Documentation Update | the `docs` role | `jsdotnet-guidelines-mcpserver` *(optional, governed docs only)* |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-create-module

```mermaid
flowchart TD
    S["Scope Discovery"] --> A["Specification Intake"]
    A --> B["Implementation Planning"]
    B --> C["Implementation"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> U["Work Item Update or Skip"]
    U --> J["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Scope Discovery | `flow-runner` agent, optionally the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Specification Intake | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Implementation Planning | the `architecture` role | — |
| Implementation | the `implement` service | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture for new functionality only)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-create-service

```mermaid
flowchart TD
    S["Scope Discovery"] --> A["Specification Intake"]
    A --> B["Implementation Planning"]
    B --> C["Implementation"]
    C --> D["Build & Test"]
    D --> E["QA Validation"]
    E --> F["Personal Validation"]
    F --> G{User approves?}
    G -->|Yes| H["Create Pull Request or Skip"]
    G -->|No| I["Return to the relevant earlier stage"]
    I --> A
    H --> U["Work Item Update or Skip"]
    U --> J["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Scope Discovery | `flow-runner` agent, optionally the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Specification Intake | the `architecture` role | `jsdotnet-guidelines-mcpserver` |
| Implementation Planning | the `architecture` role | — |
| Implementation | the `implement` service | `microsoft-learn` |
| Build & Test | the `implement` service | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` | `playwright` *(capture for new functionality only)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |

## flow-fallback

```mermaid
flowchart TD
    A["Routing Check"] --> Z{Dedicated flow-* skill matches?}
    Z -->|Yes| Y["Stop - invoke that skill instead"]
    Z -->|No| B["Plan"]
    B --> C["Execute"]
    C --> D["Review & Recommend"]
    D --> K{Change kind?}
    K -->|Code-modifying| E["Build & Test"]
    E --> F["QA Validation"]
    F --> G["Personal Validation"]
    K -->|Documentation/config| G
    G --> H{User approves?}
    H -->|Yes| I["Create Pull Request or Skip"]
    H -->|No| J["Return to the relevant earlier stage"]
    J --> B
    I --> V["Documentation Update or Skip (code-modifying tier only)"]
    V --> U["Work Item Update or Skip"]
    U --> S["Summary"]
```

| Phase | Roles & services | MCP servers |
|-------|--------|-------------|
| Routing Check | `flow-runner` agent | — |
| Plan | The closest specialist agent for the task category | `jsdotnet-guidelines-mcpserver` *(when the task touches governed assets)* |
| Execute | The closest specialist agent for the task category | `microsoft-learn` *(targeted lookups only)* |
| Review & Recommend | The closest specialist agent for the task category | — |
| Build & Test | the `implement` service *(code-modifying change kind only)* | `microsoft-learn` *(targeted remediation only)* |
| QA Validation | the `qa.run` provider, the runtime monitor, `aspire` *(code-modifying change kind only)* | `playwright` *(targeted validation when a runnable surface exists)* |
| Personal Validation | — | — |
| Create Pull Request | *(default)* | — |
| Documentation Update | the `docs` role *(code-modifying change kind only)* | `jsdotnet-guidelines-mcpserver` *(optional, governed docs only)* |
| Work Item Update | *(default)* | — |
| Summary | `flow-runner` agent | — |
