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

Environment-aware commands

The repo includes a small wrapper that automatically loads environment variables from `.env` before running `pnpm` workspace commands. Use the `env:*` convenience scripts from the repository root to run common workflows without manually sourcing `.env` each time.

Examples:

```bash
# Start the API server with .env loaded
pnpm run env:api-dev

# Start the mobile dev server with .env loaded
pnpm run env:mobile-dev

# Push DB schema using .env DATABASE_URL
pnpm run env:db-push

# Run the bootstrap helper using .env
pnpm run env:bootstrap-db
```

These scripts call `pnpm` via a thin executable wrapper `pnpm-env` at the repo root, so they behave the same as running `pnpm` but first source `.env`.


## Troubleshooting

**"Cannot connect to database"**
Make sure PostgreSQL is running and your `DATABASE_URL` is correct. On most systems: `sudo service postgresql start`

**"bad api-key" from Bible API**
The BIBLE_API_KEY must come from a registered application on [scripture.api.bible](https://scripture.api.bible), not just an account. Go to My Apps → create an app → copy that app's key.

**App shows blank screen on web**
Wait 15–20 seconds for the JavaScript bundle to compile on first load. Subsequent loads are much faster.

**Port already in use**
Kill the process on the port: `lsof -ti:8080 | xargs kill` (API) or `lsof -ti:18115 | xargs kill` (mobile).

---

## Building for Android & iOS

Below are concise, repeatable options to produce developer and production builds.

1) Quick dev (Expo Go)

- Purpose: fast feedback on a real device or simulator.
- Run from the repo root (loads `.env` via the `env:*` scripts):

```bash
pnpm run env:mobile-dev
# In Expo Dev Tools: choose "Run on Android device/emulator" or "Run on iOS simulator"
# Or open Expo Go on your phone and scan the QR code
```

Notes: this is for development only — it does not produce an APK/IPA.

2) Production / QA builds (EAS Build) — recommended for release

- Purpose: signed AAB/APK (Android) and IPA (iOS) for TestFlight / Play Store.
- Prereqs: Expo account, Apple Developer account (for iOS), `eas-cli`.

```bash
# install EAS CLI
npm install -g eas-cli

# login and configure project
eas login
cd artifacts/mobile
eas build:configure

# Android production AAB
eas build -p android --profile production

# iOS production IPA
eas build -p ios --profile production
```

After the build finishes, download artifacts from the returned URL or via `eas build:view <build-id>`.

To install an APK on a connected Android device:

```bash
adb install path/to/app-release.apk
```

3) Local native builds (Android Studio / Xcode)

- Purpose: full control and native debugging (useful for native modules or local signing).

Android (local):
```bash
cd artifacts/mobile
expo prebuild --platform android
# open the generated Android project in Android Studio
open android
# from Android Studio run on emulator/device or use CLI
npx react-native run-android
```

iOS (local/macOS):
```bash
cd artifacts/mobile
expo prebuild --platform ios
cd ios
pod install
open *.xcworkspace
# build/run from Xcode (select simulator or connected device)
```

Notes:
- For Apple Silicon Macs you may need `arch -x86_64 pod install` in `ios/` if some pods require Intel builds.
- Ensure `ios.bundleIdentifier` / `android.package` are set in `app.json` before building.

4) Troubleshooting specific issues

- `.env` loading: use the wrapper scripts `pnpm run env:api-dev` and `pnpm run env:mobile-dev` to ensure `DATABASE_URL`, `EXPO_PUBLIC_DOMAIN`, and other env vars are available to the process.
- `lightningcss` native binary errors: we set `CSS_TRANSFORMER_WASM=1` in `pnpm-env` so the wasm fallback is preferred when a platform binary is not available.
- CocoaPods problems: run `pod install` from `ios/`, use Rosetta on Apple Silicon if necessary.
- Signing: EAS can manage signing keys/certificates for you; for local Xcode builds configure a Team and provisioning profile in Xcode.

If you'd like, I can start an `eas build` for a chosen platform now (requires Expo login), or run a local `expo prebuild` + open in Xcode/Android Studio—which would you prefer?
