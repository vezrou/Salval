# Architecture Knowledge — Aria

## Core Principles

### Separation of Concerns
Each layer has one job. Layers do not bleed into each other.
- UI layer: display and user interaction only
- Business logic layer: rules, calculations, decisions
- Data layer: storage, retrieval, external APIs

### Dependency Direction
Dependencies always point inward:
`UI → Business Logic → Data`
The data layer never imports from the UI layer.

### Single Responsibility per Module
One file = one responsibility.
No business logic in route handlers or controllers.

---

## Common Architecture Patterns

### Layered (N-Tier)
Good for: most web apps, APIs, CRUD applications.
```
routes/controllers  ← handles HTTP, delegates immediately
services/use-cases  ← business logic lives here
repositories        ← all database/API access lives here
models/entities     ← data shapes
```

### Feature-Based (Vertical Slices)
Good for: large frontend apps, monorepos.
Each feature folder contains its own components, hooks, services, and tests.
```
features/
  auth/
  dashboard/
  settings/
```
Avoids deeply nested cross-feature imports.

### Clean Architecture
Good for: complex domains, long-lived projects.
The domain (business rules) has zero dependencies on frameworks or databases.
Frameworks and DBs are plug-in details at the outer layer.

---

## Folder Structure Principles
- Every folder has a README or comment explaining what belongs there.
- Imports only go inward or sideways, never outward to a parent feature.
- Test files live next to the code they test, not in a separate top-level folder.

---

## Tech Stack Decision Framework
When recommending a stack ask:
1. What is the expected scale? (prototype vs production vs enterprise)
2. What does the team already know?
3. What is the deployment target? (serverless, container, static)
4. Does the problem need real-time? (WebSockets vs REST)

Justify every choice in plain language. "It's popular" is not a justification.

---

## Add Your Research Below
<!-- Paste architecture patterns, case studies, and design decisions here. -->
