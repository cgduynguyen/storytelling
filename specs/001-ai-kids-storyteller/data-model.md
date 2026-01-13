# Data Model: AI Storyteller for Kids

**Feature**: 001-ai-kids-storyteller  
**Date**: January 13, 2026

## Overview

This document defines the data entities, relationships, and validation rules for the AI Storyteller application.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │  ParentalSettings│
├─────────────────┤       ├─────────────────┤
│ id              │───1:1─│ userId          │
│ email           │       │ pin             │
│ passwordHash    │       │ ageBand         │
│ name            │       │ excludedThemes  │
│ createdAt       │       │ updatedAt       │
│ updatedAt       │       └─────────────────┘
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│      Story      │       │  StorySegment   │
├─────────────────┤       ├─────────────────┤
│ id              │───1:N─│ id              │
│ userId          │       │ storyId         │
│ title           │       │ content         │
│ theme           │       │ audioData       │
│ length          │       │ wordBoundaries  │
│ ageBand         │       │ order           │
│ isInteractive   │       │ isEnding        │
│ mainCharacter   │       │ createdAt       │
│ status          │       └────────┬────────┘
│ audioData       │                │
│ wordBoundaries  │                │ 1:N
│ savedToLibrary  │                ▼
│ createdAt       │       ┌─────────────────┐
│ updatedAt       │       │     Choice      │
└─────────────────┘       ├─────────────────┤
                          │ id              │
                          │ segmentId       │
                          │ text            │
                          │ nextSegmentId   │
                          │ order           │
                          └─────────────────┘
```

---

## Entities

### User

Represents a child user or family account.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| email | String | Unique, required | Parent's email for account |
| passwordHash | String | Required | Bcrypt hashed password |
| name | String | Required, 1-50 chars | Display name (child's name) |
| createdAt | DateTime | Auto | Account creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Validation Rules**:
- Email must be valid format
- Name: 1-50 characters, alphanumeric + spaces only
- Password: minimum 8 characters before hashing

---

### ParentalSettings

Configuration for content safety and parental controls.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| userId | UUID | FK → User, unique | Parent reference |
| pin | String | Required, 4 digits | Encrypted parental PIN |
| ageBand | Enum | Required | AGE_3_5, AGE_6_8, AGE_9_10 |
| excludedThemes | String[] | Optional | Themes to exclude |
| updatedAt | DateTime | Auto | Last update timestamp |

**Validation Rules**:
- PIN: exactly 4 numeric digits
- ageBand: must be valid enum value
- excludedThemes: valid theme identifiers only

**Age Band Enum**:
```typescript
enum AgeBand {
  AGE_3_5 = 'AGE_3_5',   // Ages 3-5
  AGE_6_8 = 'AGE_6_8',   // Ages 6-8
  AGE_9_10 = 'AGE_9_10', // Ages 9-10
}
```

---

### Story

A generated story with optional saved audio.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| userId | UUID | FK → User | Story owner |
| title | String | Required, 1-100 chars | Generated or custom title |
| theme | Enum | Required | Story theme |
| length | Enum | Required | SHORT, MEDIUM, LONG |
| ageBand | Enum | Required | Target age band |
| isInteractive | Boolean | Default: false | Choose-your-adventure mode |
| mainCharacter | String | Optional, 1-30 chars | Custom character name |
| status | Enum | Required | Generation status |
| content | Text | Optional | Full story text (non-interactive) |
| audioData | Bytes | Optional | Pre-generated MP3 audio |
| wordBoundaries | JSON | Optional | Word timing for highlighting |
| savedToLibrary | Boolean | Default: false | Saved by user |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Validation Rules**:
- Title: 1-100 characters
- mainCharacter: 1-30 characters, letters/spaces only
- content: max 15000 characters (~1500 words)
- audioData: max 5MB
- Max 50 saved stories per user

**Theme Enum**:
```typescript
enum StoryTheme {
  ADVENTURE = 'ADVENTURE',
  ANIMALS = 'ANIMALS',
  FANTASY = 'FANTASY',
  FRIENDSHIP = 'FRIENDSHIP',
  SPACE = 'SPACE',
  UNDERWATER = 'UNDERWATER',
  NATURE = 'NATURE',
  RANDOM = 'RANDOM',
}
```

**Length Enum**:
```typescript
enum StoryLength {
  SHORT = 'SHORT',     // ~300 words, ~2 min
  MEDIUM = 'MEDIUM',   // ~600 words, ~5 min
  LONG = 'LONG',       // ~1000 words, ~10 min
}
```

**Status Enum**:
```typescript
enum StoryStatus {
  PENDING = 'PENDING',         // Queued for generation
  GENERATING = 'GENERATING',   // AI generating text
  AUDIO_PENDING = 'AUDIO_PENDING', // Text done, audio pending
  COMPLETED = 'COMPLETED',     // Fully generated
  FAILED = 'FAILED',           // Generation failed
}
```

---

### StorySegment

A segment of an interactive story (for choose-your-adventure).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| storyId | UUID | FK → Story | Parent story |
| content | Text | Required | Segment text |
| audioData | Bytes | Optional | Segment audio |
| wordBoundaries | JSON | Optional | Word timing |
| order | Integer | Required | Display order |
| isEnding | Boolean | Default: false | Terminal segment |
| createdAt | DateTime | Auto | Creation timestamp |

**Validation Rules**:
- content: 50-2000 characters
- order: >= 0
- audioData: max 1MB per segment

---

### Choice

A choice option within an interactive story segment.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| segmentId | UUID | FK → StorySegment | Parent segment |
| text | String | Required, 10-100 chars | Choice display text |
| nextSegmentId | UUID | FK → StorySegment | Target segment |
| order | Integer | Required | Display order (1-3) |

**Validation Rules**:
- text: 10-100 characters
- order: 1-3 (max 3 choices per segment)
- nextSegmentId: must reference valid segment in same story

---

## Word Boundary Format

For text highlighting during narration:

```typescript
interface WordBoundary {
  text: string;           // The word
  offset: number;         // Character offset in content
  duration: number;       // Duration in milliseconds
  audioOffset: number;    // Milliseconds into audio
}

