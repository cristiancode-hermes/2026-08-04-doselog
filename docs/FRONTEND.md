# Frontend Architecture — DoseLog

## Overview

The DoseLog frontend is built with Angular 22 using standalone components, zoneless change detection, and signal-based state management. Styling uses Tailwind CSS v4 with CSS custom properties for the Viridian Calm design system.

## Project Structure

```
apps/web/src/
├── index.html
├── main.ts
├── styles.css                     # Tailwind v4 + design tokens
├── app/
│   ├── app.config.ts              # App configuration (routing, HTTP, zoneless)
│   ├── app.component.ts           # Root component
│   ├── app.routes.ts              # Route definitions
│   ├── models.ts                  # TypeScript interfaces
│   ├── layouts/
│   │   ├── auth-layout.component.ts       # Centered card for login/register
│   │   └── dashboard-layout.component.ts  # Navbar + sidebar/bottom-nav
│   ├── pages/
│   │   ├── login/                 # Login page
│   │   ├── register/              # Register page
│   │   ├── dashboard/             # Main dashboard (today's doses)
│   │   ├── medication-list/       # All medications
│   │   ├── medication-detail/     # Single medication detail
│   │   ├── medication-form/       # Add/edit medication
│   │   ├── calendar/              # Adherence calendar
│   │   ├── refill-log/            # Refill history + supply
│   │   └── settings/              # User preferences
│   ├── services/
│   │   ├── auth.service.ts        # Auth state & operations
│   │   ├── api.service.ts         # Base HTTP wrapper
│   │   ├── auth.interceptor.ts    # JWT injection interceptor
│   │   ├── medications.service.ts # Medication CRUD
│   │   ├── schedules.service.ts   # Schedule CRUD
│   │   ├── doses.service.ts       # Dose logging
│   │   ├── stats.service.ts       # Adherence stats
│   │   ├── refills.service.ts     # Refill CRUD
│   │   └── settings.service.ts    # User preferences
│   ├── guards/
│   │   └── auth.guard.ts          # Route guard (CanActivateFn)
│   └── shared/
│       └── components/
│           ├── dose-card.component.ts         # Individual dose card
│           ├── loading-skeleton.component.ts  # Skeleton loader
│           ├── empty-state.component.ts       # Empty state placeholder
│           ├── error-banner.component.ts      # Error with retry
│           ├── confirm-dialog.component.ts    # Confirmation modal
│           ├── status-badge.component.ts      # Status pill
│           ├── progress-bar.component.ts      # Supply progress bar
│           ├── schedule-modal.component.ts    # Schedule form modal
│           └── refill-modal.component.ts      # Refill form modal
```

## Component State Triad

Every data-fetching page component follows the canonical state pattern with three independent signals:

```typescript
protected readonly items = signal<T[]>([]);
protected readonly loading = signal(true);
protected readonly error = signal('');
```

Template rendering order:
1. **Loading** — Skeleton placeholders
2. **Error** — Error banner with retry button
3. **Empty** — Empty state with CTA
4. **Data** — Normal content rendering

## Services

Services use `providedIn: 'root'` for tree-shakable injection. They expose:

- **Signals** for state (readonly via `.asReadonly()`)
- **Methods** returning `Observable` that also update signals internally
- **HttpClient** injected via `inject(HttpClient)`

### AuthService
```typescript
readonly currentUser = signal<User | null>(null);
readonly token = signal<string | null>(localStorage.getItem('doselog-token'));
readonly isLoggedIn = computed(() => this.token() !== null);
```

### API Pattern
```typescript
// In any service:
private readonly http = inject(HttpClient);
private readonly api = inject(ApiService);

getAll(): Observable<Medication[]> {
  return this.http.get<Medication[]>(`${this.api.baseUrl}/medications`);
}
```

## Auth Interceptor

A functional `HttpInterceptorFn` reads the JWT token from localStorage and injects it into all `/api/` requests:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/')) {
    const token = localStorage.getItem('doselog-token');
    if (token) {
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }));
    }
  }
  return next(req);
};
```

## Auth Guard

The `authGuard` is a `CanActivateFn` that:
1. Checks for token in localStorage
2. If no token → returns `router.parseUrl('/login')`
3. If token but no user profile loaded → calls `authService.getProfile()`
4. On failure → logs out, redirects to login
5. Returns `true` for protected routes

**Never uses `Router.navigate()`** — always returns `UrlTree` via `router.parseUrl()`.

## Route Configuration

All routes use lazy loading via `loadComponent`. Protected routes share the `DashboardLayoutComponent` and apply `canActivate: [authGuard]`.

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./layouts/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
  children: [
    {
      path: '',
      loadComponent: () => import('./pages/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
    },
  ],
}
```

## CSS Architecture

### Design Tokens

All visual tokens are defined as CSS custom properties in `styles.css`:

- `--color-primary`: #0D7C6E (teal)
- `--color-surface`: #FFFFFF (light) / #1A1D1E (dark)
- `--color-bg`: #F4F6F5 (light) / #121415 (dark)
- `--color-ink`: #171A19 (light) / #F0F2F1 (dark)
- Semantic colors: success, warning, danger, info

### Dark Mode

The `.dark` class on `<html>` triggers the dark palette. The ThemeSelector allows Light/Dark/System modes:

```typescript
// Theme service pattern
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
if (theme === 'system') {
  document.documentElement.classList.toggle('dark', prefersDark.matches);
} else {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
```

### Time Window Colors

Morning (🌅 5-11): `#0D7C6E` / `#2DD4BF` border
Afternoon (☀️ 12-16): `#F59E0B` / `#FBBF24` border
Evening (🌆 17-20): `#3B82F6` / `#60A5FA` border
Night (🌙 21-4): `#8B5CF6` / `#A78BFA` border

## Key Page Logic

### Dashboard

The most complex page. Loads 4 data sources in parallel:
1. `DosesService.getToday()` — today's scheduled + logged doses
2. `StatsService.getOverview()` — week adherence, streak, refill alerts
3. `MedicationsService.getAll()` — medication summary cards
4. Loop: `RefillsService.getSupply()` per medication

Renders doses grouped by time window. Each DoseCard has Take/Skip buttons.

### Calendar / History

Monthly grid where each cell shows adherence level as a colored dot. Clicking a day opens a detail panel listing all doses for that day with their status.

### Medication Detail

Combines medication info, schedule list (with add/edit/delete modal), refill summary (last fill + progress bar), and adherence trends (7/30/90 day bars).

## Responsive Design

- **≥1024px (Desktop)**: Two-column dashboard layout, sidebar navigation
- **768–1023px (Tablet)**: Single-column, compact cards
- **<768px (Mobile)**: Bottom navigation bar, stacked layout
