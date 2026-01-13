# Tasks: AI Storyteller for Kids

**Input**: Design documents from `/specs/001-ai-kids-storyteller/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Comprehensive testing tasks included per Constitution Principle IV (Test-First Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions (Monorepo Structure)

- **Shared**: `packages/shared/src/`
- **API**: `apps/api/src/`
- **Mobile**: `apps/mobile/src/`
- **Database**: `apps/api/prisma/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize monorepo structure, dependencies, and configuration files

- [x] T001 Create monorepo structure with pnpm workspaces in package.json and pnpm-workspace.yaml
- [x] T002 [P] Initialize shared package in packages/shared/package.json with TypeScript config
- [x] T003 [P] Initialize API package in apps/api/package.json with Express.js, Prisma, BullMQ dependencies
- [x] T004 [P] Initialize mobile package in apps/mobile/package.json with Expo, React Navigation, Zustand, TanStack Query
- [x] T005 [P] Configure TypeScript in tsconfig.json (root) with project references
- [x] T006 [P] Configure ESLint in .eslintrc.js with shared rules
- [x] T007 [P] Configure Prettier in .prettierrc
- [x] T008 [P] Create .env.example files for apps/api/.env.example and apps/mobile/.env.example
- [x] T009 Create docker-compose.yaml with PostgreSQL and Redis services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared Package Foundation

- [x] T010 Create enum schemas in packages/shared/src/schemas/enums.ts (AgeBand, StoryTheme, StoryLength, StoryStatus)
- [x] T011 [P] Create story Zod schemas in packages/shared/src/schemas/story.schema.ts
- [x] T012 [P] Create auth Zod schemas in packages/shared/src/schemas/auth.schema.ts
- [x] T013 [P] Create settings Zod schemas in packages/shared/src/schemas/settings.schema.ts
- [x] T014 [P] Create error types in packages/shared/src/types/errors.ts
- [x] T015 [P] Create API response types in packages/shared/src/types/api.ts
- [x] T016 Create shared package barrel exports in packages/shared/src/index.ts

### Database Foundation

- [x] T017 Create Prisma schema with all models in apps/api/prisma/schema.prisma (User, ParentalSettings, Story, StorySegment, Choice)
- [x] T018 Generate initial Prisma migration in apps/api/prisma/migrations/
- [x] T019 Create Prisma client singleton in apps/api/src/lib/prisma.ts

### API Core Infrastructure

- [x] T020 Create Express app entry point in apps/api/src/index.ts
- [x] T021 [P] Create Pino logger configuration in apps/api/src/lib/logger.ts
- [x] T022 [P] Create Redis client in apps/api/src/lib/redis.ts
- [x] T023 [P] Create environment config in apps/api/src/config/env.ts
- [x] T024 [P] Create error handling middleware in apps/api/src/middleware/errorHandler.ts
- [x] T025 [P] Create validation middleware (Zod) in apps/api/src/middleware/validate.ts
- [x] T026 Create JWT utilities (sign, verify, refresh) in apps/api/src/lib/jwt.ts
- [x] T027 Create auth middleware in apps/api/src/middleware/auth.ts
- [x] T028 Create BullMQ connection and queue setup in apps/api/src/lib/queue.ts
- [x] T029 Create health check route in apps/api/src/routes/health.ts
- [x] T030 Configure API routes mounting in apps/api/src/routes/index.ts

### Mobile Core Infrastructure

- [ ] T031 Create Expo app entry with providers in apps/mobile/App.tsx
- [ ] T032 [P] Configure Expo Router navigation in apps/mobile/src/app/\_layout.tsx
- [ ] T033 [P] Create API client (Axios) in apps/mobile/src/services/api.ts
- [ ] T034 [P] Create auth store (Zustand) in apps/mobile/src/stores/authStore.ts
- [ ] T035 [P] Configure TanStack Query client in apps/mobile/src/lib/queryClient.ts
- [ ] T036 [P] Create secure storage utilities in apps/mobile/src/lib/secureStorage.ts
- [ ] T037 [P] Create theme and styling foundation in apps/mobile/src/styles/theme.ts
- [ ] T038 Create loading and error UI components with debounced buttons in apps/mobile/src/components/ui/
- [ ] T039 Add input sanitization for character names and user inputs in apps/api/src/middleware/sanitize.ts
- [ ] T040 Create child-friendly error message mapper in apps/mobile/src/utils/errorMessages.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate a New Story (Priority: P1) 🎯 MVP

**Goal**: Enable users to generate age-appropriate stories with theme, character, and length preferences

