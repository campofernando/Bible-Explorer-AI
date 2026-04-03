# BibleStudy AI

A mobile Bible study application built with Expo (React Native) and an Express API server. Read the Bible in multiple translations, study passages with an AI assistant, bookmark verses, and track your study history.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Accessing the App](#accessing-the-app)
- [Project Structure Overview](#project-structure-overview)
- [Stopping the Application](#stopping-the-application)

---

## Prerequisites

Before you start, make sure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 24+ | JavaScript runtime |
| pnpm | 9+ | Package manager |
| PostgreSQL | 15+ | Database |

To check what you have installed:

```bash
node --version
pnpm --version
```

To install pnpm if you don't have it:

```bash
npm install -g pnpm
```

---

## Environment Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd workspace
```

### 2. Install all dependencies

This project is a monorepo. A single command installs everything for all packages:

```bash
pnpm install
```

### 3. Configure environment secrets

You need two secrets configured as environment variables. Create a `.env` file at the root or set them in your environment:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/biblestudyai"

# Scripture API key — get a free key at https://scripture.api.bible
# 1. Register or sign in
# 2. Create a new application
# 3. Copy the API key shown for your app
BIBLE_API_KEY="your-api-key-here"

# Secret used to sign sessions (any long random string)
SESSION_SECRET="your-random-secret-here"
```

> If you are running this on Replit, these are configured in the Secrets tab and are injected automatically.

### 4. Set up the database

Push the database schema (creates the required tables):

```bash
If you already have PostgreSQL running locally, push the database schema (creates the required tables):

```bash
pnpm --filter @workspace/db run push
```

If you don't have Postgres provisioned locally, you can use the included bootstrap helper which creates the configured role and database (reads `DATABASE_URL` from `.env`). On macOS install and start Postgres with Homebrew, then run the bootstrap script and push:

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# create role/db from .env and ensure DB exists
pnpm run bootstrap-db

# apply schema
pnpm --filter @workspace/db run push
```

Notes:

- Make the bootstrap script executable if you prefer running it directly:

```bash
chmod +x ./scripts/bootstrap-db.cjs
```

- To remove the database referenced by your `DATABASE_URL` (useful for cleanup/testing), run:

```bash
pnpm run drop-db
```

### 5. Run code generation

Generate the API client code from the OpenAPI specification:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Running the Application

The app has two services that need to run simultaneously. Open two terminal windows.

### Terminal 1 — API Server

```bash
pnpm --filter @workspace/api-server run dev
```

You should see:

```
Server listening  port: 8080
```

The API server runs on **port 8080** and handles:
- Bible translation fetching (proxies to scripture.api.bible)
- AI chat conversations (uses OpenAI GPT)
- Storing bookmarks and chat history in PostgreSQL

### Terminal 2 — Mobile App

```bash
pnpm --filter @workspace/mobile run dev
```

You should see a QR code and the message:

```
Metro waiting on exp://...
Web is waiting on http://localhost:18115
```

---

## Accessing the App

### On a Physical Phone (iOS or Android)

1. Install **Expo Go** from the App Store or Google Play
2. Open Expo Go and scan the QR code shown in Terminal 2
3. The app will load on your phone

### In a Web Browser

Navigate to:

```
http://localhost:18115
```

> Note: Some native features (haptic feedback, blur effects) are not available on web. The core reading and AI features work fully.

### On an Android Emulator

With Android Studio and an emulator running, press `a` in Terminal 2.

### On an iOS Simulator

With Xcode installed, press `i` in Terminal 2.

---

## Project Structure Overview

```
workspace/
├── artifacts/
│   ├── api-server/      # Express REST API (runs on port 8080)
│   └── mobile/          # Expo React Native app
├── lib/
│   ├── api-spec/        # OpenAPI spec — source of truth for the API
│   ├── api-client-react/ # Auto-generated React hooks (from spec)
│   ├── api-zod/         # Auto-generated validation schemas (from spec)
│   ├── db/              # Database schema and connection
│   └── integrations-*/  # AI integration helpers
└── package.json         # Root workspace configuration
```

---

## Stopping the Application

Press `Ctrl + C` in each terminal window to stop the services.

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm --filter @workspace/db run push` | Apply database schema changes |
| `pnpm run bootstrap-db` | Create DB role/database from `.env` (local bootstrap) |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API client code |
| `pnpm --filter @workspace/api-server run dev` | Start the API server |
| `pnpm --filter @workspace/mobile run dev` | Start the mobile app |
| `pnpm run typecheck` | Check TypeScript types across all packages |

---

## Troubleshooting

**"Cannot connect to database"**
Make sure PostgreSQL is running and your `DATABASE_URL` is correct. On most systems: `sudo service postgresql start`

**"bad api-key" from Bible API**
The BIBLE_API_KEY must come from a registered application on [scripture.api.bible](https://scripture.api.bible), not just an account. Go to My Apps → create an app → copy that app's key.

**App shows blank screen on web**
Wait 15–20 seconds for the JavaScript bundle to compile on first load. Subsequent loads are much faster.

**Port already in use**
Kill the process on the port: `lsof -ti:8080 | xargs kill` (API) or `lsof -ti:18115 | xargs kill` (mobile).
