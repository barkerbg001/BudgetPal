# BudgetPal

Personal finance tracker built to demonstrate senior React Native skills: auth, state management, API integration, a custom native module, UI polish, testing, and CI.

## Stack

| Layer | Tech |
| --- | --- |
| Mobile | React Native 0.86, TypeScript, Zustand, React Navigation |
| API | Express, JWT, in-memory store, Swagger UI |
| Native | Custom `BatteryModule` (Kotlin + Swift) |
| Tooling | ESLint, Prettier, Jest, RNTL, GitHub Actions |

## Prerequisites

- Node.js **≥ 22.11**
- JDK **17** (Android)
- Android Studio / SDK (emulator or device)
- Xcode + CocoaPods (iOS)
- Watchman recommended on macOS

## Setup

```bash
# From repo root
npm run install:all

# API env
cp api/.env.example api/.env

# iOS pods (macOS)
cd app/ios && pod install && cd ../..
```

## Run

Use **two terminals**:

```bash
# Terminal 1 — API (http://localhost:3000)
npm run api

# Terminal 2 — app
npm run android
# or
npm run ios
```

Optional Metro-only: `npm run start`

### Demo login

- Email: `demo@budgetpal.app`
- Password: `password123`

### Useful URLs

- API health: http://localhost:3000/api/health
- Swagger: http://localhost:3000/api/docs

### API host from the device

The app points at:

- Android emulator → `http://10.0.2.2:3000/api`
- iOS simulator → `http://localhost:3000/api`

On a physical device, change `app/src/config/api.ts` to your machine’s LAN IP.

## Scripts

| Command | Where | What |
| --- | --- | --- |
| `npm run api` | root | Start API in watch mode |
| `npm run android` / `ios` | root | Build & launch the app |
| `npm run lint` | root | Lint API + app |
| `npm test` | root | App Jest suite |
| `npm run lint` / `test` | `app/` or `api/` | Package-local |

## Features

- Email/password auth with JWT in Keychain
- Protected navigation + session restore
- Dashboard (balance, transactions, loading/error)
- Add transaction with optimistic UI + undo snackbar
- Settings: theme (persisted), savings goal (ZAR), logout
- Financial-health score from battery % + goal progress, with mascot mood
- Confetti when balance crosses the savings goal
- Finance joke of the day (local + JokeAPI fallback)
- Currency formatted as South African rand (ZAR)

## Testing & CI

```bash
cd app && npm test
cd api && npm run lint
```

On push/PR to `main`, GitHub Actions runs:

1. Lint (API + app)
2. Jest tests
3. Android `assembleDebug`

Workflow: `.github/workflows/ci.yml`

## Project layout

```
BudgetPal/
├── api/                 Express REST API + Swagger
├── app/                 React Native app
│   ├── android/         BatteryModule (Kotlin)
│   ├── ios/             BatteryModule (Swift/Obj-C)
│   └── src/             Screens, stores, native bridge
├── .github/workflows/   CI
└── package.json         Root scripts
```

## Work summary

BudgetPal is a compact end-to-end finance demo: an Express JWT API with seeded demo data, and a React Native client using Zustand for `auth` / `transactions` / `ui`. Secure token storage, optimistic creates with undo, theme persistence, and a thin native battery bridge power a “financial health” mascot. Extras include goal confetti and a light joke card. Tooling covers ESLint/Prettier, Jest + Testing Library, and a CI pipeline that builds Android on `main`.

### Trade-offs

- In-memory API (no DB) — fast to demo, resets on restart
- Classic native module bridge (interop-friendly) rather than a full TurboModule codegen package
- Joke “of the day” prefers local finance jokes; remote API is best-effort on refresh