// Example
[
  { text: "Once", offset: 0, duration: 250, audioOffset: 0 },
  { text: "upon", offset: 5, duration: 200, audioOffset: 250 },
  { text: "a", offset: 10, duration: 100, audioOffset: 450 },
  { text: "time", offset: 12, duration: 300, audioOffset: 550 },
  // ...
]
```

---

## Indexes

### User
- `email` (unique)

### Story
- `userId` (for user's stories lookup)
- `userId, savedToLibrary` (for library queries)
- `userId, createdAt` (for history sorting)
- `status` (for job processing)

### StorySegment
- `storyId, order` (for ordered segment retrieval)

### Choice
- `segmentId, order` (for ordered choice retrieval)

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AgeBand {
  AGE_3_5
  AGE_6_8
  AGE_9_10
}

enum StoryTheme {
  ADVENTURE
  ANIMALS
  FANTASY
  FRIENDSHIP
  SPACE
  UNDERWATER
  NATURE
  RANDOM
}

enum StoryLength {
  SHORT
  MEDIUM
  LONG
}

enum StoryStatus {
  PENDING
  GENERATING
  AUDIO_PENDING
  COMPLETED
  FAILED
}

model User {
  id              String           @id @default(uuid())
  email           String           @unique
  passwordHash    String
  name            String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  parentalSettings ParentalSettings?
  stories         Story[]

  @@map("users")
}

model ParentalSettings {
  id             String   @id @default(uuid())
  userId         String   @unique
  pin            String   // Encrypted 4-digit PIN
  ageBand        AgeBand
  excludedThemes String[] @default([])
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("parental_settings")
}

model Story {
  id             String       @id @default(uuid())
  userId         String
  title          String
  theme          StoryTheme
  length         StoryLength
  ageBand        AgeBand
  isInteractive  Boolean      @default(false)
  mainCharacter  String?
  status         StoryStatus  @default(PENDING)
  content        String?      // Full text for non-interactive
  audioData      Bytes?       // MP3 binary
  wordBoundaries Json?        // WordBoundary[]
  savedToLibrary Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  user     User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  segments StorySegment[]

  @@index([userId])
  @@index([userId, savedToLibrary])
  @@index([userId, createdAt])
  @@index([status])
  @@map("stories")
}

model StorySegment {
  id             String   @id @default(uuid())
  storyId        String
  content        String
  audioData      Bytes?
  wordBoundaries Json?
  order          Int
  isEnding       Boolean  @default(false)
  createdAt      DateTime @default(now())

  story   Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  choices Choice[] @relation("SegmentChoices")
  
  // Choices that lead TO this segment
  incomingChoices Choice[] @relation("ChoiceTarget")

  @@index([storyId, order])
  @@map("story_segments")
}

model Choice {
  id            String @id @default(uuid())
  segmentId     String
  text          String
  nextSegmentId String
  order         Int

  segment     StorySegment @relation("SegmentChoices", fields: [segmentId], references: [id], onDelete: Cascade)
  nextSegment StorySegment @relation("ChoiceTarget", fields: [nextSegmentId], references: [id], onDelete: Cascade)

  @@index([segmentId, order])
  @@map("choices")
}
```

