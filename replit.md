# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo mobile app (BibleStudy AI)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server integration
│   └── integrations-openai-ai-react/   # OpenAI React integration
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## BibleStudy AI Mobile App

### Features
- **Bible Reader**: Browse all 66 Bible books (OT and NT), read chapters verse-by-verse
- **AI Assistant**: Chat with an AI that specializes in:
  - Historical and cultural context
  - Hebrew and Greek original language insights
  - Theological interpretation
- **Bookmarks**: Long-press any verse to save it; view saved verses in the Saved tab
- **Chat History**: Browse and continue past study conversations
- **Navigation**: Swipe through chapters with chapter picker

### App Structure
```text
artifacts/mobile/
├── app/
│   ├── _layout.tsx              # Root layout with providers
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation (Read, Chats, Saved)
│   │   ├── index.tsx            # Bible book browser
│   │   ├── history.tsx          # Chat history
│   │   └── bookmarks.tsx        # Saved verses
│   ├── reader/[book]/[chapter].tsx  # Bible reader
│   └── chat/[id].tsx            # AI chat screen
├── constants/
│   ├── colors.ts                # Navy blue + gold theme
│   └── bible.ts                 # Bible books + sample texts
└── context/
    └── BookmarksContext.tsx     # Bookmark state with AsyncStorage
```

### Backend (API Server)
- `GET /api/openai/conversations` — list conversations
- `POST /api/openai/conversations` — create conversation
- `GET /api/openai/conversations/:id` — get conversation with messages
- `DELETE /api/openai/conversations/:id` — delete conversation
- `GET /api/openai/conversations/:id/messages` — list messages
- `POST /api/openai/conversations/:id/messages` — send message (SSE streaming)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Database

- Tables: `conversations`, `messages`
- Push schema: `pnpm --filter @workspace/db run push`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