**Independent Test**: Open app → Select theme → Tap "Create Story" → Verify complete story is generated within 30 seconds

### API Implementation for US1

- [ ] T041 [P] [US1] Create NVIDIA AI client in apps/api/src/lib/nvidia.ts
- [ ] T042 [P] [US1] Create story prompt templates per age band with content safety guardrails in apps/api/src/services/prompts.ts
- [ ] T043 [US1] Implement StoryGenerationService with AI safety filtering in apps/api/src/services/storyGeneration.ts
- [ ] T044 [US1] Create story generation BullMQ worker in apps/api/src/jobs/storyWorker.ts
- [ ] T045 [US1] Implement story CRUD routes in apps/api/src/routes/stories.ts (POST /stories, GET /stories/:id, GET /stories, DELETE /stories/:id)
- [ ] T046 [US1] Implement auth routes in apps/api/src/routes/auth.ts (register, login, refresh, logout)

### Mobile Implementation for US1

- [ ] T047 [P] [US1] Create story hooks (useCreateStory, useStory, useStoryHistory) in apps/mobile/src/hooks/useStory.ts
- [ ] T048 [P] [US1] Create auth hooks (useLogin, useRegister, useLogout) in apps/mobile/src/hooks/useAuth.ts
- [ ] T049 [P] [US1] Create story store (current story state) in apps/mobile/src/stores/storyStore.ts
- [ ] T050 [P] [US1] Create ThemeSelector component in apps/mobile/src/components/story/ThemeSelector.tsx
- [ ] T051 [P] [US1] Create LengthSelector component in apps/mobile/src/components/story/LengthSelector.tsx
- [ ] T052 [P] [US1] Create CharacterInput component with sanitization in apps/mobile/src/components/story/CharacterInput.tsx
- [ ] T053 [US1] Create CreateStoryScreen in apps/mobile/src/app/(tabs)/create.tsx
- [ ] T054 [US1] Create StoryViewScreen (display generated story) in apps/mobile/src/app/story/[id].tsx
- [ ] T055 [US1] Create StoryGeneratingScreen (loading state) in apps/mobile/src/components/story/GeneratingView.tsx
- [ ] T056 [US1] Create LoginScreen in apps/mobile/src/app/auth/login.tsx
- [ ] T057 [US1] Create RegisterScreen in apps/mobile/src/app/auth/register.tsx
- [ ] T058 [US1] Implement story polling for generation status in apps/mobile/src/hooks/useStoryPolling.ts

### Testing for US1

- [ ] T059 [P] [US1] Write unit tests for StoryGenerationService (content safety, prompt generation) in apps/api/src/services/**tests**/storyGeneration.test.ts
- [ ] T060 [P] [US1] Write unit tests for auth services in apps/api/src/services/**tests**/auth.test.ts
- [ ] T061 [P] [US1] Write integration tests for story routes in apps/api/src/routes/**tests**/stories.test.ts
- [ ] T062 [P] [US1] Write integration tests for auth routes in apps/api/src/routes/**tests**/auth.test.ts
- [ ] T063 [P] [US1] Write component tests for ThemeSelector, LengthSelector, CharacterInput in apps/mobile/src/components/story/**tests**/
- [ ] T064 [P] [US1] Write component tests for LoginScreen and RegisterScreen in apps/mobile/src/app/auth/**tests**/
- [ ] T065 [US1] Write E2E test for User Story 1 acceptance scenarios in apps/mobile/**tests**/e2e/us1-story-generation.test.ts

**Checkpoint**: User can register, login, and generate stories with preferences. MVP complete. All US1 tests passing.

---

## Phase 4: User Story 2 - Listen to Story Narration (Priority: P2)

**Goal**: Enable audio narration with play/pause/stop and text highlighting

**Independent Test**: Generate any story → Tap "Read to Me" → Verify audio plays clearly → Verify text highlights sync with narration

### API Implementation for US2

- [ ] T066 [P] [US2] Create edge-tts-universal wrapper in apps/api/src/lib/tts.ts
- [ ] T067 [US2] Extend StoryGenerationService with TTS generation in apps/api/src/services/storyGeneration.ts
- [ ] T068 [US2] Update story worker to generate audio after text in apps/api/src/jobs/storyWorker.ts
- [ ] T069 [US2] Implement audio streaming endpoint GET /stories/:id/audio in apps/api/src/routes/stories.ts

### Mobile Implementation for US2

