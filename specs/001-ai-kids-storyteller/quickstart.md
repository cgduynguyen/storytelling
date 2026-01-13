# Quickstart: AI Storyteller for Kids

**Feature**: 001-ai-kids-storyteller  
**Date**: January 13, 2026

## Prerequisites

- **Node.js**: 20 LTS or later
- **pnpm**: 8.x or later (`npm install -g pnpm`)
- **PostgreSQL**: 15+ (or Docker)
- **Redis**: 7+ (or Docker)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go app**: On iOS/Android device for testing

---

## 1. Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd storyteller

# Install dependencies (all workspaces)
pnpm install
```

---

## 2. Environment Setup

### API Environment

```bash
# Create API environment file
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storyteller"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# NVIDIA AI API
NVIDIA_API_KEY="nvapi-your-key-here"
NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"
NVIDIA_MODEL="meta/llama-3.3-70b-instruct"

# Server
PORT=3000
NODE_ENV=development
```

### Mobile Environment

```bash
# Create mobile environment file
cp apps/mobile/.env.example apps/mobile/.env
```

Edit `apps/mobile/.env`:

```env
# API URL (use your local IP for device testing)
API_URL="http://localhost:3000/api/v1"

# For physical device testing, use your machine's IP:
# API_URL="http://192.168.x.x:3000/api/v1"
```

---

## 3. Database Setup

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Or manually:
docker run -d --name storyteller-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=storyteller \
  -p 5432:5432 \
  postgres:15

docker run -d --name storyteller-redis \
  -p 6379:6379 \
  redis:7
```

### Option B: Local Installation

```bash
# macOS with Homebrew
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# Create database
createdb storyteller
```

### Run Migrations

```bash
# Navigate to API
cd apps/api

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed sample data
pnpm prisma db seed
```

---

## 4. Start Development Servers

### Terminal 1: API Server

```bash
cd apps/api
pnpm dev
```

Server starts at `http://localhost:3000`

### Terminal 2: Mobile App

```bash
cd apps/mobile
pnpm start
```

Scan QR code with Expo Go app, or press:

- `i` for iOS Simulator
- `a` for Android Emulator

---

## 5. Verify Setup

### Health Check

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","database":"connected","redis":"connected"}
```

### Create Test Account

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test Child",
    "ageBand": "AGE_6_8",
    "pin": "1234"
  }'
```

### Generate Test Story

```bash
# Use the accessToken from registration response
curl -X POST http://localhost:3000/api/v1/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "theme": "ADVENTURE",
    "length": "SHORT"
  }'
```

---

## 6. Project Structure

```
storyteller/
├── apps/
│   ├── api/                 # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/      # Express routes
│   │   │   ├── services/    # Business logic
│   │   │   ├── middleware/  # Auth, validation
│   │   │   └── jobs/        # BullMQ workers
│   │   ├── prisma/          # Database schema
│   │   └── package.json
│   │
│   └── mobile/              # React Native (Expo)
│       ├── src/
│       │   ├── app/         # Expo Router screens
│       │   ├── components/  # UI components
│       │   ├── features/    # Feature modules
│       │   └── services/    # API clients
│       └── package.json
│
├── packages/
│   └── shared/              # Shared types & schemas
│       ├── src/
│       │   ├── types/       # TypeScript types
│       │   └── schemas/     # Zod validation
│       └── package.json
│
├── specs/                   # Feature specifications
├── pnpm-workspace.yaml
└── package.json
```

---

## 7. Common Commands

### All Workspaces

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check
```

### API

```bash
cd apps/api

# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Run production
pnpm start

# Database commands
pnpm prisma studio      # Open Prisma Studio GUI
pnpm prisma migrate dev # Create/apply migrations
pnpm prisma db push     # Push schema without migration
```

### Mobile

```bash
cd apps/mobile

# Start Expo dev server
pnpm start

# Run on iOS Simulator
pnpm ios

# Run on Android Emulator
pnpm android

# Run tests
pnpm test

# Build for stores
pnpm build:ios
pnpm build:android
```

### Shared Package

```bash
cd packages/shared

# Build types and schemas
pnpm build

# Watch mode
pnpm dev
```

---

## 8. Testing

### Unit Tests

```bash
# All tests
pnpm test

# API tests only
cd apps/api && pnpm test

# Mobile tests only
cd apps/mobile && pnpm test

# With coverage
pnpm test -- --coverage
```

### E2E Tests (Mobile)

```bash
cd apps/mobile

# Build for testing
pnpm detox:build

# Run E2E tests
pnpm detox:test
```

### API Integration Tests

```bash
cd apps/api

# Requires test database running
pnpm test:integration
```

---

## 9. Getting NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign in or create account
3. Navigate to any model (e.g., llama-3.3-70b-instruct)
4. Click "Get API Key"
5. Copy key to your `.env` file

---

## 10. Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres
# or
brew services list | grep postgresql

# Test connection
psql postgresql://postgres:postgres@localhost:5432/storyteller -c "SELECT 1"
```

### Redis Connection Failed

```bash
# Check Redis is running
docker ps | grep redis
# or
redis-cli ping  # Expected: PONG
```

### Mobile Can't Connect to API

1. Ensure API is running on `0.0.0.0` not `127.0.0.1`
2. For physical device, use your machine's local IP
3. Check firewall allows port 3000

```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Expo Build Fails

```bash
# Clear caches
expo start -c

# Reset watchman (macOS)
watchman watch-del-all

# Clear Metro bundler cache
npx react-native start --reset-cache
```

---

## Next Steps

1. ✅ Setup complete - proceed to implementation
2. Review [data-model.md](data-model.md) for database schema
3. Review [contracts/api.yaml](contracts/api.yaml) for API endpoints
4. Check [research.md](research.md) for technology decisions
