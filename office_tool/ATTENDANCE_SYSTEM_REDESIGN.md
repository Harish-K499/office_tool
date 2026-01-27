# VTAB Square Attendance System - Enterprise Redesign
## Backend-Authoritative Architecture (Zoho People Standard)

**Version:** 2.0  
**Date:** January 6, 2026  
**Architect:** Principal Software Architect  

---

## 📐 1. FINAL ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VTAB SQUARE ATTENDANCE SYSTEM                          │
│                         Backend-Authoritative Architecture                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER (Stateless)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Device A      │  │   Device B      │  │   Device C      │                  │
│  │   (Browser)     │  │   (Mobile)      │  │   (Tablet)      │                  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                  │
│           │                    │                    │                            │
│           │    NO localStorage │    NO setInterval  │    NO timer state          │
│           │                    │                    │                            │
│           └────────────────────┼────────────────────┘                            │
│                                │                                                  │
│                    ┌───────────▼───────────┐                                     │
│                    │   Render Engine       │                                     │
│                    │   elapsed = server_now│                                     │
│                    │   - checkin_utc       │                                     │
│                    │   + total_seconds     │                                     │
│                    └───────────┬───────────┘                                     │
└────────────────────────────────┼─────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
              │ REST API  │ │ Socket  │ │ Polling   │
              │ /status   │ │ Events  │ │ Fallback  │
              └─────┬─────┘ └────┬────┘ └─────┬─────┘
                    │            │            │
┌───────────────────┼────────────┼────────────┼────────────────────────────────────┐
│                   │            │            │                                     │
│              ┌────▼────────────▼────────────▼────┐                               │
│              │        API GATEWAY                 │                               │
│              │   (Rate Limiting, Auth, Routing)   │                               │
│              └────────────────┬──────────────────┘                               │
│                               │                                                   │
│              ┌────────────────▼──────────────────┐                               │
│              │      FLASK BACKEND SERVER          │                               │
│              │   ┌───────────────────────────┐   │                               │
│              │   │   Attendance Service       │   │                               │
│              │   │   - check_in()            │   │                               │
│              │   │   - check_out()           │   │                               │
│              │   │   - get_status()          │   │                               │
│              │   │   - auto_close_sessions() │   │                               │
│              │   └───────────────────────────┘   │                               │
│              │   ┌───────────────────────────┐   │                               │
│              │   │   Time Service (UTC ONLY)  │   │                               │
│              │   │   - get_server_now_utc()  │   │                               │
│              │   │   - calc_elapsed()        │   │                               │
│              │   │   - derive_status()       │   │                               │
│              │   └───────────────────────────┘   │                               │
│              │   ┌───────────────────────────┐   │                               │
│              │   │   Scheduler Service        │   │                               │
│              │   │   - midnight_job()        │   │                               │
│              │   │   - auto_checkout_job()   │   │                               │
│              │   │   - lock_day_job()        │   │                               │
│              │   └───────────────────────────┘   │                               │
│              └────────────────┬──────────────────┘                               │
│                               │                                                   │
│              ┌────────────────▼──────────────────┐                               │
│              │      SOCKET.IO SERVER              │                               │
│              │   (Event Broadcaster ONLY)         │                               │
│              │   ❌ NO state storage              │                               │
│              │   ❌ NO timer memory               │                               │
│              │   ✅ Broadcast: attendance:changed │                               │
│              └────────────────┬──────────────────┘                               │
│                               │                                                   │
│                    BACKEND LAYER (Single Source of Truth)                        │
└───────────────────────────────┼──────────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────────────────┐
│                         DATABASE LAYER (Dataverse)                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │                    crc6f_attendance_records                              │     │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │     │
│  │  │ attendance_id          │ GUID (PK)                              │    │     │
│  │  │ employee_id            │ FK to employee_master                  │    │     │
│  │  │ attendance_date        │ DATE (YYYY-MM-DD)                      │    │     │
│  │  │ checkin_utc_timestamp  │ DATETIME (UTC)                         │    │     │
│  │  │ checkout_utc_timestamp │ DATETIME (UTC) NULL                    │    │     │
│  │  │ last_session_start_utc │ DATETIME (UTC)                         │    │     │
│  │  │ total_seconds_today    │ INT (accumulated)                      │    │     │
│  │  │ is_active_session      │ BOOLEAN                                │    │     │
│  │  │ status_code            │ ENUM (A, HL, P, LOCKED)                │    │     │
│  │  │ is_day_locked          │ BOOLEAN                                │    │     │
│  │  │ created_at_utc         │ DATETIME (UTC)                         │    │     │
│  │  │ updated_at_utc         │ DATETIME (UTC)                         │    │     │
│  │  └─────────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │                    crc6f_attendance_sessions                             │     │
│  │  (Audit trail for multiple check-in/check-out pairs per day)            │     │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │     │
│  │  │ session_id             │ GUID (PK)                              │    │     │
│  │  │ attendance_id          │ FK to attendance_records               │    │     │
│  │  │ session_start_utc      │ DATETIME (UTC)                         │    │     │
│  │  │ session_end_utc        │ DATETIME (UTC) NULL                    │    │     │
│  │  │ session_seconds        │ INT                                    │    │     │
│  │  │ checkin_location       │ JSON {lat, lng, accuracy}              │    │     │
│  │  │ checkout_location      │ JSON {lat, lng, accuracy}              │    │     │
│  │  │ is_auto_closed         │ BOOLEAN                                │    │     │
│  │  │ close_reason           │ ENUM (USER, MIDNIGHT, ADMIN, SYSTEM)   │    │     │
│  │  └─────────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                           SCHEDULER (APScheduler / Celery)                        │
│  ┌────────────────────────────────────────────────────────────────────────┐      │
│  │  Job: auto_checkout_active_sessions                                    │      │
│  │  Schedule: Daily at 23:59:00 UTC (or configurable workday end)         │      │
│  │  Action: Close all is_active_session=true, set is_auto_closed=true     │      │
│  ├────────────────────────────────────────────────────────────────────────┤      │
│  │  Job: lock_previous_day                                                │      │
│  │  Schedule: Daily at 00:05:00 UTC                                       │      │
│  │  Action: Set is_day_locked=true for all records of yesterday           │      │
│  ├────────────────────────────────────────────────────────────────────────┤      │
│  │  Job: mark_absent_employees                                            │      │
│  │  Schedule: Daily at 00:10:00 UTC                                       │      │
│  │  Action: Create 'A' records for employees with no attendance           │      │
│  └────────────────────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ 2. UPDATED DATABASE SCHEMA