- [ ] T070 [P] [US2] Create audio player service (expo-av) in apps/mobile/src/services/audioPlayer.ts
- [ ] T071 [P] [US2] Create audio store (playback state) in apps/mobile/src/stores/audioStore.ts
- [ ] T072 [US2] Create text highlighter utility in apps/mobile/src/utils/textHighlighter.ts
- [ ] T073 [US2] Create AudioControls component (play/pause/stop) in apps/mobile/src/components/audio/AudioControls.tsx
- [ ] T074 [US2] Create HighlightedText component in apps/mobile/src/components/story/HighlightedText.tsx
- [ ] T075 [US2] Update StoryViewScreen with narration UI in apps/mobile/src/app/story/[id].tsx
- [ ] T076 [US2] Create useAudioNarration hook in apps/mobile/src/hooks/useAudioNarration.ts

### Testing for US2

- [ ] T077 [P] [US2] Write unit tests for TTS service in apps/api/src/lib/**tests**/tts.test.ts
- [ ] T078 [P] [US2] Write integration tests for audio streaming endpoint in apps/api/src/routes/**tests**/stories-audio.test.ts
- [ ] T079 [P] [US2] Write component tests for AudioControls and HighlightedText in apps/mobile/src/components/**tests**/
- [ ] T080 [US2] Write E2E test for User Story 2 acceptance scenarios in apps/mobile/**tests**/e2e/us2-audio-narration.test.ts

**Checkpoint**: Users can listen to stories with synchronized text highlighting. Play/pause/stop working. All US2 tests passing.

---

## Phase 5: User Story 3 - Save and Access Story Library (Priority: P3)

**Goal**: Enable saving stories to library and offline access to saved stories

**Independent Test**: Generate story → Save to library → Close app → Reopen → Access saved story from library

### API Implementation for US3

- [ ] T081 [US3] Implement library routes with 50 story limit enforcement in apps/api/src/routes/library.ts (GET /library, POST /library/:id, DELETE /library/:id)

### Mobile Implementation for US3

- [ ] T082 [P] [US3] Create library hooks (useLibrary, useSaveToLibrary) in apps/mobile/src/hooks/useLibrary.ts
- [ ] T083 [P] [US3] Create library store with offline support in apps/mobile/src/stores/libraryStore.ts
- [ ] T084 [P] [US3] Create local storage service for offline stories in apps/mobile/src/services/localStorage.ts
- [ ] T085 [US3] Create LibraryScreen in apps/mobile/src/app/(tabs)/library.tsx
- [ ] T086 [US3] Create StoryCard component for library list in apps/mobile/src/components/library/StoryCard.tsx
- [ ] T087 [US3] Create SaveButton component with storage limit notification in apps/mobile/src/components/story/SaveButton.tsx
- [ ] T088 [US3] Update StoryViewScreen with save functionality in apps/mobile/src/app/story/[id].tsx
- [ ] T089 [US3] Implement offline story sync in apps/mobile/src/services/offlineSync.ts
- [ ] T090 [US3] Create DeleteStoryConfirmation modal in apps/mobile/src/components/library/DeleteConfirmation.tsx

### Testing for US3

- [ ] T091 [P] [US3] Write integration tests for library routes including limit enforcement in apps/api/src/routes/**tests**/library.test.ts
- [ ] T092 [P] [US3] Write unit tests for offline sync service in apps/mobile/src/services/**tests**/offlineSync.test.ts
- [ ] T093 [P] [US3] Write component tests for LibraryScreen and SaveButton in apps/mobile/src/components/**tests**/
- [ ] T094 [US3] Write E2E test for User Story 3 acceptance scenarios (save, offline, delete) in apps/mobile/**tests**/e2e/us3-library.test.ts

**Checkpoint**: Users can save, access, and delete stories from library. Offline access works. All US3 tests passing.

---

## Phase 6: User Story 4 - Parental Controls and Safety Settings (Priority: P4)

**Goal**: Enable parents to configure age range, excluded themes, and view story history

**Independent Test**: Enter PIN → Access settings → Set age band to 3-5 → Exclude "scary" themes → Generate story → Verify story respects settings

### API Implementation for US4

- [ ] T095 [P] [US4] Create parental PIN verification middleware in apps/api/src/middleware/parentalPin.ts
- [ ] T096 [US4] Implement settings routes in apps/api/src/routes/settings.ts (GET/PATCH /settings/profile, GET/PATCH /settings/parental, PUT /settings/parental/pin, POST /settings/parental/verify)
- [ ] T097 [US4] Update story generation to respect excluded themes in apps/api/src/services/storyGeneration.ts

### Mobile Implementation for US4

