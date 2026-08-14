# BudgetPal

A small, polished personal-finance tracker built to demonstrate senior React Native skills: authentication, state management, API integration, a custom native module, UI polish, testing, and CI.

## Stack

| Layer | Tech |
| --- | --- |
| Mobile | React Native 0.86, TypeScript, Zustand, React Navigation |
| API | Express, JWT, in-memory store, Swagger UI |
| Native | Custom `BatteryModule` (Kotlin + Swift / Obj-C) |
| Tooling | ESLint, Prettier, Jest, React Native Testing Library, GitHub Actions |

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
| `npm run install:all` | root | Install API + app deps |
| `npm run api` | root | Start API in watch mode |
| `npm run android` / `ios` | root | Build & launch the app |
| `npm run lint` | root | Lint API + app |
| `npm test` | root | App Jest suite |
| `npm run lint` / `test` | `app/` or `api/` | Package-local |

## Features

- **Auth** — email/password login, JWT stored in Keychain, session restore, protected navigation
- **Dashboard** — balance card, goal progress, recent transactions, loading & error states
- **History** — full transaction list
- **Add transaction** — bottom sheet form (amount, category, note, date; optional per-tx currency) → POST with optimistic UI and undo snackbar
- **Settings** — light / dark / system theme (persisted), display currency, multi-currency toggle, savings goal, clear-all danger zone
- **Financial health** — custom native `getBatteryLevel()` combined with goal progress → health score + mascot mood
- **Confetti** — fires when balance crosses the savings goal
- **Joke of the day** — `GET /api/jokes` (icanhazdadjoke money search, with local BudgetPal fallbacks)
- **Navigation** — flyout drawer (Home, History, Settings, Log out)

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Login → JWT + user |
| `POST` | `/api/auth/register` | No | Register |
| `GET` | `/api/me` | Yes | Current profile |
| `GET` | `/api/transactions` | Yes | List + balances |
| `POST` | `/api/transactions` | Yes | Create transaction |
| `DELETE` | `/api/transactions` | Yes | Clear all for user |
| `GET` | `/api/jokes?random=` | Yes | Daily or random finance joke |
| `GET` | `/api/health` | No | Health check |
| `GET` | `/api/docs` | No | Swagger UI |

Full OpenAPI: http://localhost:3000/api/docs

## State management

Zustand slices:

- `auth` — login, logout, session restore, token lifecycle
- `transactions` — fetch, optimistic create + undo, clear
- `ui` — theme, currencies, savings goal, snackbar, drawer (persisted via AsyncStorage)

## Native module

`BatteryModule` exposes `getBatteryLevel(): Promise<number>` (0–100):

- Android: Kotlin (`BatteryModule.kt`)
- iOS: Swift + Obj-C bridge (`BatteryModule.swift` / `.m`)

JS wrapper: `app/src/native/battery.ts` (safe fallback when unlinked / in tests).

## Testing & CI

```bash
npm test          # Jest + RNTL (from root)
npm run lint      # API + app
```

On push/PR to `main`, GitHub Actions runs:

1. Lint (API + app)
2. Jest tests
3. Android `assembleDebug` → uploads `budgetpal-debug-apk` as a workflow artifact (14-day retention)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Project layout

```
BudgetPal/
├── api/                 Express REST API + Swagger
│   └── src/
│       ├── routes/      auth, me, transactions, jokes, health, docs
│       ├── data/        in-memory users, transactions, jokes
│       └── docs/        OpenAPI
├── app/                 React Native app
│   ├── android/         BatteryModule (Kotlin)
│   ├── ios/             BatteryModule (Swift / Obj-C)
│   ├── src/             screens, stores, API client, native bridge
│   └── __tests__/       unit + component tests
├── .github/workflows/   CI
└── package.json         Root scripts
```

## Work summary

BudgetPal is an end-to-end finance demo: an Express JWT API with seeded demo data, and a React Native client using Zustand for `auth` / `transactions` / `ui`. Secure Keychain token storage, optimistic creates with undo, persisted theme and currency prefs, and a thin native battery bridge power a financial-health mascot. UI extras include a flyout drawer, bottom-sheet add flow, goal confetti, and a finance joke card served by the API. Tooling covers ESLint/Prettier, Jest + Testing Library, and a CI pipeline that lints, tests, and builds Android on `main`.

### Trade-offs

- In-memory API (no DB) — fast to demo, resets on restart
- Classic native module bridge (interop-friendly) rather than a full TurboModule codegen package
- Demo FX rates for multi-currency display — enough to show conversion UX without a live rates service
- Joke upstream (`icanhazdadjoke`) is cached in-process with local fallbacks if the network fails
