# Storyteller Constitution

## Core Principles

### I. Monorepo Architecture
The project follows a monorepo structure with clear separation between mobile (React Native) and backend (Node.js) codebases. Shared code (types, utilities, validation schemas) lives in a dedicated `packages/shared` directory. Each package must be independently buildable and testable.

### II. Type Safety First
TypeScript is mandatory across all packages. Strict mode enabled (`strict: true`). No `any` types without explicit justification. API contracts defined via shared TypeScript interfaces. Use Zod for runtime validation matching TypeScript types.

### III. API Contract-Driven Development
Backend and mobile must agree on API contracts before implementation. OpenAPI/Swagger specs required for all REST endpoints. Changes to API contracts require versioning and migration plans. Shared types auto-generated from API specs where possible.

### IV. Test-First Development (NON-NEGOTIABLE)
- **Backend**: Unit tests for services, integration tests for API endpoints
- **Mobile**: Component tests with React Native Testing Library, E2E with Detox
- Minimum 80% code coverage for business logic
- Red-Green-Refactor cycle enforced

### V. State Management & Data Flow
- **Mobile**: Zustand for global state, React Query/TanStack Query for server state
- **Backend**: Stateless services, database as source of truth
- Unidirectional data flow enforced
- No prop drilling beyond 2 levels—use context or state management

### VI. Error Handling & Resilience
- All errors must be typed and handled explicitly
- Backend returns consistent error response format: `{ error: { code, message, details? } }`
- Mobile implements offline-first patterns with optimistic updates
- Retry logic with exponential backoff for network requests

### VII. Security Standards
- JWT-based authentication with refresh token rotation
- All API endpoints require authentication unless explicitly public
- Sensitive data encrypted at rest and in transit
- Input validation on both client and server (defense in depth)
- No secrets in code—use environment variables

## Technology Stack

### Mobile (React Native)
- **Framework**: React Native with Expo (managed workflow preferred)
- **Navigation**: React Navigation v6+
- **Styling**: NativeWind (Tailwind for React Native) or StyleSheet
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors for auth
- **Storage**: AsyncStorage for simple data, MMKV for performance-critical

### Backend (Node.js)
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for sessions and caching
- **Queue**: BullMQ for background jobs
- **Logging**: Pino for structured JSON logging

### Shared
- **Language**: TypeScript 5.x
- **Package Manager**: pnpm with workspaces
- **Validation**: Zod schemas shared between frontend and backend
- **Linting**: ESLint + Prettier (consistent config across packages)

## Development Workflow

### Branch Strategy
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - new features
- `fix/*` - bug fixes
- `release/*` - release preparation

### Code Review Requirements
- All PRs require at least 1 approval
- CI must pass (tests, lint, type-check)
- No direct commits to `main` or `develop`
- PR description must include: what, why, how to test

### Quality Gates
1. TypeScript compilation with zero errors
2. ESLint with zero warnings
3. All tests passing
4. Code coverage thresholds met
5. No security vulnerabilities (npm audit)

## Performance Standards

### Mobile
- App launch time < 2 seconds
- List renders at 60 FPS
- Bundle size monitored and optimized
- Images lazy-loaded and cached
- Memory leaks actively prevented

### Backend
- API response time < 200ms (p95)
- Database queries optimized with indexes
- N+1 queries detected and prevented
- Rate limiting on all public endpoints

## Governance

This constitution supersedes all other development practices. Any amendments require:
1. Written proposal with justification
2. Team review and approval
3. Migration plan for existing code
4. Version bump of this document

All code reviews must verify compliance with these principles. Deviations require explicit documentation and approval.

**Version**: 1.0.0 | **Ratified**: 2026-01-13 | **Last Amended**: 2026-01-13