- [ ] T098 [P] [US4] Create settings hooks (useProfile, useParentalSettings) in apps/mobile/src/hooks/useSettings.ts
- [ ] T099 [P] [US4] Create settings store in apps/mobile/src/stores/settingsStore.ts
- [ ] T100 [US4] Create PinEntryScreen in apps/mobile/src/app/settings/pin.tsx
- [ ] T101 [US4] Create ParentalSettingsScreen in apps/mobile/src/app/settings/parental.tsx
- [ ] T102 [US4] Create AgeBandSelector component in apps/mobile/src/components/settings/AgeBandSelector.tsx
- [ ] T103 [US4] Create ThemeExclusionSelector component in apps/mobile/src/components/settings/ThemeExclusionSelector.tsx
- [ ] T104 [US4] Create StoryHistoryScreen in apps/mobile/src/app/settings/history.tsx
- [ ] T105 [US4] Create SettingsScreen (main) in apps/mobile/src/app/(tabs)/settings.tsx
- [ ] T106 [US4] Create ChangePinScreen in apps/mobile/src/app/settings/change-pin.tsx

### Testing for US4

- [ ] T107 [P] [US4] Write unit tests for parental PIN middleware in apps/api/src/middleware/**tests**/parentalPin.test.ts
- [ ] T108 [P] [US4] Write integration tests for settings routes in apps/api/src/routes/**tests**/settings.test.ts
- [ ] T109 [P] [US4] Write unit tests for theme exclusion logic in apps/api/src/services/**tests**/storyGeneration-exclusions.test.ts
- [ ] T110 [P] [US4] Write component tests for parental settings screens in apps/mobile/src/app/settings/**tests**/
- [ ] T111 [US4] Write E2E test for User Story 4 acceptance scenarios (PIN, age band, exclusions) in apps/mobile/**tests**/e2e/us4-parental-controls.test.ts

**Checkpoint**: Parental controls fully functional. Age band and theme exclusions respected in story generation. All US4 tests passing.

---

## Phase 7: User Story 5 - Interactive Story Choices (Priority: P5)

**Goal**: Enable choose-your-own-adventure stories with 2-3 choices at branch points

**Independent Test**: Create interactive story → Reach choice point → Select option → Verify story continues logically → Replay with different choice

### API Implementation for US5

- [ ] T112 [US5] Extend story generation for interactive mode with minimum 3 choice points validation in apps/api/src/services/storyGeneration.ts
- [ ] T113 [US5] Create interactive story prompt templates in apps/api/src/services/prompts.ts
- [ ] T114 [US5] Implement segment audio generation in apps/api/src/jobs/storyWorker.ts
- [ ] T115 [US5] Implement segments endpoint GET /stories/:id/segments in apps/api/src/routes/stories.ts
- [ ] T116 [US5] Implement segment audio endpoint GET /stories/:id/segments/:segmentId/audio in apps/api/src/routes/stories.ts

### Mobile Implementation for US5

- [ ] T117 [P] [US5] Create interactive story hooks (useSegments, useChoice) in apps/mobile/src/hooks/useInteractiveStory.ts
- [ ] T118 [P] [US5] Create interactive story store (current segment, path) in apps/mobile/src/stores/interactiveStore.ts
- [ ] T119 [US5] Create ChoiceButton component in apps/mobile/src/components/story/ChoiceButton.tsx
- [ ] T120 [US5] Create InteractiveStoryScreen in apps/mobile/src/app/story/interactive/[id].tsx
- [ ] T121 [US5] Create SegmentView component in apps/mobile/src/components/story/SegmentView.tsx
- [ ] T122 [US5] Update CreateStoryScreen with interactive mode toggle in apps/mobile/src/app/(tabs)/create.tsx
- [ ] T123 [US5] Create story path tracker utility in apps/mobile/src/utils/storyPath.ts

### Testing for US5

- [ ] T124 [P] [US5] Write unit tests for interactive story generation with choice point validation in apps/api/src/services/**tests**/storyGeneration-interactive.test.ts
- [ ] T125 [P] [US5] Write integration tests for segments endpoints in apps/api/src/routes/**tests**/stories-segments.test.ts
- [ ] T126 [P] [US5] Write component tests for interactive story components in apps/mobile/src/components/story/**tests**/
- [ ] T127 [US5] Write E2E test for User Story 5 acceptance scenarios (choice points, replay) in apps/mobile/**tests**/e2e/us5-interactive-stories.test.ts

**Checkpoint**: Interactive stories fully functional. Multiple playthroughs with different paths work. All US5 tests passing.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T128 Implement offline queue for story generation requests in apps/mobile/src/services/offlineQueue.ts
- [ ] T129 Add retry logic for failed story generations in apps/api/src/jobs/storyWorker.ts
- [ ] T130 Run quickstart.md validation and fix any issues
- [ ] T131 Update README.md with setup and development instructions

