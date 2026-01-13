# Research: AI Storyteller for Kids

**Feature**: 001-ai-kids-storyteller  
**Date**: January 13, 2026

## Executive Summary

This document consolidates research findings for building an AI-powered storytelling app for children. Key decisions cover AI model selection, TTS implementation, mobile architecture, and offline storage strategies.

---

## 1. AI Story Generation

### Decision: NVIDIA API with OpenAI-compatible SDK

**Rationale**: NVIDIA provides OpenAI-compatible API endpoints, allowing use of the familiar OpenAI SDK with minimal code changes. This provides access to powerful LLMs while maintaining flexibility to switch providers.

**Recommended Models** (from build.nvidia.com):

| Model                                    | Use Case                   | Notes                                                  |
| ---------------------------------------- | -------------------------- | ------------------------------------------------------ |
| `meta/llama-3.3-70b-instruct`            | Primary story generation   | Strong reasoning, creative text, instruction following |
| `meta/llama-3.1-8b-instruct`             | Fallback/cost optimization | Smaller, faster, still capable                         |
| `nvidia/llama-3.1-nemotron-70b-instruct` | Alternative                | Enhanced instruction following                         |

**Implementation Pattern**:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const completion = await client.chat.completions.create({
  model: 'meta/llama-3.3-70b-instruct',
  messages: [{ role: 'user', content: storyPrompt }],
  temperature: 0.7, // Creativity balance
  max_tokens: 2048, // ~1000 words for long stories
  stream: true,
});
```

**Content Safety Considerations**:

- Use system prompts with explicit child-safety instructions
- Consider `nvidia/llama-3.1-nemoguard-8b-content-safety` for post-generation filtering
- Age-band specific vocabulary and theme constraints in prompts

**Alternatives Considered**:

- OpenAI GPT-4: Higher cost, potential rate limits
- Local models: Latency and infrastructure complexity
- Other cloud APIs: Less OpenAI SDK compatibility

---

## 2. Text-to-Speech (TTS)

### Decision: edge-tts-universal

**Rationale**: Free Microsoft Edge TTS service with high-quality neural voices, no API keys required, works in Node.js and React Native environments.

**Key Features**:

- 🆓 Free (uses Microsoft Edge's TTS service)
- 🎵 High-quality neural voices
- 🌍 Multiple languages and voice options
- 📝 Word boundary events for text highlighting
- 🔄 Streaming support for real-time playback

**Recommended Voices for Kids**:
| Voice | Language | Character |
|-------|----------|-----------|
| `en-US-AnaNeural` | English (US) | Child female voice |
| `en-US-GuyNeural` | English (US) | Friendly male narrator |
| `en-US-JennyNeural` | English (US) | Warm female narrator |
| `en-US-EmmaMultilingualNeural` | English (Multi) | Clear, expressive |

**Implementation Pattern (Node.js)**:

```typescript
import { EdgeTTS } from 'edge-tts-universal';

const tts = new EdgeTTS(storyText, 'en-US-AnaNeural');
const result = await tts.synthesize();

// Save audio buffer
const audioBuffer = Buffer.from(await result.audio.arrayBuffer());
await fs.writeFile('story.mp3', audioBuffer);