### 2.1 Primary Attendance Table: `crc6f_attendance_records`

| Column Name | Dataverse Type | Description | Constraints |
|-------------|----------------|-------------|-------------|
| `crc6f_attendance_recordsid` | GUID | Primary Key | Auto-generated |
| `crc6f_attendance_id` | String(20) | Business Key | Unique, Format: ATD-XXXXXXX |
| `crc6f_employee_id` | String(20) | Employee FK | NOT NULL, FK to crc6f_table12s |
| `crc6f_attendance_date` | Date | Attendance Date | NOT NULL, YYYY-MM-DD |
| `crc6f_checkin_utc` | DateTime | First check-in UTC | NULL until first check-in |
| `crc6f_checkout_utc` | DateTime | Last check-out UTC | NULL if session active |
| `crc6f_last_session_start_utc` | DateTime | Current session start | NULL if no active session |
| `crc6f_total_seconds_today` | Integer | Accumulated seconds | Default: 0 |
| `crc6f_is_active_session` | Boolean | Session running? | Default: false |
| `crc6f_status_code` | OptionSet | A/HL/P/LOCKED | Default: A |
| `crc6f_is_day_locked` | Boolean | Day finalized? | Default: false |
| `crc6f_checkin_location` | String(500) | JSON location data | NULL allowed |
| `crc6f_checkout_location` | String(500) | JSON location data | NULL allowed |
| `crc6f_session_count` | Integer | Number of sessions | Default: 0 |
| `crc6f_auto_closed` | Boolean | System closed? | Default: false |
| `crc6f_close_reason` | OptionSet | USER/MIDNIGHT/ADMIN | NULL allowed |
| `crc6f_created_at_utc` | DateTime | Record creation UTC | Auto |
| `crc6f_updated_at_utc` | DateTime | Last update UTC | Auto-updated |

### 2.2 Session Audit Table: `crc6f_attendance_sessions`

| Column Name | Dataverse Type | Description | Constraints |
|-------------|----------------|-------------|-------------|
| `crc6f_attendance_sessionsid` | GUID | Primary Key | Auto-generated |
| `crc6f_session_id` | String(20) | Business Key | Unique, Format: SES-XXXXXXX |
| `crc6f_attendance_id` | String(20) | FK to attendance | NOT NULL |
| `crc6f_session_start_utc` | DateTime | Session start UTC | NOT NULL |
| `crc6f_session_end_utc` | DateTime | Session end UTC | NULL if active |
| `crc6f_session_seconds` | Integer | Duration in seconds | Default: 0 |
| `crc6f_checkin_location` | String(500) | JSON location | NULL allowed |
| `crc6f_checkout_location` | String(500) | JSON location | NULL allowed |
| `crc6f_is_active` | Boolean | Session running? | Default: true |
| `crc6f_close_reason` | OptionSet | USER/MIDNIGHT/ADMIN/SYSTEM | NULL allowed |
| `crc6f_created_at_utc` | DateTime | Record creation | Auto |

