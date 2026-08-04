# Architecture — DoseLog

## Overview

DoseLog is a full-stack medication tracking application built with Angular 22 (standalone, zoneless, signals) on the frontend and NestJS 11 with TypeORM 1.x on the backend. The database uses SQLite for local development with a schema designed for Neon PostgreSQL in production.

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Angular 22 Frontend                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │Medications│ │ History  │ │ Settings │  │
│  │  Page    │ │   Page   │ │  Page    │ │   Page   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │            │            │            │          │
│  ┌────┴────────────┴────────────┴────────────┴────┐    │
│  │              AuthService + Guards                │    │
│  │         (JWT token in localStorage)             │    │
│  └────────────────────┬───────────────────────────┘    │
│                       │ HTTP (Authorization: Bearer)    │
└───────────────────────┼────────────────────────────────┘
                        │
┌───────────────────────┼────────────────────────────────┐
│              NestJS 11 Backend                          │
│  ┌────────────────────┴───────────────────────────┐    │
│  │  JwtAuthGuard + JwtStrategy (Passport.js)      │    │
│  └────────────────────┬───────────────────────────┘    │
│                       │                                 │
│  ┌──────────┐ ┌──────┴──────┐ ┌──────────┐ ┌────────┐ │
│  │ Auth     │ │ Medications │ │ Schedules │ │ Doses  │ │
│  │ Module   │ │   Module    │ │  Module   │ │ Module │ │
│  └────┬─────┘ └──────┬─────┘ └─────┬─────┘ └───┬────┘ │
│       │              │             │            │       │
│  ┌────┴──────────────┴─────────────┴────────────┴───┐  │
│  │           TypeORM + better-sqlite3                │  │
│  │         (entities: User, Medication, Schedule,   │  │
│  │          DoseRecord, Refill, UserSettings)        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (root — better-sqlite3)
├── UsersModule
├── AuthModule (depends on UsersModule, PassportModule, JwtModule)
├── MedicationsModule (depends on AuthModule for JwtAuthGuard)
├── SchedulesModule (depends on AuthModule)
├── DosesModule (depends on AuthModule)
├── StatsModule (depends on AuthModule)
├── RefillsModule (depends on AuthModule)
├── SettingsModule (depends on AuthModule)
└── SeedModule (depends on all entity repos)
```

### Entity Relationships

```
User (1) ───── (N) Medication
User (1) ───── (N) DoseRecord
User (1) ───── (1) UserSettings
Medication (1) ── (N) Schedule
Medication (1) ── (N) DoseRecord
Medication (1) ── (N) Refill
```

### Auth Flow

1. User registers → password hashed with bcryptjs (12 rounds) → JWT issued
2. User logs in → password verified → JWT issued
3. Protected routes → JwtAuthGuard extracts Bearer token → JwtStrategy validates → request.user populated
4. @CurrentUser() decorator extracts user or user.id from request

## Frontend Architecture

### Route Structure

```
/login          — AuthLayout (centered card, no navbar)
/register       — AuthLayout
/dashboard      — DashboardLayout (navbar + sidebar) [guarded]
/medications    — DashboardLayout [guarded]
/medications/new — DashboardLayout [guarded]
/medications/:id — DashboardLayout [guarded]
/medications/:id/edit — DashboardLayout [guarded]
/medications/:id/refills — DashboardLayout [guarded]
/history        — DashboardLayout [guarded]
/settings       — DashboardLayout [guarded]
**              — redirect to /dashboard
```

### Component Tree

```
AppComponent
├── AuthLayoutComponent
│   ├── LoginPageComponent
│   └── RegisterPageComponent
└── DashboardLayoutComponent
    ├── NavbarComponent
    │   ├── Logo
    │   ├── UserMenu (profile, settings, logout)
    │   └── RefillAlertBadge
    ├── Sidebar (desktop) / BottomNav (mobile)
    │   ├── Dashboard link
    │   ├── Medications link
    │   ├── History link
    │   └── Settings link
    └── RouterOutlet
        ├── DashboardPageComponent
        │   ├── TodayTimelineSection
        │   │   └── DoseCardComponent (× N)
        │   ├── WeekAdherenceGridComponent
        │   ├── StreakBadgeComponent
        │   └── RefillAlertBannerComponent
        ├── MedicationListPageComponent
        │   └── MedicationCardComponent (× N)
        ├── MedicationFormPageComponent
        │   ├── MedicationFormComponent
        │   └── ScheduleModalComponent
        ├── MedicationDetailPageComponent
        │   ├── MedicationInfoCardComponent
        │   ├── ScheduleListComponent
        │   ├── RefillSummaryComponent
        │   └── AdherenceTrendChartComponent
        ├── CalendarPageComponent
        │   ├── AdherenceCalendarComponent
        │   └── DayDetailPanelComponent
        ├── RefillLogPageComponent
        │   ├── SupplyStatusCardComponent
        │   ├── RefillHistoryListComponent
        │   └── RefillFormModalComponent
        └── SettingsPageComponent
            ├── ProfileFormComponent
            ├── NotificationPreferencesComponent
            ├── ThemeSelectorComponent
            └── DangerZoneComponent
```

## Data Flow

### Dose Logging Flow

1. User opens Dashboard → `DosesService.getToday()` called → GET /api/doses/today
2. Backend merges scheduled doses with existing records → returns DoseWithMedication[]
3. Frontend renders DoseCards grouped by time window (Morning/Afternoon/Evening/Night)
4. User taps "Take" → `DosesService.log()` called → POST /api/doses/log
5. Backend computes status (taken if ≤30min, late if >30min) → saves → returns DoseRecord
6. Frontend animates card to green ✓ state, updates progress counter

### Adherence Calculation Flow

1. Dashboard loads → `StatsService.getOverview()` called → GET /api/stats/overview
2. Backend aggregates dose records for current week and streak
3. Adherence = taken / (taken + late + missed) × 100 (skipped excluded)
4. Streak = consecutive days where all scheduled doses were 'taken' (not late/missed)
5. Returns: todayProgress, weekAdherence, streak, refillAlerts

### Supply Calculation Flow

1. Refill logged → `RefillsService.create()` → POST /api/medications/:id/refills
2. Supply = totalQuantity (initial) + sum(refill quantities) - count(doses taken/late)
3. DaysLeft = supply / dosesPerDay (from active schedule times count)
4. If daysLeft < refillThreshold → dashboard shows amber RefillAlertBanner

## Key Design Decisions

- **Signal-based state**: All component state uses Angular signals, not RxJS BehaviorSubjects in templates. RxJS Observables are used only for HTTP calls, converted to signals on subscribe.
- **Time window grouping**: Dashboard doses grouped by Morning (5-11), Afternoon (12-16), Evening (17-20), Night (21-4) with themed accent colors.
- **Status computation on backend**: The dose status (taken vs late) is computed server-side based on scheduledTime vs takenTime difference. The frontend sends the raw action ("taken" or "skipped") and the backend determines the status.
- **Streak calculation in-memory**: Streaks are computed in the StatsService by loading dose records and looping backward from today.
- **Supply via query**: Supply is never stored as a cached value — it's always recomputed from refills + dose records.