---

## Zod Validation Schemas

```typescript
// packages/shared/src/schemas/story.schema.ts

import { z } from 'zod';

export const AgeBandSchema = z.enum(['AGE_3_5', 'AGE_6_8', 'AGE_9_10']);

export const StoryThemeSchema = z.enum([
  'ADVENTURE', 'ANIMALS', 'FANTASY', 'FRIENDSHIP',
  'SPACE', 'UNDERWATER', 'NATURE', 'RANDOM'
]);

export const StoryLengthSchema = z.enum(['SHORT', 'MEDIUM', 'LONG']);

export const StoryStatusSchema = z.enum([
  'PENDING', 'GENERATING', 'AUDIO_PENDING', 'COMPLETED', 'FAILED'
]);

export const CreateStoryRequestSchema = z.object({
  theme: StoryThemeSchema,
  length: StoryLengthSchema,
  mainCharacter: z.string().min(1).max(30).regex(/^[a-zA-Z\s]+$/).optional(),
  isInteractive: z.boolean().default(false),
});

export const WordBoundarySchema = z.object({
  text: z.string(),
  offset: z.number().int().min(0),
  duration: z.number().int().min(0),
  audioOffset: z.number().int().min(0),
});

export const StoryResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  theme: StoryThemeSchema,
  length: StoryLengthSchema,
  ageBand: AgeBandSchema,
  isInteractive: z.boolean(),
  mainCharacter: z.string().nullable(),
  status: StoryStatusSchema,
  content: z.string().nullable(),
  audioUrl: z.string().url().nullable(),
  wordBoundaries: z.array(WordBoundarySchema).nullable(),
  savedToLibrary: z.boolean(),
  createdAt: z.string().datetime(),
});

// Type exports
export type AgeBand = z.infer<typeof AgeBandSchema>;
export type StoryTheme = z.infer<typeof StoryThemeSchema>;
export type StoryLength = z.infer<typeof StoryLengthSchema>;
export type StoryStatus = z.infer<typeof StoryStatusSchema>;
export type CreateStoryRequest = z.infer<typeof CreateStoryRequestSchema>;
export type WordBoundary = z.infer<typeof WordBoundarySchema>;
export type StoryResponse = z.infer<typeof StoryResponseSchema>;
```

---

## State Transitions

### Story Status Flow

```
    ┌──────────┐
    │ PENDING  │ ← User creates story request
    └────┬─────┘
         │ Worker picks up job
         ▼
    ┌──────────────┐
    │ GENERATING   │ ← AI generating text
    └────┬─────────┘
         │ Text complete
         ▼
    ┌───────────────┐
    │ AUDIO_PENDING │ ← TTS generating audio
    └────┬──────────┘
         │ Audio complete
         ▼
    ┌──────────┐
    │ COMPLETED │ ← Ready for playback
    └──────────┘

    Any stage can transition to:
    ┌────────┐
    │ FAILED │ ← Error during generation
    └────────┘
```

---

## Storage Limits

| Limit | Value | Rationale |
|-------|-------|-----------|
| Stories per user (saved) | 50 | Device storage (~50MB) |
| Story content length | 15,000 chars | ~1500 words max |
| Story audio size | 5MB | ~10 min audio |
| Segment audio size | 1MB | ~2 min audio |
| Choices per segment | 3 | UI simplicity |
| Segments per story | 20 | Interactive complexity |