### 2.3 Composite Index Requirements

```sql
-- Primary lookup index
CREATE INDEX idx_attendance_employee_date 
ON crc6f_attendance_records (crc6f_employee_id, crc6f_attendance_date);

-- Active session lookup
CREATE INDEX idx_attendance_active 
ON crc6f_attendance_records (crc6f_is_active_session) 
WHERE crc6f_is_active_session = true;

-- Unlocked days for editing
CREATE INDEX idx_attendance_unlocked 
ON crc6f_attendance_records (crc6f_is_day_locked, crc6f_attendance_date);
```

---

## 🔌 3. REVISED API CONTRACTS

### 3.1 Check-In Endpoint

**POST** `/api/v2/attendance/checkin`

**Request:**
```json
{
  "employee_id": "EMP001",
  "timezone": "Asia/Kolkata",
  "location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "accuracy_m": 10
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "attendance_id": "ATD-A1B2C3D",
  "session_id": "SES-X1Y2Z3A",
  "checkin_utc": "2026-01-06T03:45:00.000Z",
  "server_now_utc": "2026-01-06T03:45:00.123Z",
  "total_seconds_today": 0,
  "is_active_session": true,
  "session_count": 1,
  "status_code": "A",
  "display": {
    "checkin_local": "09:15:00",
    "date_local": "2026-01-06",
    "timezone": "Asia/Kolkata"
  }
}
```

**Response (Already Checked In - 200):**
```json
{
  "success": true,
  "already_checked_in": true,
  "attendance_id": "ATD-A1B2C3D",
  "checkin_utc": "2026-01-06T03:45:00.000Z",
  "server_now_utc": "2026-01-06T04:15:00.123Z",
  "elapsed_seconds": 1800,
  "total_seconds_today": 1800,
  "is_active_session": true,
  "status_code": "A"
}
```

**Response (Day Locked - 403):**
```json
{
  "success": false,
  "error": "ATTENDANCE_DAY_LOCKED",
  "message": "Attendance for 2026-01-05 is locked. Contact admin for changes."
}
```

---

### 3.2 Check-Out Endpoint

**POST** `/api/v2/attendance/checkout`

**Request:**
```json
{
  "employee_id": "EMP001",
  "timezone": "Asia/Kolkata",
  "location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "accuracy_m": 15
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "attendance_id": "ATD-A1B2C3D",
  "session_id": "SES-X1Y2Z3A",
  "checkout_utc": "2026-01-06T12:45:00.000Z",
  "server_now_utc": "2026-01-06T12:45:00.456Z",
  "session_seconds": 32400,
  "total_seconds_today": 32400,
  "is_active_session": false,
  "status_code": "P",
  "display": {
    "checkout_local": "18:15:00",
    "duration_text": "9 hours 0 minutes",
    "status_label": "Present"
  }
}
```

**Response (No Active Session - 400):**
```json
{
  "success": false,
  "error": "NO_ACTIVE_SESSION",
  "message": "No active check-in session found for today."
}
```

---

### 3.3 Status Endpoint (CRITICAL - Called on every page load/refresh)

**GET** `/api/v2/attendance/status/{employee_id}`

**Query Params:**
- `timezone` (optional): For display formatting

**Response (Active Session):**
```json
{
  "success": true,
  "server_now_utc": "2026-01-06T08:30:00.000Z",
  "attendance_date": "2026-01-06",
  "has_record": true,
  "is_active_session": true,
  "is_day_locked": false,
  
  "timing": {
    "checkin_utc": "2026-01-06T03:45:00.000Z",
    "checkout_utc": null,
    "last_session_start_utc": "2026-01-06T03:45:00.000Z",
    "elapsed_seconds": 17100,
    "total_seconds_today": 17100
  },
  
  "status": {
    "code": "HL",
    "label": "Half Day",
    "thresholds": {
      "half_day_seconds": 14400,
      "full_day_seconds": 32400
    }
  },
  
  "display": {
    "checkin_local": "09:15:00",
    "elapsed_text": "4 hours 45 minutes",
    "timezone": "Asia/Kolkata"
  },
  
  "session_count": 1
}
```

