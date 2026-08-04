# 💊 DoseLog — Personal Medication & Supplement Tracker

A calm, reliable companion for managing your daily medication and supplement regimen. Never miss a dose, track your adherence history, and stay ahead of refills with quiet, data-driven confidence.

## Features

- **Medication Management** — Register medications with name, dosage, form, and active ingredient
- **Schedule Management** — Daily, weekly, or PRN (as-needed) schedules with per-dose notes
- **One-Tap Dose Logging** — Log doses as taken, late, or skipped with a single tap
- **Today's Dashboard** — See what's due now, what's been taken, and what's coming up, grouped by time window
- **Adherence Calendar** — Monthly color-coded grid showing daily adherence at a glance
- **Adherence Trends** — 7-day, 30-day, and 90-day adherence percentages
- **Streak Tracking** — Current consecutive on-time days and all-time best streak
- **Refill Tracking** — Log refills, auto-calculate remaining days, and get low-supply alerts
- **Dark Mode** — Full dark mode support with system-preference auto-detection

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (signals, zoneless, standalone) |
| Styling | Tailwind CSS v4 |
| Backend | NestJS 11 with TypeORM 1.x |
| Database | SQLite (dev) / Neon PostgreSQL (production) |
| Auth | JWT with Passport.js, bcryptjs |

## Architecture

```
doselog/
├── apps/
│   ├── api/               # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/          # Auth module (register, login, JWT)
│   │   │   ├── users/         # User entity + service
│   │   │   ├── medications/   # Medication CRUD + stats
│   │   │   ├── schedules/     # Schedule CRUD
│   │   │   ├── doses/         # Dose logging & query
│   │   │   ├── refills/       # Refill CRUD + supply calc
│   │   │   ├── stats/         # Adherence analytics
│   │   │   ├── settings/      # User preferences
│   │   │   └── seed/          # Demo data seeder
│   │   └── data/              # SQLite database files
│   └── web/               # Angular frontend
│       └── src/
│           └── app/
│               ├── pages/         # Page components
│               ├── layouts/       # Auth & dashboard layouts
│               ├── services/      # API services + interceptors
│               ├── guards/        # Auth route guard
│               └── shared/        # Reusable components
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites
- Node.js 22+
- npm

### Setup & Run

```bash
# Install dependencies (from repo root)
npm install

# Backend
cd apps/api
cp .env.example .env  # if exists
npm run build
npm run seed           # seeds demo data
npm start              # starts on http://localhost:3000

# Frontend (separate terminal)
cd apps/web
npx @angular/cli serve  # starts on http://localhost:4200
```

### API Documentation

Once the backend is running, visit http://localhost:3000/api/docs for Swagger documentation.

## Data Model

- **User** — Account with email, name, timezone
- **Medication** — A medication or supplement with dosage, form, and supply info
- **Schedule** — When to take a medication (daily, weekly, or PRN)
- **DoseRecord** — A logged dose with status (taken/late/missed/skipped)
- **Refill** — A pharmacy refill with quantity and optional expiry/lot
- **UserSettings** — Preferences for theme, notifications

## Build Verification

```bash
cd apps/api && npm run build   # Must exit 0
cd apps/web && npx @angular/cli build  # Must exit 0
```