## Phase 9: Performance & Code Coverage

**Purpose**: Validate success criteria and ensure quality gates

- [ ] T132 [P] Add performance tests for SC-001 (30s generation time) in apps/api/**tests**/performance/story-generation.test.ts
- [ ] T133 [P] Add performance tests for SC-003 (5s audio start) in apps/mobile/**tests**/performance/audio-playback.test.ts
- [ ] T134 [P] Add performance tests for SC-007 (2s offline access) in apps/mobile/**tests**/performance/offline-access.test.ts
- [ ] T135 Create content safety audit task to validate SC-002 (95% pass rate) in apps/api/**tests**/audit/content-safety.test.ts
- [ ] T136 Verify code coverage meets 80% threshold across all packages
- [ ] T137 Run full E2E test suite across all user stories
- [ ] T138 Generate test coverage report and address gaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all core user stories being complete

### User Story Dependencies

| Story                   | Depends On                     | Can Start After     |
| ----------------------- | ------------------------------ | ------------------- |
| US1 (Generate Story)    | Foundational only              | Phase 2 complete    |
| US2 (Audio Narration)   | US1 (needs story to narrate)   | T043-T046 complete  |
| US3 (Library)           | US1 (needs stories to save)    | T045 complete       |
| US4 (Parental Controls) | US1 (affects story generation) | T043 complete       |
| US5 (Interactive)       | US1, US2 (extends both)        | T043, T067 complete |

### Within Each User Story

1. API implementation before mobile implementation (API provides data)
2. Services before routes
3. Routes before hooks
4. Hooks before screens
5. Core components before screen integration

### Parallel Opportunities

**Phase 1 (Setup)**:

- T002, T003, T004 can run in parallel (different packages)
- T005, T006, T007, T008 can run in parallel (different config files)

**Phase 2 (Foundational)**:

- T011, T012, T013, T014, T015 can run in parallel (different schema files)
- T021, T022, T023, T024, T025 can run in parallel (different lib/middleware files)
- T032, T033, T034, T035, T036, T037 can run in parallel (different mobile files)

**User Stories**:

- US3 and US4 can run in parallel after US1 is complete
- Within each story, API and mobile work can proceed in parallel after routes are defined
- All [P] marked tasks within a phase can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 is complete, launch API tasks in parallel:
Task T041: "Create NVIDIA AI client in apps/api/src/lib/nvidia.ts"
Task T042: "Create story prompt templates in apps/api/src/services/prompts.ts"

# Then sequentially:
Task T043: "Implement StoryGenerationService" (depends on T041, T042)
Task T044: "Create story generation worker" (depends on T043)
Task T045: "Implement story routes" (depends on T043)
Task T046: "Implement auth routes"

# Mobile tasks can start after T045, with parallel opportunities:
Task T047: "Create story hooks"
Task T048: "Create auth hooks"
Task T049: "Create story store"
Task T050, T051, T052: UI components (parallel)

# Then testing tasks:
Task T059-T065: Unit, integration, and E2E tests (parallel where possible)

# Then screen integration sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Generate Story)
4. **STOP and VALIDATE**: Test story generation independently
5. Deploy/demo if ready - users can generate and read stories

### Incremental Delivery

1. **Setup + Foundational** → Foundation ready
2. **Add US1** → Test independently → Deploy (MVP! Users can generate stories)
3. **Add US2** → Test independently → Deploy (Users can listen to stories)
4. **Add US3** → Test independently → Deploy (Users can save stories)
5. **Add US4** → Test independently → Deploy (Parents can configure safety)
6. **Add US5** → Test independently → Deploy (Interactive stories available)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational is complete:

| Developer | Assignment                  | Timeline                           |
| --------- | --------------------------- | ---------------------------------- |
| Dev A     | User Story 1 (API)          | Week 1-2                           |
| Dev B     | User Story 1 (Mobile)       | Week 1-2 (starts after API routes) |
| Dev C     | User Story 3 (Library)      | Week 2 (after US1 API)             |
| Dev A     | User Story 2 (Audio API)    | Week 3                             |
| Dev B     | User Story 2 (Audio Mobile) | Week 3                             |
| Dev C     | User Story 4 (Parental)     | Week 3-4                           |
| All       | User Story 5 (Interactive)  | Week 4-5                           |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Audio narration (US2) enhances US1 but US1 is complete without it
- Library (US3) and Parental (US4) can be developed in parallel
- Interactive mode (US5) is most complex - defer if time constrained
