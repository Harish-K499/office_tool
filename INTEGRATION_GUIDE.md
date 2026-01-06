# Integration Guide - Backend-Authoritative Attendance System

## ✅ IMPLEMENTATION STATUS: COMPLETE

All changes have been implemented and are ready for deployment.

## Quick Start

This guide shows how to integrate the new backend-authoritative attendance system.

## ⚠️ IMPORTANT: Uses EXISTING Dataverse Tables

No new tables needed! The V2 service uses:
- `crc6f_table13s` - Existing attendance table
- `crc6f_hr_loginactivitytbs` - Existing login activity table (for session tracking)

---

## 1. Backend Integration

### Register the Blueprint in unified_server.py

```python
# Add to imports at top of unified_server.py
from attendance_service_v2 import attendance_v2_bp
from attendance_scheduler import setup_scheduler, shutdown_scheduler

# Register blueprint (add after other blueprint registrations)
app.register_blueprint(attendance_v2_bp)

# Initialize scheduler (add after app creation)
if os.getenv("ENABLE_ATTENDANCE_SCHEDULER", "true").lower() == "true":
    setup_scheduler(app)

# Add shutdown hook (add to your shutdown logic)
@atexit.register
def cleanup():
    shutdown_scheduler(app)
```

### Install Required Dependencies

```bash
pip install apscheduler
```

---

## 2. Frontend Integration

### Replace timer.js imports in layout.js

```javascript
// OLD (remove these)
// import { handleTimerClick, loadTimerState, updateTimerButton } from '../features/timer.js';

// NEW (add these)
import { 
    handleTimerClick, 
    initializeAttendance, 
    updateTimerDisplay 
} from '../features/attendanceRenderer.js';
```

### Update initialization in layout.js

```javascript
// OLD (remove)
// loadTimerState();

// NEW (add)
if (state.user?.id) {
    initializeAttendance(state.user.id);
}
```

### Update socket initialization

```javascript
// OLD (remove)
// import { initAttendanceSocket } from '../features/attendanceSocket.js';

// NEW (add)
import { 
    initializeAttendanceSocket, 
    registerForAttendanceEvents 
} from '../features/attendanceSocketV2.js';

// In your socket setup:
initializeAttendanceSocket(socket);
registerForAttendanceEvents();
```

---

## 3. Socket Server Integration

### Update single_server.js

```javascript
// OLD (remove)
// const attendanceModule = require('./attendance_module.js');
// attendanceModule(io);

// NEW (add)
const attendanceEvents = require('./attendance_events.js');
const attendanceRouter = attendanceEvents(io);
app.use(attendanceRouter);  // Mount HTTP endpoint for Flask to trigger events
```

---

## 4. State Cleanup

### Remove timer state from state.js

```javascript
// OLD - Remove or simplify timer state
timer: {
    isRunning: false,
    startTime: null,
    lastDuration: 0,
    intervalId: null,
    // ... other properties
}

// NEW - Minimal display state only
timer: {
    displaySeconds: 0,
    isActive: false
}
```

---

## 5. Files to Remove/Deprecate

After migration is complete and tested:

```
DELETE: features/timer.js
DELETE: features/attendanceSocket.js (old version)
DELETE: socket-server/attendance_module.js (old version)
MODIFY: state.js (remove timer localStorage logic)
```

---

## 6. Environment Variables

Add these to your environment:

```env
# Socket server URL for backend to emit events
SOCKET_SERVER_URL=http://localhost:3001

# Enable/disable attendance scheduler
ENABLE_ATTENDANCE_SCHEDULER=true
```

---

## 7. Dataverse Table Creation

Create the new tables in Dataverse:

### crc6f_attendance_records_v2

| Column | Type | Notes |
|--------|------|-------|
| crc6f_attendance_id | String(20) | Business key, unique |
| crc6f_employee_id | String(20) | FK to employees |
| crc6f_attendance_date | Date | YYYY-MM-DD |
| crc6f_checkin_utc | DateTime | UTC timestamp |
| crc6f_checkout_utc | DateTime | UTC timestamp, nullable |
| crc6f_last_session_start_utc | DateTime | Current session start |
| crc6f_total_seconds_today | Integer | Accumulated seconds |
| crc6f_is_active_session | Boolean | Session running? |
| crc6f_status_code | OptionSet | A=0, HL=1, P=2, LOCKED=3 |
| crc6f_is_day_locked | Boolean | Day finalized? |
| crc6f_checkin_location | String(500) | JSON |
| crc6f_checkout_location | String(500) | JSON |
| crc6f_session_count | Integer | Number of sessions |
| crc6f_auto_closed | Boolean | System closed? |
| crc6f_close_reason | OptionSet | USER=0, MIDNIGHT=1, ADMIN=2 |
| crc6f_created_at_utc | DateTime | Auto |
| crc6f_updated_at_utc | DateTime | Auto-updated |

### crc6f_attendance_sessions (Audit Trail)

| Column | Type | Notes |
|--------|------|-------|
| crc6f_session_id | String(20) | Business key |
| crc6f_attendance_id | String(20) | FK to records |
| crc6f_session_start_utc | DateTime | Session start |
| crc6f_session_end_utc | DateTime | Session end, nullable |
| crc6f_session_seconds | Integer | Duration |
| crc6f_checkin_location | String(500) | JSON |
| crc6f_checkout_location | String(500) | JSON |
| crc6f_is_active | Boolean | Session running? |
| crc6f_close_reason | OptionSet | Close reason |

---

## 8. Testing Checklist

Before going live, verify:

- [ ] Page refresh shows same time as before refresh
- [ ] Opening 3 browsers shows identical elapsed time
- [ ] Check-in works and timer starts
- [ ] Check-out works and timer stops
- [ ] Midnight job closes active sessions
- [ ] Day locking prevents further edits
- [ ] Network disconnect doesn't break display
- [ ] Tab sleep doesn't cause drift
- [ ] Admin can manually override status

---

## 9. Rollback Plan

If issues occur:

1. Set feature flag to use old endpoints
2. Re-enable old timer.js imports
3. Point socket to old attendance_module.js
4. Old localStorage state will resume working

```javascript
// Feature flag in config.js
export const USE_V2_ATTENDANCE = false;  // Set to false to rollback
```

---

## 10. API Endpoint Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v2/attendance/checkin` | POST | Start/resume session |
| `/api/v2/attendance/checkout` | POST | End session |
| `/api/v2/attendance/status/{id}` | GET | Get current state |
| `/api/v2/attendance/{id}/{year}/{month}` | GET | Monthly records |
| `/api/v2/attendance/admin/lock-day` | POST | Lock a day |
| `/api/v2/attendance/admin/manual-override` | POST | Override status |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Stateless)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ attendanceRenderer.js                               │    │
│  │ - Fetches /status on load                           │    │
│  │ - Displays: server_now - checkin_utc + total_seconds│    │
│  │ - NO localStorage, NO setInterval for business logic│    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Authority)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ attendance_service_v2.py                            │    │
│  │ - All timestamps in UTC                             │    │
│  │ - All duration calculations done here               │    │
│  │ - Status derived from total_seconds                 │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ attendance_scheduler.py                             │    │
│  │ - 23:59 UTC: Auto-close active sessions             │    │
│  │ - 00:05 UTC: Lock previous day                      │    │
│  │ - 00:10 UTC: Mark absent employees                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SOCKET (Events Only)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ attendance_events.js                                │    │
│  │ - Broadcasts attendance:changed events              │    │
│  │ - NO state storage, NO calculations                 │    │
│  │ - Clients fetch fresh data from /status on event    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

**END OF INTEGRATION GUIDE**