// Word boundaries for highlighting
const wordBoundaries = result.metadata?.wordBoundaries || [];
```

**Alternatives Considered**:

- Google Cloud TTS: Requires API key, cost per character
- Amazon Polly: Same as above
- Expo Speech API: Lower quality, no word boundaries
- NVIDIA Magpie TTS: Requires NVIDIA infrastructure

---

## 3. Mobile Architecture

### Decision: React Native with Expo (Managed Workflow)

**Rationale**: Expo provides faster development, OTA updates, and eliminates native build complexity while maintaining access to necessary features.

**Key Libraries**:

| Category       | Library                                     | Purpose                  |
| -------------- | ------------------------------------------- | ------------------------ |
| Navigation     | `@react-navigation/native` v6+              | Screen navigation        |
| State (Global) | `zustand`                                   | Simple, performant state |
| State (Server) | `@tanstack/react-query`                     | API caching, offline     |
| Forms          | `react-hook-form` + `zod`                   | Validation               |
| Styling        | `nativewind`                                | Tailwind CSS             |
| HTTP           | `axios`                                     | API calls                |
| Storage        | `@react-native-async-storage/async-storage` | Simple data              |
| Storage (Fast) | `react-native-mmkv`                         | Performance-critical     |
| Audio          | `expo-av`                                   | Audio playback           |

**Offline Strategy**:

- TanStack Query with persistence for API cache
- Stories saved with audio to local storage
- AsyncStorage for settings and metadata
- MMKV for frequently accessed data

**Alternatives Considered**:

- React Native CLI: More native control but complex setup
- Flutter: Different ecosystem, team skill mismatch
- Native iOS/Android: 2x development effort

---

## 4. Backend Architecture

### Decision: Express.js with Fastify consideration

**Rationale**: Express.js is familiar, well-documented, and has mature ecosystem. Fastify offers better performance if needed later.

**Key Components**:

| Component  | Technology | Purpose                          |
| ---------- | ---------- | -------------------------------- |
| Framework  | Express.js | HTTP server, routing             |
| ORM        | Prisma     | Type-safe database access        |
| Database   | PostgreSQL | Primary data store               |
| Cache      | Redis      | Sessions, rate limiting          |
| Queue      | BullMQ     | Background jobs (TTS generation) |
| Logging    | Pino       | Structured JSON logs             |
| Validation | Zod        | Runtime validation               |

**Background Job Strategy**:
Story generation workflow:

1. User requests story → API creates job
2. BullMQ worker processes:
   - Generate story text (NVIDIA API)
   - Generate audio (edge-tts)
   - Store results in PostgreSQL
3. Client polls or receives webhook

**Alternatives Considered**:

- NestJS: More opinionated, steeper learning curve
- Fastify: Better perf, less middleware ecosystem
- Serverless: Cold starts problematic for streaming

---

## 5. Audio Storage & Delivery

### Decision: Store pre-generated audio with stories

**Rationale**: Pre-generating audio during story creation ensures instant playback and offline availability, trading storage for user experience.

**Storage Estimates**:

- Short story (~300 words): ~500KB MP3
- Medium story (~600 words): ~800KB MP3
- Long story (~1000 words): ~1.2MB MP3
- 50 stories max: ~15-50MB total

**Storage Strategy**:
| Environment | Storage | Format |
|-------------|---------|--------|
| Backend | PostgreSQL (bytea) or S3 | MP3, base64/binary |
| Mobile | FileSystem + AsyncStorage | MP3 files + metadata |

**Offline Flow**:

1. Story saved → audio file stored locally
2. Metadata in AsyncStorage references file path
3. Playback reads from local file

**Alternatives Considered**:

- Stream from server: Requires connectivity
- Generate on-device: High latency, battery drain
- CDN storage: Additional infrastructure

---

## 6. Authentication & Parental Controls

### Decision: JWT with refresh token rotation

**Rationale**: Standard, stateless auth that works well with mobile apps. Refresh tokens stored securely on device.

**Implementation**:

- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry, rotation on use
- Secure storage: Expo SecureStore
- Parental PIN: Separate encrypted storage

**Parental Control Flow**:

1. Parent sets 4-digit PIN during setup
2. PIN required to access Settings
3. Age band stored in user profile
4. Story generation includes age context

---

## 7. Content Safety Architecture

### Decision: Multi-layer safety approach

**Layers**:

1. **Prompt Engineering**: System prompts with explicit safety instructions
2. **Age-Band Context**: Vocabulary/theme constraints per age group
3. **Post-Generation Filter**: Optional content safety model
4. **Client-Side**: Theme exclusion settings respected

**Age Band Definitions**:
| Band | Age | Vocabulary | Themes | Max Complexity |
|------|-----|------------|--------|----------------|
| 1 | 3-5 | Simple, ~500 words | Animals, friendship | Very simple plots |
| 2 | 6-8 | Moderate, ~2000 words | Adventure, fantasy | Simple conflicts |
| 3 | 9-10 | Rich, ~5000 words | Mystery, exploration | Complex narratives |

---

## 8. Interactive Story (Choose Your Own Adventure)

### Decision: Branch-point structure with pre-generated paths

**Rationale**: Pre-generate 2-3 choices at branch points during story creation. Limits complexity while providing meaningful choices.

**Data Structure**:

```typescript
interface StorySegment {
  id: string;
  content: string;
  audioUrl: string;
  choices?: Choice[];
  isEnding?: boolean;
}

interface Choice {
  id: string;
  text: string;
  nextSegmentId: string;
}
```

**Generation Strategy**:

- Generate main story with 3 branch points
- At each branch, generate 2-3 short continuations
- Total segments: ~10-15 per interactive story
- Audio generated for each segment

---

## Key Decisions Summary

| Decision          | Choice                       | Confidence             |
| ----------------- | ---------------------------- | ---------------------- |
| AI Provider       | NVIDIA API (OpenAI SDK)      | High                   |
| AI Model          | meta/llama-3.3-70b-instruct  | Medium (test required) |
| TTS Provider      | edge-tts-universal           | High                   |
| Mobile Framework  | React Native + Expo          | High                   |
| State Management  | Zustand + TanStack Query     | High                   |
| Backend Framework | Express.js                   | High                   |
| Database          | PostgreSQL + Prisma          | High                   |
| Audio Storage     | Pre-generated, local storage | High                   |
| Auth              | JWT with refresh rotation    | High                   |

---

## Open Questions (Resolved)

1. ~~Which NVIDIA model performs best for kids' stories?~~ → Start with llama-3.3-70b-instruct, benchmark others
2. ~~How to handle TTS word boundaries in React Native?~~ → Store boundaries with audio, use expo-av for playback sync
3. ~~Offline sync strategy?~~ → Local-first with TanStack Query persistence
