# Implementation Plan: AI Storyteller for Kids

**Branch**: `001-ai-kids-storyteller` | **Date**: January 13, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ai-kids-storyteller/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a child-friendly storytelling application that generates age-appropriate stories using NVIDIA AI APIs, provides audio narration via Edge TTS, and allows children to save/replay stories. The app uses React Native (Expo) for mobile and Node.js for backend services, following a monorepo architecture with shared TypeScript types.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20 LTS  
**Primary Dependencies**: 
- Mobile: React Native + Expo (managed workflow), React Navigation v6+, NativeWind/StyleSheet, React Hook Form + Zod, Axios, Zustand, TanStack Query, AsyncStorage/MMKV
- Backend: Express.js/Fastify, Prisma ORM, Redis, BullMQ, Pino logging
- AI: OpenAI SDK (NVIDIA API compatible), edge-tts-universal  
**Storage**: PostgreSQL (via Prisma), Redis (caching/sessions), AsyncStorage/MMKV (mobile)  
**Testing**: Jest + React Native Testing Library (mobile), Jest (backend)
**Target Platform**: iOS 15+, Android 10+ (mobile), Linux server (backend)  
**Project Type**: mobile + api (monorepo structure)  
**Performance Goals**: 
- Story generation < 30 seconds
- Audio narration start < 5 seconds
- API response time < 200ms (p95)
- Mobile: 60 FPS renders, < 2s app launch  
**Constraints**: 
- Offline-capable for saved stories
- Max 50 stories per user (~15-50MB with audio)
- Child-safe content (AI guardrails)
- Age-appropriate UI for 3-10 year olds  
**Scale/Scope**: Initial launch targeting small user base, ~10-15 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation ✅

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Architecture | ✅ PASS | Mobile + Backend + Shared packages structure |
| II. Type Safety First | ✅ PASS | TypeScript strict mode, Zod for runtime validation |
| III. API Contract-Driven | ✅ PASS | OpenAPI specs in `/contracts/` directory |
| IV. Test-First Development | ✅ PASS | Jest + RTL (mobile), Jest (backend) |
| V. State Management | ✅ PASS | Zustand (global), TanStack Query (server state) |
| VI. Error Handling | ✅ PASS | Typed errors, offline-first patterns |
| VII. Security Standards | ✅ PASS | JWT auth, input validation, env secrets |

### Post-Design Evaluation ✅

| Artifact | Compliance | Verification |
|----------|------------|--------------|
| data-model.md | ✅ PASS | Prisma schema with TypeScript types, Zod schemas defined |
| contracts/api.yaml | ✅ PASS | OpenAPI 3.0 spec with all endpoints documented |
| research.md | ✅ PASS | Technology decisions align with Constitution stack |
| quickstart.md | ✅ PASS | Development setup follows Constitution workflow |

**Technology Stack Compliance:**
- Mobile: ✅ React Native + Expo, React Navigation, NativeWind, React Hook Form + Zod, Axios, AsyncStorage/MMKV
- Backend: ✅ Node.js 20 LTS, Express.js/Fastify, PostgreSQL + Prisma, Redis, BullMQ, Pino
- Shared: ✅ TypeScript 5.x, pnpm workspaces, Zod schemas, ESLint + Prettier

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-kids-storyteller/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
│   └── api.yaml
└── tasks.md             # Phase 2 output (not created by plan)
```

### Source Code (repository root)

```text
# Monorepo Structure (pnpm workspaces)
packages/
├── shared/                    # Shared TypeScript types, Zod schemas, utils
│   ├── src/
│   │   ├── types/            # API contracts, entity types
│   │   ├── schemas/          # Zod validation schemas
│   │   └── utils/            # Shared utilities
│   └── package.json

apps/
├── mobile/                    # React Native (Expo) app
│   ├── src/
│   │   ├── app/              # Expo Router screens
│   │   ├── components/       # UI components
│   │   ├── features/         # Feature modules (stories, library, settings)
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API clients, TTS service
│   │   ├── stores/           # Zustand stores
│   │   └── utils/            # Mobile utilities
│   ├── __tests__/            # Jest + RTL tests
│   └── package.json
│
└── api/                       # Node.js backend
    ├── src/
    │   ├── routes/           # Express/Fastify routes
    │   ├── services/         # Business logic (story generation, TTS)
    │   ├── models/           # Prisma models
    │   ├── middleware/       # Auth, validation, error handling
    │   ├── jobs/             # BullMQ background jobs
    │   └── utils/            # Backend utilities
    ├── prisma/               # Database schema
    ├── __tests__/            # Jest integration tests
    └── package.json
```

**Structure Decision**: Using Mobile + API monorepo structure per Constitution Section I. Shared code (types, Zod schemas) lives in `packages/shared` for contract-driven development.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected. All Constitution principles are satisfied.*
