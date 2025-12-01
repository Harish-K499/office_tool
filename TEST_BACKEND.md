# Backend Testing Guide

## Issue: "Failed to save timesheet log"

This error occurs when the frontend cannot successfully POST to `/api/time-tracker/task-log`.

## Troubleshooting Steps

### 1. Check if Backend is Running

Open a browser and navigate to:
```
http://localhost:5000/api/tasks
```

**Expected:** Should return JSON with tasks or an error message
**If fails:** Backend server is not running

### 2. Start/Restart Backend Server

```bash
cd "f:/Final file for my tasks and timesheet/Final-Vtab/backend"
python unified_server.py
```

**Look for:**
- Server starting on port 5000
- No import errors
- Blueprint registration messages

### 3. Test the Endpoint Directly

#### Using Browser Console:
```javascript
fetch('http://localhost:5000/api/time-tracker/task-log', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    employee_id: 'EMP001',
    project_id: 'PROJ-001',
    task_guid: 'test-guid',
    task_id: 'TASK-001',
    task_name: 'Test Task',
    seconds: 3600,
    work_date: '2025-01-13',
    description: 'test'
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

**Expected Response:**
```json
{
  "success": true,
  "log": {
    "id": "LOG-1736755200000",
    "employee_id": "EMP001",
    "project_id": "PROJ-001",
    "task_guid": "test-guid",
    "task_id": "TASK-001",
    "task_name": "Test Task",
    "seconds": 3600,
    "work_date": "2025-01-13",
    "description": "test",
    "created_at": "2025-01-13T12:00:00Z"
  }
}
```

### 4. Check Backend Logs

When you stop a timer, check the backend console for:
- Incoming POST request to `/api/time-tracker/task-log`
- Request body data
- Any error messages

### 5. Check Browser Console

After clicking Stop button:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - "Posting timesheet log:" - Shows the data being sent
   - "Response status:" - Shows HTTP status code
   - "Response data:" - Shows backend response
   - Any error messages

### 6. Common Issues

#### Issue: CORS Error
**Symptom:** Console shows "CORS policy" error
**Fix:** Ensure `CORS(app)` is enabled in `unified_server.py`

#### Issue: 400 Bad Request
**Symptom:** Response status 400
**Cause:** Missing required fields (employee_id, seconds, work_date)
**Fix:** Check that all fields are being sent correctly

#### Issue: 500 Internal Server Error
**Symptom:** Response status 500
**Cause:** Backend exception (file permissions, JSON parsing, etc.)
**Fix:** Check backend console for Python traceback

#### Issue: Network Error / Connection Refused
**Symptom:** "Failed to fetch" or "Connection refused"
**Cause:** Backend server not running
**Fix:** Start the backend server

#### Issue: Empty employee_id
**Symptom:** 400 error with "employee_id required"
**Cause:** User not logged in or state not set
**Fix:** Check `window.state.user` has id/employee_id

### 7. Verify Data Files

Check if data directory exists:
```
f:/Final file for my tasks and timesheet/Final-Vtab/backend/_data/
```

Should contain:
- `timesheet_logs.json` - Created automatically on first POST
- `time_entries.json` - For timer entries

**Permissions:** Ensure Python has write access to this directory

### 8. Manual Backend Test

Create a test script `test_endpoint.py`:

```python
import requests
import json

url = 'http://localhost:5000/api/time-tracker/task-log'
data = {
    'employee_id': 'EMP001',
    'project_id': 'PROJ-001',
    'task_guid': 'test-guid',
    'task_id': 'TASK-001',
    'task_name': 'Test Task',
    'seconds': 3600,
    'work_date': '2025-01-13',
    'description': 'test'
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
```

Run:
```bash
python test_endpoint.py
```

### 9. Check Blueprint Registration

Verify in `unified_server.py`:

```python
from time_tracking import bp_time as time_bp
# ...
app.register_blueprint(time_bp)
```

### 10. Restart Everything

If all else fails:
1. Stop the backend server (Ctrl+C)
2. Close all browser tabs
3. Restart backend: `python unified_server.py`
4. Open fresh browser tab
5. Navigate to app
6. Try timer again

## Expected Flow

### When Timer Stops:

1. **Frontend calculates total seconds**
   ```javascript
   totalSeconds = accumulated + current_session
   ```

2. **Frontend POSTs to backend**
   ```
   POST http://localhost:5000/api/time-tracker/task-log
   ```

3. **Backend validates data**
   - employee_id exists and not empty
   - seconds > 0
   - work_date in YYYY-MM-DD format

4. **Backend saves to JSON file**
   - Appends to `_data/timesheet_logs.json`
   - Returns success response

5. **Frontend redirects**
   - Clears localStorage timer
   - Saves context to sessionStorage
   - Redirects to `#/time-my-timesheet`

6. **Timesheet loads**
   - GETs logs from backend
   - Displays hours in grid

## Debug Checklist

- [ ] Backend server is running on port 5000
- [ ] No errors in backend console
- [ ] Blueprint registered correctly
- [ ] CORS is enabled
- [ ] `_data` directory exists with write permissions
- [ ] User is logged in (window.state.user exists)
- [ ] employee_id is not empty
- [ ] Browser console shows detailed logs
- [ ] Network tab shows POST request
- [ ] POST request has correct Content-Type header
- [ ] Request body has all required fields

## Quick Fix

If you see the error, try this immediately:

1. **Open browser console** (F12)
2. **Check the logs** - Look for "Posting timesheet log:" message
3. **Copy the error details** from console
4. **Check backend console** for any Python errors
5. **Restart backend** if needed
6. **Try again**

The new error messages will tell you exactly what's wrong!