**Response (No Active Session - Already Checked Out):**
```json
{
  "success": true,
  "server_now_utc": "2026-01-06T14:00:00.000Z",
  "attendance_date": "2026-01-06",
  "has_record": true,
  "is_active_session": false,
  "is_day_locked": false,
  
  "timing": {
    "checkin_utc": "2026-01-06T03:45:00.000Z",
    "checkout_utc": "2026-01-06T12:45:00.000Z",
    "last_session_start_utc": null,
    "elapsed_seconds": 0,
    "total_seconds_today": 32400
  },
  
  "status": {
    "code": "P",
    "label": "Present"
  },
  
  "display": {
    "checkin_local": "09:15:00",
    "checkout_local": "18:15:00",
    "total_text": "9 hours 0 minutes"
  },
  
  "session_count": 1
}
```

**Response (No Record for Today):**
```json
{
  "success": true,
  "server_now_utc": "2026-01-06T04:00:00.000Z",
  "attendance_date": "2026-01-06",
  "has_record": false,
  "is_active_session": false,
  "is_day_locked": false,
  
  "timing": {
    "total_seconds_today": 0
  },
  
  "status": {
    "code": null,
    "label": "Not Checked In"
  }
}
```

---

### 3.4 Monthly Attendance Endpoint

**GET** `/api/v2/attendance/{employee_id}/{year}/{month}`

**Response:**
```json
{
  "success": true,
  "employee_id": "EMP001",
  "year": 2026,
  "month": 1,
  "server_now_utc": "2026-01-15T10:00:00.000Z",
  "records": [
    {
      "day": 6,
      "date": "2026-01-06",
      "status_code": "P",
      "status_label": "Present",
      "checkin_utc": "2026-01-06T03:45:00.000Z",
      "checkout_utc": "2026-01-06T12:45:00.000Z",
      "total_seconds": 32400,
      "total_text": "9h 0m",
      "session_count": 1,
      "is_day_locked": true,
      "is_auto_closed": false,
      "is_late": false,
      "is_manual_override": false
    }
  ],
  "summary": {
    "total_present": 10,
    "total_half_day": 2,
    "total_absent": 3,
    "total_holidays": 2,
    "total_leaves": 1,
    "total_hours_worked": 92.5
  }
}
```

---

## 🧠 4. BACKEND SESSION LOGIC (Flask)

See file: `backend/attendance_service_v2.py`

---

## 🖥️ 5. FRONTEND RENDERING LOGIC

See file: `features/attendanceRenderer.js`

---

## 🔄 6. SOCKET REFACTOR

See file: `socket-server/attendance_events.js`

---

## 🕛 7. MIDNIGHT JOB LOGIC

See file: `backend/attendance_scheduler.py`

---

## 🧪 8. FAILURE RECOVERY STRATEGY

### 8.1 Network Loss During Check-In

```
SCENARIO: User clicks Check-In, network fails before response

CURRENT (BROKEN):
- Frontend optimistically starts timer
- API fails, timer keeps running
- User thinks they're checked in
- Data inconsistent

NEW (FIXED):
- Frontend sends request, shows "Checking in..." spinner
- API fails → Frontend shows error: "Check-in failed. Please retry."
- No timer displayed until backend confirms
- User must retry when network returns
```

### 8.2 Network Loss During Check-Out

```
SCENARIO: User clicks Check-Out, network fails before response

RECOVERY:
- Frontend shows error: "Check-out failed. Please retry."
- Session remains active on backend
- Midnight job will auto-close if user forgets
- Next day: Previous day locked with auto-close flag
```

### 8.3 Browser Sleep / Tab Throttle

```
SCENARIO: Browser throttles JavaScript, timer drifts

CURRENT (BROKEN):
- setInterval slows down
- Timer shows wrong time
- Refresh shows different time

NEW (FIXED):
- No setInterval for business logic
- On visibility change → Call /api/v2/attendance/status
- Re-render from backend data
- Zero drift possible
```

### 8.4 Multiple Devices

```
SCENARIO: User checks in on Phone, opens Laptop

CURRENT (BROKEN):
- Laptop has no localStorage
- Timer shows 00:00:00
- Inconsistent state

NEW (FIXED):
- Laptop calls /api/v2/attendance/status
- Gets checkin_utc, server_now_utc
- Calculates: elapsed = server_now - checkin_utc
- Displays correct time immediately
- Socket broadcasts "attendance:changed" for real-time sync
```

### 8.5 Page Refresh

