# BibleStudy AI — Architecture & Technical Documentation

This document explains how the project is built, the decisions behind the design, and the project structure in detail. It is written for developers who have general programming experience but may not be familiar with TypeScript, React Native, or the specific tools used here.

---

## Table of Contents

1. [Big Picture Overview](#1-big-picture-overview)
2. [What is a Monorepo?](#2-what-is-a-monorepo)
3. [Project Structure](#3-project-structure)
4. [The Mobile App (Expo / React Native)](#4-the-mobile-app-expo--react-native)
5. [The API Server (Express)](#5-the-api-server-express)
6. [Shared Libraries](#6-shared-libraries)
7. [The Database](#7-the-database)
8. [External APIs](#8-external-apis)
9. [TypeScript — Why and What It Means](#9-typescript--why-and-what-it-means)
10. [State Management](#10-state-management)
11. [Key Technical Decisions](#11-key-technical-decisions)
12. [Data Flow — End to End](#12-data-flow--end-to-end)
13. [Environment Variables and Secrets](#13-environment-variables-and-secrets)

---

## 1. Big Picture Overview

The application is made of two main running processes (called "services"):

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Phone                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │            Mobile App (Expo / React Native)         │   │
│   │   - Bible reader UI                                 │   │
│   │   - Translation picker                              │   │
│   │   - Chat UI                                         │   │
│   │   - Bookmarks (stored locally on device)            │   │
│   └──────────────────┬──────────────────────────────────┘   │
└──────────────────────│──────────────────────────────────────┘
                       │ HTTP requests
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              API Server (Express / Node.js)                  │
│   - Receives requests from the mobile app                    │
│   - Stores/retrieves chat history in PostgreSQL              │
│   - Proxies Bible text requests to Scripture API             │
│   - Streams AI responses from OpenAI                         │
└──────────┬───────────────────────┬───────────────────────────┘
           │                       │
           ▼                       ▼
   ┌───────────────┐    ┌──────────────────────┐
   │  PostgreSQL   │    │  External APIs       │
   │  Database     │    │  - rest.api.bible    │
   │               │    │  - OpenAI (via       │
   │  Stores:      │    │    Replit proxy)     │
   │  - Chats      │    └──────────────────────┘
   │  - Messages   │
   └───────────────┘
```

**Why a separate API server?**
The mobile app cannot safely store secret keys (like the Bible API key or OpenAI key). Anyone could inspect the app's code and steal them. The server acts as a secure middleman — it holds the keys and the mobile app only talks to the server.

---

## 2. What is a Monorepo?

Normally, a frontend app and a backend server are two completely separate projects in separate folders. A **monorepo** puts them together in one repository, with shared code in a `lib/` folder that both can use.

This project uses **pnpm workspaces** to manage this. Think of it as one big project with several sub-projects ("packages") inside it:

```
workspace/
├── artifacts/        ← The apps you actually run
│   ├── api-server/   ← Sub-project 1: the backend
│   └── mobile/       ← Sub-project 2: the mobile app
├── lib/              ← Shared code used by both
│   ├── db/           ← Database connection & table definitions
│   ├── api-spec/     ← API contract (what endpoints exist)
│   └── ...           ← Other shared utilities
└── pnpm-workspace.yaml  ← Tells pnpm where the sub-projects are
```

When you run `pnpm install` at the root, it installs dependencies for all sub-projects at once. The `@workspace/` prefix you see in imports (like `import { db } from "@workspace/db"`) refers to these shared packages.

---

## 3. Project Structure

```
workspace/
│
├── artifacts/
│   ├── api-server/                 # Backend REST API
│   │   ├── src/
│   │   │   ├── app.ts             # Express app setup (CORS, JSON parsing, routes)
│   │   │   ├── index.ts           # Server entry point (starts listening on a port)
│   │   │   ├── lib/
│   │   │   │   └── logger.ts      # Structured logging with Pino
│   │   │   └── routes/
│   │   │       ├── index.ts       # Combines all route groups under /api
│   │   │       ├── health.ts      # GET /api/health — checks the server is up
│   │   │       ├── bible/
│   │   │       │   └── index.ts   # Bible routes (translations, verse fetching)
│   │   │       └── openai/
│   │   │           └── index.ts   # Chat routes (conversations, messages, AI streaming)
│   │   ├── build.mjs              # Build script (bundles TypeScript → JavaScript)
│   │   └── package.json
│   │
│   └── mobile/                    # Expo React Native App
│       ├── app/                   # All screens (Expo Router file-based routing)
│       │   ├── _layout.tsx        # Root layout — wraps whole app with providers
│       │   ├── (tabs)/            # Tab-based screens (the three main tabs)
│       │   │   ├── _layout.tsx    # Tab bar configuration
│       │   │   ├── index.tsx      # "Read" tab — Bible book browser
│       │   │   ├── history.tsx    # "Chats" tab — conversation list
│       │   │   └── bookmarks.tsx  # "Saved" tab — bookmarked verses
│       │   ├── reader/
│       │   │   └── [book]/
│       │   │       └── [chapter].tsx  # Bible reader screen
│       │   └── chat/
│       │       └── [id].tsx           # AI chat screen
│       ├── components/            # Reusable UI pieces
│       │   ├── TranslationPicker.tsx  # Translation selector modal
│       │   └── ErrorBoundary.tsx      # Catches and displays errors gracefully
│       ├── constants/
│       │   ├── bible.ts           # List of all 66 Bible books + sample text
│       │   └── colors.ts          # App color palette (light and dark themes)
│       ├── context/               # Global state shared across screens
│       │   ├── BookmarksContext.tsx   # Manages saved verses
│       │   └── TranslationContext.tsx # Manages selected Bible translation
│       ├── hooks/
│       │   └── useBibleChapter.ts # Fetches verse text for a given chapter
│       └── package.json
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml           # The API contract — defines all endpoints
│   ├── api-client-react/          # AUTO-GENERATED — React hooks to call the API
│   ├── api-zod/                   # AUTO-GENERATED — validation schemas
│   ├── db/
│   │   └── src/
│   │       ├── index.ts           # Exports the database connection
│   │       └── schema/            # Table definitions (conversations, messages)
│   └── integrations-openai-ai-server/
│       └── ...                    # OpenAI client configured for Replit proxy
│
├── pnpm-workspace.yaml            # Monorepo configuration
├── tsconfig.json                  # TypeScript configuration for all packages
└── README.md
```

---

## 4. The Mobile App (Expo / React Native)

### What is React Native?

React Native lets you write mobile apps in JavaScript (or TypeScript) using the same component model as React (for web). Instead of HTML elements like `<div>` and `<span>`, you use mobile-specific components like `<View>`, `<Text>`, and `<FlatList>`. These compile to real native iOS and Android UI components — not a web page inside a wrapper.

### What is Expo?

Expo is a toolchain built on top of React Native that makes development easier. It provides:
- A development server with hot reload
- Pre-built access to device features (camera, haptics, storage)
- The **Expo Go** app so you can test on your phone without a build step

### File-Based Routing (Expo Router)

The `app/` folder structure directly maps to the app's navigation. This is called **file-based routing** — the same idea as Next.js for web.

| File | URL / Route |
|------|------------|
| `app/(tabs)/index.tsx` | The home "Read" tab |
| `app/(tabs)/history.tsx` | The "Chats" tab |
| `app/(tabs)/bookmarks.tsx` | The "Saved" tab |
| `app/reader/[book]/[chapter].tsx` | Reader screen — `[book]` and `[chapter]` are dynamic |
| `app/chat/[id].tsx` | Chat screen — `[id]` is the conversation ID |

The `[square brackets]` in folder/file names mean that part of the route is dynamic (a variable). For example, `reader/genesis/1` and `reader/john/3` both use the same file — the values `genesis` and `john` are passed as parameters.

The `(tabs)` folder with parentheses is a **route group** — it groups screens under the tab bar without adding the word "tabs" to the URL.

### Components and How They Work

Each screen file exports a single **React component** — a function that returns what should be displayed. In TypeScript/React, a component looks like:

```typescript
export default function HomeScreen() {
  const [search, setSearch] = useState(""); // a piece of state

  return (
    <View>                        {/* a container, like <div> */}
      <TextInput                  {/* a text input field */}
        value={search}
        onChangeText={setSearch}  {/* called every time user types */}
      />
    </View>
  );
}
```

The `useState` hook is how you store data that can change and trigger a re-render of the screen. When `setSearch` is called, the component re-renders with the new value.

### Contexts — Sharing State Across Screens

Sometimes multiple screens need access to the same data (e.g., the selected translation, or the list of bookmarks). React **Context** solves this: you wrap the whole app in a "Provider" and any screen can read from it with a hook.

This app has two contexts:

**`TranslationContext`** — stores the currently selected Bible translation:
```typescript
const { translation, setTranslation } = useTranslation();
// translation.id is "de4e12af7f28f599-01" (KJV's API ID)
// translation.abbreviationLocal is "KJV"
```

**`BookmarksContext`** — stores saved verses:
```typescript
const { bookmarks, addBookmark, isBookmarked } = useBookmarks();
```

Both contexts persist their data to the device's local storage (`AsyncStorage`) so they survive app restarts.

### Custom Hooks

A **hook** in React is a function whose name starts with `use`. Hooks let you package up reusable logic.

`useBibleChapter(bookId, chapter, bibleId, apiBase)` is a custom hook that:
1. Starts with sample text shown immediately (no loading flash for already-known chapters)
2. Fires a request to the API server to get real verse text
3. Updates the screen when the response arrives
4. Falls back to sample text if the API fails

---

## 5. The API Server (Express)

### What is Express?

Express is a minimal web framework for Node.js. It listens for HTTP requests (like a web browser or the mobile app would send) and returns responses.

### How Routes Work

Routes are organized in `src/routes/`. Each file exports a **Router** — a mini-app that handles a group of related endpoints.

**`/api/health`** — returns `{ status: "ok" }`. Used to check the server is running.

**`/api/bible/bibles`** — calls `https://rest.api.bible/v1/bibles` and returns a filtered list of translations.

**`/api/bible/bibles/:bibleId/chapters/:chapterId/verses`** — fetches a full chapter from the Scripture API, parses the verse text, and returns it as `[{ verse: 1, text: "..." }, ...]`.

The `:bibleId` and `:chapterId` are URL parameters (like the `[square brackets]` in the mobile routing above).

**`/api/openai/conversations`** — CRUD operations (Create, Read, Update, Delete) for chat sessions stored in the database.

**`/api/openai/conversations/:id/messages`** — sends a message to OpenAI and streams the response back using **Server-Sent Events (SSE)**.

### What is SSE (Server-Sent Events)?

SSE is a way for the server to push data to the client continuously, without the client having to keep asking "are you done yet?". It is used for the streaming AI responses — as OpenAI generates the answer token by token, the server immediately forwards each piece to the mobile app, which displays it in real time.

The mobile app uses `fetch` from `expo/fetch` (which supports streaming) rather than the standard `fetch` API, which does not support reading a stream on React Native.

### Building the Server

The TypeScript source code in `src/` is compiled into a single JavaScript file (`dist/index.mjs`) using **esbuild** — a very fast bundler. This happens automatically when you run `pnpm run dev`.

---

## 6. Shared Libraries

These packages live in `lib/` and are used by both the API server and the mobile app.

### `@workspace/api-spec` — The API Contract

`openapi.yaml` is a YAML file that formally describes every API endpoint: what URL it uses, what parameters it accepts, what it returns, and what errors it can produce.

This file is the single source of truth. From it, two things are auto-generated:

### `@workspace/api-client-react` — Auto-Generated API Hooks

Run `pnpm --filter @workspace/api-spec run codegen` to regenerate. This creates React Query hooks for calling each endpoint:

```typescript
// Instead of writing fetch() manually, you use the generated hook:
const { data: conversations } = useListOpenaiConversations();
const createMutation = useMutation({ mutationFn: createOpenaiConversation });
```

**React Query** is a library that handles caching, loading states, and refetching automatically. When you call a hook, it manages the whole lifecycle.

### `@workspace/api-zod` — Auto-Generated Validation Schemas

Also generated from `openapi.yaml`. Zod is a TypeScript-first validation library. The schemas are used on the server to validate incoming request bodies:

```typescript
const body = CreateOpenaiConversationBody.parse(req.body);
// If req.body doesn't match the expected shape, this throws an error
// before the rest of the route handler runs
```

### `@workspace/db` — Database Connection & Schema

Uses **Drizzle ORM** — a TypeScript-first database library. Instead of writing raw SQL, you define tables as TypeScript objects:

```typescript
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

Drizzle can compare this definition to the actual database and generate the SQL to make them match (`pnpm run push`).

---

## 7. The Database

**PostgreSQL** is used to persist:

| Table | What it stores |
|-------|---------------|
| `conversations` | Chat sessions (id, title, created date) |
| `messages` | Individual messages (role = "user" or "assistant", content, conversation id) |

Bookmarks are NOT stored in the database — they are stored locally on the user's device using `AsyncStorage`. This was a deliberate choice: bookmarks are personal to the user's device and do not need to be synced to a server. This also means the app works offline for bookmarks.

---

## 8. External APIs

### Scripture API (`rest.api.bible`)

Provides Bible text for 2,500+ translations. Requires a free API key from [scripture.api.bible](https://scripture.api.bible).

**Authentication:** `api-key` request header.

**Key endpoints used:**
- `GET /v1/bibles?language=eng` — list translations by language
- `GET /v1/bibles/{id}/chapters/{chapterId}` — get chapter text

The chapter endpoint returns text with verse numbers embedded like `[1] In the beginning... [2] And the earth...`. The server parses these with a regular expression to split them into individual verse objects.

**Book/Chapter ID format:** Uses USFM abbreviations. Examples: `GEN.1` (Genesis chapter 1), `JHN.3` (John chapter 3), `PSA.23` (Psalm 23). Our app stores book IDs in lowercase (`gen`, `jhn`) and converts to uppercase before calling the API.

### OpenAI (via Replit AI Integrations)

The AI chat uses OpenAI's GPT model. Rather than using OpenAI directly (which would require the user to have their own API key), this app uses **Replit's AI Integrations proxy**. Replit manages the API key and billing at the platform level.

The integration is accessed through the `@workspace/integrations-openai-ai-server` package, which exports a pre-configured `openai` client. The server uses this client exactly as you would use the normal OpenAI SDK.

The system prompt instructs the AI to focus on:
- Biblical history and archaeology
- Original Hebrew and Greek language insights
- Theological interpretation
- Cross-references between passages

---

## 9. TypeScript — Why and What It Means

TypeScript is JavaScript with a type system added. Types describe what shape data is expected to have.

**Without TypeScript:**
```javascript
function getBibleText(bookId, chapter) {
  // bookId could be anything — a number, an object, undefined...
  // You only find out something is wrong at runtime
}
```

**With TypeScript:**
```typescript
function getBibleText(bookId: string, chapter: number): BibleVerse[] {
  // TypeScript enforces that bookId is a string and chapter is a number
  // Errors are caught before running the code
}
```

In this project, TypeScript catches mistakes like:
- Passing the wrong type of argument to a function
- Accessing a property that might not exist
- Forgetting to handle the case where data hasn't loaded yet

All TypeScript is compiled to plain JavaScript before running. The `tsconfig.json` files configure how strict this checking is and which JavaScript version to output.

**`composite: true` and project references:** Because this is a monorepo with multiple packages, TypeScript needs to know which packages depend on which. The `references` array in each `tsconfig.json` lists dependencies so TypeScript can build them in the right order and share type information between packages.

---

## 10. State Management

The app uses three layers of state management:

### Local Component State (`useState`)
For UI-only state that does not need to be shared — e.g., whether a modal is open, what the user has typed in the search box.

### React Context
For global state that multiple screens need — the selected translation and the list of bookmarks. Contexts are set up in `app/_layout.tsx` and wrap the entire app.

### React Query (`@tanstack/react-query`)
For server data — fetching and caching API responses. React Query automatically handles:
- Loading and error states
- Caching (so the same data is not fetched twice)
- Invalidation (refreshing data when it becomes stale — e.g., after creating a new conversation)

The `QueryClient` is set up once in `_layout.tsx` and shared via the `QueryClientProvider`.

---

## 11. Key Technical Decisions

### Decision: Monorepo with shared types
**Why:** The API server and the mobile app both work with the same data (conversations, messages, translations). Defining types once in a shared library (`api-spec`, `api-zod`) means if the API changes, TypeScript will immediately flag everywhere in the mobile app that needs updating. This prevents entire classes of bugs where the frontend and backend disagree about data shapes.

### Decision: Auto-generated API client from OpenAPI spec
**Why:** Writing `fetch()` calls by hand is tedious and error-prone. By generating the client from a specification file, adding a new endpoint only requires updating `openapi.yaml` and running codegen — the hooks and validation schemas update automatically.

### Decision: Bible API proxied through our own server
**Why:** The Bible API key must be kept secret. If the mobile app called the Scripture API directly, the key would be visible in the app's network traffic. The server acts as a secure proxy — the mobile app calls `our server`, and the server calls the Scripture API.

### Decision: Bookmarks stored locally (not in database)
**Why:** Simplicity and offline access. Storing bookmarks locally avoids the need for user authentication (you would need to know which user's bookmarks to fetch). `AsyncStorage` persists data to the device's filesystem and survives app restarts.

### Decision: SSE for AI streaming
**Why:** A standard HTTP response waits until all data is ready before sending anything. For an AI response that might take 10–15 seconds, that is a poor user experience. Server-Sent Events push each piece of the response as soon as it arrives, creating the "typing in real time" effect.

### Decision: esbuild for the API server
**Why:** TypeScript must be compiled to JavaScript before Node.js can run it. esbuild is dramatically faster than the TypeScript compiler for this purpose (milliseconds vs seconds). For development velocity this matters a lot. The API server rebuilds in under a second on every `pnpm run dev`.

### Decision: Expo for mobile development
**Why:** Writing separate iOS (Swift) and Android (Kotlin) apps is expensive — two codebases, two skill sets. Expo/React Native lets one TypeScript codebase deploy to both platforms. Expo additionally provides the Expo Go client for instant testing on a real device without a full build step.

---

## 12. Data Flow — End to End

### Reading a Bible Chapter

```
1. User opens Genesis, Chapter 1
   └─► ReaderScreen mounts with bookId="gen", chapter=1

2. useBibleChapter hook fires
   └─► Shows sample text immediately (instant display)
   └─► Sends GET request to API server:
       /api/bible/bibles/de4e12af7f28f599-01/chapters/GEN.1/verses

3. API server receives request
   └─► Calls rest.api.bible with the BIBLE_API_KEY secret
   └─► Receives chapter content as raw text:
       "[1] In the beginning God created... [2] And the earth..."
   └─► Parses with regex → [{ verse: 1, text: "In the beginning..." }, ...]
   └─► Returns JSON array to mobile app

4. Mobile app receives response
   └─► useBibleChapter updates state with real verses
   └─► React re-renders the FlatList with actual Bible text
```

### Sending an AI Message

```
1. User types a message and hits Send
   └─► sendMessage() runs in chat/[id].tsx

2. Message added to local state immediately
   └─► UI shows the user's message right away

3. POST request sent to API server:
   /api/openai/conversations/42/messages
   └─► Body: { content: "What does logos mean in John 1:1?" }

4. API server receives request
   └─► Saves user message to database
   └─► Loads full conversation history from database
   └─► Calls OpenAI with streaming enabled
   └─► Sets response headers for SSE
   └─► For each chunk from OpenAI:
       res.write(`data: ${JSON.stringify({ content: "..." })}\n\n`)

5. Mobile app reads the stream
   └─► expo/fetch ReadableStream is decoded line by line
   └─► Each "data: ..." line is parsed
   └─► streamingContent state is updated with each chunk
   └─► The AI bubble in the chat updates in real time

6. Stream ends
   └─► API server saves complete assistant message to database
   └─► Sends `data: { "done": true }`
   └─► Mobile app finalises the message in state
```

---

## 13. Environment Variables and Secrets

| Variable | Where used | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | API server | PostgreSQL connection string |
| `BIBLE_API_KEY` | API server | Authenticates with rest.api.bible |
| `SESSION_SECRET` | API server | Signs session tokens |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | API server | Replit's OpenAI proxy URL (auto-set by Replit) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API server | Replit's OpenAI proxy key (auto-set by Replit) |
| `EXPO_PUBLIC_DOMAIN` | Mobile app | The domain of the API server — used to build request URLs |
| `PORT` | Both | The port each service listens on (set by Replit, or defaults) |

> Variables prefixed with `EXPO_PUBLIC_` are embedded into the mobile app's JavaScript bundle at build time. They are visible to anyone who inspects the app. Never put secret keys in `EXPO_PUBLIC_` variables — only non-sensitive configuration like the server domain.
