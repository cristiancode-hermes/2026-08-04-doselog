# API Documentation — DoseLog

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "password": "securePassword123",
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "alex@example.com",
    "name": "Alex Rivera",
    "timezone": "America/New_York"
  }
}
```

**Errors:** 409 (email taken), 400 (validation)

### POST /api/auth/login
Sign in with existing credentials.

**Request:**
```json
{
  "email": "alex@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "...", "name": "...", "timezone": "..." }
}
```

**Errors:** 401 (invalid credentials)

### GET /api/auth/profile
Get current user profile. Requires JWT.

**Response (200):**
```json
{ "user": { "id": "uuid", "email": "...", "name": "...", "timezone": "..." } }
```

### PATCH /api/auth/profile
Update profile fields. Requires JWT.

**Request:** Any subset of `{ name, email, timezone }`

**Response (200):** Updated user object

### DELETE /api/auth/account
Delete account and all associated data. Requires JWT.

**Response:** 204 No Content

---

## Medications

All endpoints require JWT authentication.

### GET /api/medications
List all active medications.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Metformin",
    "activeIngredient": "Metformin HCl",
    "dosage": 500,
    "unit": "mg",
    "form": "tablet",
    "totalQuantity": 90,
    "refillThreshold": 7,
    "notes": "Take with food",
    "isActive": true,
    "createdAt": "2026-08-01T00:00:00Z"
  }
]
```

### GET /api/medications/archived
List archived (soft-deleted) medications.

### GET /api/medications/:id
Get medication detail.

### GET /api/medications/:id/stats
Get adherence and supply statistics for one medication.

**Response (200):**
```json
{
  "adherence": 92,
  "streak": 12,
  "remaining": 45,
  "daysLeft": 12
}
```

### POST /api/medications
Create a new medication.

**Request:**
```json
{
  "name": "Metformin",
  "activeIngredient": "Metformin HCl",
  "dosage": 500,
  "unit": "mg",
  "form": "tablet",
  "totalQuantity": 90,
  "refillThreshold": 7,
  "notes": "Take with food"
}
```

**Required:** name, dosage, unit, form

### PATCH /api/medications/:id
Update medication fields.

### DELETE /api/medications/:id
Archive (soft-delete) medication. Dose history preserved.

### PATCH /api/medications/:id/unarchive
Restore archived medication.

---

## Schedules

### GET /api/medications/:medId/schedules
List schedules for a medication.

### POST /api/medications/:medId/schedules
Create schedule.

**Request (Daily):**
```json
{
  "type": "daily",
  "times": [{ "hour": 8, "minute": 0 }, { "hour": 18, "minute": 0 }],
  "startDate": "2026-08-04",
  "notes": "Take with meals"
}
```

**Request (Weekly):**
```json
{
  "type": "weekly",
  "times": [{ "hour": 8, "minute": 0 }],
  "daysOfWeek": [0, 1, 2, 3, 4],
  "startDate": "2026-08-04"
}
```

**Request (PRN):**
```json
{
  "type": "prn",
  "times": [],
  "maxPerDay": 4,
  "startDate": "2026-08-04"
}
```

### PATCH /api/schedules/:id
Update schedule.

### DELETE /api/schedules/:id
Delete schedule. Past dose records preserved.

---

## Dose Records

### GET /api/doses/today
Get today's scheduled doses with their current status. Returns merged view of scheduled doses + logged records.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "medicationId": "uuid",
    "scheduleId": "uuid",
    "scheduledTime": "2026-08-04T08:00:00Z",
    "takenTime": "2026-08-04T07:55:00Z",
    "status": "taken",
    "medication": { "name": "Metformin", "dosage": 500, "unit": "mg" }
  },
  {
    "medicationId": "uuid",
    "scheduleId": "uuid",
    "scheduledTime": "2026-08-04T18:00:00Z",
    "status": "upcoming",
    "medication": { "name": "Metformin", "dosage": 500, "unit": "mg" }
  }
]
```

### GET /api/doses
Filtered dose history.

**Query params:** `date`, `medicationId`, `status`

### GET /api/doses/date/:date
All doses for a specific date (format: YYYY-MM-DD).

### POST /api/doses/log
Log a dose.

**Request:**
```json
{
  "medicationId": "uuid",
  "scheduleId": "uuid",
  "scheduledTime": "2026-08-04T08:00:00Z",
  "status": "taken",
  "notes": ""
}
```

**Status computation:**
- If status = "skipped" → record as skipped
- If taken within 30min of scheduledTime → record as taken
- If taken >30min after scheduledTime → record as late

### PATCH /api/doses/:id
Update dose record (status, notes).

---

## Adherence Stats

### GET /api/stats/week
Daily adherence for the current week (Mon-Sun).

**Response (200):**
```json
{
  "daily": [
    { "date": "2026-08-03", "adherence": 100, "taken": 2, "late": 0, "skipped": 0, "missed": 0, "total": 2 },
    { "date": "2026-08-04", "adherence": 80, "taken": 1, "late": 1, "skipped": 0, "missed": 0, "total": 2 }
  ]
}
```

### GET /api/stats/month/:year/:month
Daily adherence for a specific month.

### GET /api/stats/trends
Adherence trends across 7, 30, and 90 day windows.

**Response (200):**
```json
{
  "overall": { "7d": 86, "30d": 92, "90d": 94 },
  "byMedication": [
    { "medicationId": "uuid", "medicationName": "Metformin", "7d": 85, "30d": 92, "90d": 95 }
  ]
}
```

### GET /api/stats/streak
Current and best streak.

**Response (200):**
```json
{
  "current": 12,
  "best": 30,
  "byMedication": [{ "medicationId": "uuid", "name": "Metformin", "current": 12, "best": 30 }]
}
```

### GET /api/stats/overview
Dashboard overview — today's progress, week adherence, streak, refill alerts.

**Response (200):**
```json
{
  "todayProgress": { "taken": 2, "total": 3, "percent": 66 },
  "weekAdherence": 88,
  "streak": 12,
  "refillAlerts": [{ "medicationName": "Metformin", "daysLeft": 5 }]
}
```

---

## Refills

### GET /api/medications/:medId/refills
List refills for a medication.

### GET /api/medications/:medId/supply
Get supply status.

**Response (200):**
```json
{
  "remaining": 45,
  "daysLeft": 22,
  "threshold": 7,
  "alert": false
}
```

### POST /api/medications/:medId/refills
Log a new refill.

**Request:**
```json
{
  "fillDate": "2026-08-01",
  "quantity": 90,
  "expiryDate": "2027-08-01",
  "lotNumber": "MFR-12345",
  "notes": ""
}
```

### PATCH /api/refills/:id
Update refill.

### DELETE /api/refills/:id
Delete refill record.

---

## Settings

### GET /api/settings
Get user preferences. Returns defaults if never set.

**Response (200):**
```json
{
  "theme": "system",
  "notifyAtDoseTime": true,
  "notifyBefore15min": false,
  "notifyDailySummary": false,
  "notifyRefill": true,
  "notifyMissedDose": true
}
```

### PATCH /api/settings
Update user preferences. Creates settings record if none exists.

**Request:** Any subset of settings fields