```
SCENARIO: User refreshes page mid-session

CURRENT (BROKEN):
- Reads localStorage
- May have stale/wrong data
- Timer resets or jumps

NEW (FIXED):
- Page load → /api/v2/attendance/status
- No localStorage involved
- Displays: server_now_utc - checkin_utc + total_seconds_today
- Identical time before and after refresh
```

### 8.6 Forgotten Check-Out

```
SCENARIO: User forgets to check out, goes home

RECOVERY:
- 23:59 UTC: auto_checkout_job runs
- Closes all active sessions
- session_end_utc = job_run_time
- is_auto_closed = true
- close_reason = "MIDNIGHT"
- Next morning: Day is locked, user sees "Auto-closed" badge
```

### 8.7 Cross-Day Session Prevention

```
SCENARIO: User checks in at 23:50, tries to stay checked in past midnight

BEHAVIOR:
- Check-in at 23:50 allowed
- 23:59: Midnight job closes session
- Duration: 9 minutes credited to that day
- 00:00: New day starts fresh
- User must check in again
```

---

## 🚀 9. MIGRATION STEPS FROM CURRENT SYSTEM

### Phase 1: Database Migration (Week 1)

```
1. Create new Dataverse table: crc6f_attendance_records_v2
2. Create new Dataverse table: crc6f_attendance_sessions
3. Write migration script to copy existing data:
   - Convert crc6f_checkin → crc6f_checkin_utc (localize then convert to UTC)
   - Calculate total_seconds_today from duration fields
   - Set is_active_session = false for all historical
   - Set is_day_locked = true for all dates before today
4. Validate data integrity
5. Keep old table read-only for rollback
```

### Phase 2: Backend Deployment (Week 2)

```
1. Deploy attendance_service_v2.py alongside existing
2. Mount new routes at /api/v2/attendance/*
3. Deploy attendance_scheduler.py with disabled jobs
4. Test all endpoints with Postman/automated tests
5. Enable scheduler jobs in staging
6. Verify midnight job execution
```

### Phase 3: Socket Server Update (Week 2)

```
1. Deploy attendance_events.js (stateless version)
2. Remove activeTimers memory object
3. Test event broadcasting
4. Verify all clients receive attendance:changed
```

### Phase 4: Frontend Migration (Week 3)

```
1. Deploy attendanceRenderer.js
2. Update attendanceApi.js to use /api/v2/*
3. Remove timer.js setInterval logic
4. Remove all localStorage timer code
5. Remove attendanceSocket.js timer sync logic
6. Test on multiple devices simultaneously
7. Test page refresh behavior
8. Test network disconnection scenarios
```

### Phase 5: Cutover (Week 4)

```
1. Enable feature flag for new system
2. Monitor error rates and user reports
3. Deprecate old /api/checkin, /api/checkout routes
4. Remove old timer.js completely
5. Archive old Dataverse table after 30 days
```

### Rollback Plan

```
IF critical issues discovered:
1. Disable feature flag (instant rollback to old frontend)
2. Re-enable old API routes
3. Point frontend to old APIs
4. Investigate and fix issues
5. Re-attempt migration
```

---

## ✅ SUCCESS CRITERIA CHECKLIST

| # | Criteria | Verification Method |
|---|----------|---------------------|
| 1 | Page refresh does NOT reset time | Refresh 10x, verify time matches |
| 2 | 3 devices show identical elapsed time | Open on phone, laptop, tablet simultaneously |
| 3 | System works without sockets | Disable socket, verify polling works |
| 4 | Timer works after 8+ hours idle | Leave browser open, check after 8h |
| 5 | Attendance data is audit-safe | Export records, verify UTC timestamps |
| 6 | No localStorage timer state | Check DevTools → Application → Local Storage |
| 7 | No setInterval controlling business logic | Code review timer.js replacement |
| 8 | Backend is single source of truth | Verify all displays derive from /status |
| 9 | Midnight auto-close works | Verify active sessions close at 23:59 |
| 10 | Day locking prevents edits | Try to check-in for locked day |

---

## 📋 FILES TO CREATE/MODIFY

| File | Action | Purpose |
|------|--------|---------|
| `backend/attendance_service_v2.py` | CREATE | New backend service |
| `backend/attendance_scheduler.py` | CREATE | Midnight jobs |
| `features/attendanceRenderer.js` | CREATE | Stateless frontend |
| `features/attendanceApiV2.js` | CREATE | New API layer |
| `socket-server/attendance_events.js` | CREATE | Stateless socket |
| `features/timer.js` | DELETE | Remove entirely |
| `features/attendanceSocket.js` | MODIFY | Remove timer logic |
| `state.js` | MODIFY | Remove timer state |

---

**END OF ARCHITECTURE DOCUMENT**
