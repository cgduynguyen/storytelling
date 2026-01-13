# AI Storyteller

## Project Overview

A kid-friendly storytelling app that generates age-appropriate stories via NVIDIA AI APIs with audio narration. **pnpm monorepo** with 3 packages:

- `apps/api` - Express.js + Prisma + BullMQ backend
- `apps/mobile` - Expo/React Native app (Expo Router, Zustand, TanStack Query)
- `packages/shared` - TypeScript types + Zod schemas shared across packages

## Quick Commands

```bash
pnpm install                 # Install all dependencies
docker-compose up -d         # Start PostgreSQL + Redis
pnpm dev                     # Run API + mobile in parallel
cd apps/api && pnpm db:migrate  # Run Prisma migrations
cd apps/api && pnpm db:studio   # Open Prisma Studio
```

## Architecture Patterns

### Monorepo Structure
- Import shared types via `@storyteller/shared` (workspace dependency)
- Each app has its own `tsconfig.json` extending root config
- TypeScript strict mode enabled everywhere

### API (`apps/api`)
- **Routes**: `src/routes/` - Express routers grouped by resource
- **Services**: `src/services/` - Business logic (story generation, TTS)
- **Jobs**: `src/jobs/` - BullMQ workers for async story/audio generation
- **Middleware**: `src/middleware/` - Auth (JWT), validation (Zod), error handling
- **Database**: Prisma ORM with PostgreSQL; schema in `prisma/schema.prisma`

### Mobile (`apps/mobile`)
- **Expo Router**: File-based routing in `src/app/` (tabs in `(tabs)/`)
- **State**: Zustand stores in `src/stores/`, TanStack Query for server state
- **Components**: `src/components/ui/` for reusable, `src/components/story/` for feature-specific
- **Hooks**: `src/hooks/` wraps API calls with TanStack Query mutations/queries

### Data Flow
1. Mobile → API endpoint → Zod validation → Service → Database/Queue
2. Long tasks (story generation, TTS): API returns `202` + job ID → BullMQ worker processes → Mobile polls for completion

## Key Implementation Details

### Content Safety
- Stories filtered by `AgeBand` enum: `AGE_3_5`, `AGE_6_8`, `AGE_9_10`
- Prompt templates in `apps/api/src/services/prompts.ts` include safety guardrails
- Input sanitization middleware for character names and user inputs

### Story Generation Pipeline
1. POST `/api/v1/stories` → creates Story with `status: PENDING`
2. BullMQ job generates story via NVIDIA API + audio via edge-tts
3. Client polls `GET /api/v1/stories/:id` until `status: COMPLETED`
4. Audio endpoint: `GET /api/v1/stories/:id/audio`

### Validation Pattern
All API inputs validated with Zod schemas from `@storyteller/shared`:
```typescript
import { createStorySchema } from '@storyteller/shared';
app.post('/stories', validate(createStorySchema), handler);
```

## Specs & Contracts

- **API Contract**: [specs/001-ai-kids-storyteller/contracts/api.yaml](specs/001-ai-kids-storyteller/contracts/api.yaml) - OpenAPI 3.0 spec
- **Data Model**: [specs/001-ai-kids-storyteller/data-model.md](specs/001-ai-kids-storyteller/data-model.md) - Entity schemas
- **Tasks**: [specs/001-ai-kids-storyteller/tasks.md](specs/001-ai-kids-storyteller/tasks.md) - Implementation checklist

## Testing Conventions

- API: Jest + supertest; tests in `src/**/__tests__/`
- Mobile: Jest + React Native Testing Library; tests in `__tests__/` or colocated
- Run all: `pnpm test`, run specific: `cd apps/api && pnpm test`

## Environment Variables

API requires `.env` with:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT` - Redis for BullMQ
- `NVIDIA_API_KEY` - Story generation AI
- `JWT_SECRET` - Auth tokens

Copy `.env.example` files in each app as starting point.

