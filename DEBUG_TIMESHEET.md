# Debug Timesheet Not Updating

## Issue
Timesheet is not showing new tasks after stopping the timer.

## Debug Steps

### 1. Restart Backend with Logging

```bash
cd "f:/Final file for my tasks and timesheet/Final-Vtab/backend"
python unified_server.py
```

**Watch for these logs:**
```
[TIME_TRACKER] POST /time-tracker/task-log - employee_id=..., task_id=..., seconds=..., work_date=...
[TIME_TRACKER] Saved to local storage. Total logs: X
[TIME_TRACKER] GET /time-tracker/logs - employee_id=..., start_date=..., end_date=...
[TIME_TRACKER] Read X logs from local storage
[TIME_TRACKER] Filtered to X logs for employee ...
```

### 2. Hard Refresh Frontend

```
Ctrl + F5
```

### 3. Open Browser Console

```
F12 → Console tab
```

### 4. Test Timer Flow

1. **Go to My Tasks**
2. **Start timer** on TASK003
3. **Wait 20 seconds**
4. **Click Stop**

**Check Backend Console:**
```
[TIME_TRACKER] POST /time-tracker/task-log - employee_id=Emp01, task_id=TASK003, seconds=20, work_date=2025-01-13
[TIME_TRACKER] Saved to local storage. Total logs: 1
```

**Check Browser Console:**
```
Posting timesheet log: {employee_id: "Emp01", task_id: "TASK003", seconds: 20, ...}
Response status: 201
Response data: {success: true, log: {...}, dataverse_saved: true}
```

5. **Should redirect to My Timesheet**

**Check Backend Console:**
```
[TIME_TRACKER] GET /time-tracker/logs - employee_id=Emp01, start_date=2025-01-13, end_date=2025-01-19
[TIME_TRACKER] Read 1 logs from local storage
[TIME_TRACKER] Filtered to 1 logs for employee Emp01
```

**Check Browser Console:**
```
My Timesheet - Employee ID: Emp01
Fetching logs from: http://localhost:5000/api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-13&end_date=2025-01-19
Fetch response status: 200
Fetch response data: {success: true, logs: [{...}], source: "local"}
My Timesheet - Week: 2025-01-13 to 2025-01-19
My Timesheet - Loaded logs: [{employee_id: "Emp01", task_id: "TASK003", seconds: 20, work_date: "2025-01-13"}]
My Timesheet - Grid rows: [{project_id: "...", task_id: "TASK003", hours: [20, 0, 0, 0, 0, 0, 0]}]
```

### 5. Verify Display

**Timesheet should show:**
- ✅ Project: (Project name)
- ✅ Task: TASK003
- ✅ Billing: Non-billable
- ✅ Monday: 00:00:20
- ✅ Total: 00:00:20
- ✅ Total logged: 00:00:20

## Common Issues

### Issue 1: Backend not receiving POST

**Symptoms:**
- No `[TIME_TRACKER] POST` log in backend
- Browser shows network error

**Check:**
1. Backend is running on port 5000
2. No firewall blocking
3. Browser console shows POST request

**Fix:**
```bash
# Restart backend
cd backend
python unified_server.py
```

### Issue 2: Empty employee_id

**Symptoms:**
- Backend log: `employee_id=, task_id=TASK003`
- Response: 400 Bad Request

**Check:**
```javascript
// Browser console
console.log(window.state.user);
// Should show: {id: "Emp01", name: "...", ...}
```

**Fix:**
- Ensure `window.state` is set in `index.js`
- Hard refresh (Ctrl+F5)

### Issue 3: Logs saved but not fetched

**Symptoms:**
- Backend POST log: `Saved to local storage. Total logs: 1`
- Backend GET log: `Filtered to 0 logs`

**Check:**
1. **Date mismatch:**
   ```
   Saved: work_date=2025-01-13
   Fetching: start_date=2025-01-06, end_date=2025-01-12
   ```
   → Log is outside the week range

2. **Employee ID mismatch:**
   ```
   Saved: employee_id=Emp01
   Fetching: employee_id=EMP001
   ```
   → Case sensitivity or different ID

**Fix:**
- Check `work_date` is today's date
- Check `employee_id` matches exactly

### Issue 4: Logs fetched but not displayed

**Symptoms:**
- Browser log: `Loaded logs: [{...}]`
- Browser log: `Grid rows: []`

**Check:**
1. **Grouping issue:**
   - Logs have `project_id` and `task_guid`?
   - Key format: `"VTAB004|abc-123-guid"`

2. **Date calculation:**
   ```javascript
   dayIdx = Math.floor((new Date("2025-01-13") - mondayDate) / 86400000)
   // Should be 0-6 for Mon-Sun
   ```

**Fix:**
- Check console logs for grouping
- Verify `work_date` is in correct format (YYYY-MM-DD)

### Issue 5: Grid rows but no display

**Symptoms:**
- Browser log: `Grid rows: [{hours: [20, 0, ...]}]`
- UI shows empty timesheet

**Check:**
1. **Rendering issue:**
   - Check for JavaScript errors in console
   - Check if `rowsHtml` is empty

2. **Format issue:**
   ```javascript
   formatTime(20) → "00:00:20"
   // Should not be empty or error
   ```

**Fix:**
- Check `formatTime` function works
- Check template literal syntax

## Manual Verification

### Check Local Storage File

```bash
cat "f:/Final file for my tasks and timesheet/Final-Vtab/backend/_data/timesheet_logs.json"
```

**Should contain:**
```json
[
  {
    "id": "LOG-1736755200000",
    "employee_id": "Emp01",
    "project_id": "VTAB004",
    "task_guid": "14341df0-0dbf-f011-bbd3-7c1e523baf62",
    "task_id": "TASK003",
    "task_name": "test",
    "seconds": 20,
    "work_date": "2025-01-13",
    "description": "",
    "created_at": "2025-01-13T12:00:00Z"
  }
]
```

### Test API Directly

**Browser Console:**
```javascript
// Test POST
fetch('http://localhost:5000/api/time-tracker/task-log', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    employee_id: 'Emp01',
    project_id: 'VTAB004',
    task_guid: 'test-guid',
    task_id: 'TASK003',
    task_name: 'test',
    seconds: 20,
    work_date: '2025-01-13',
    description: 'test'
  })
})
.then(r => r.json())
.then(d => console.log('POST result:', d));

// Test GET
fetch('http://localhost:5000/api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-13&end_date=2025-01-19')
.then(r => r.json())
.then(d => console.log('GET result:', d));
```

## Quick Fix Checklist

- [ ] Backend is running
- [ ] Backend shows POST log when timer stops
- [ ] Backend shows GET log when timesheet loads
- [ ] Browser console shows no errors
- [ ] `window.state.user.id` is not empty
- [ ] `work_date` is today's date
- [ ] Week range includes today
- [ ] Logs array is not empty
- [ ] Grid rows array is not empty
- [ ] UI renders without errors

## If Still Not Working

1. **Clear all data and start fresh:**
   ```bash
   # Delete local storage file
   rm "f:/Final file for my tasks and timesheet/Final-Vtab/backend/_data/timesheet_logs.json"
   
   # Restart backend
   python unified_server.py
   ```

2. **Clear browser cache:**
   ```
   Ctrl + Shift + Delete
   → Clear cached images and files
   → Clear cookies and site data
   ```

3. **Hard refresh:**
   ```
   Ctrl + F5
   ```

4. **Test again:**
   - Start timer
   - Stop after 20 seconds
   - Check all logs
   - Verify timesheet display

## Expected Full Flow

```
1. User clicks Start on TASK003
   → localStorage: tt_active_Emp01 = {task_guid: "...", started_at: 1736755200000}
   
2. Timer ticks every second
   → Display updates: 00:00:01, 00:00:02, ...
   
3. User clicks Stop after 20 seconds
   → Calculate: seconds = 20
   → POST http://localhost:5000/api/time-tracker/task-log
   → Backend: [TIME_TRACKER] POST ... seconds=20
   → Backend: [TIME_TRACKER] Saved to local storage. Total logs: 1
   → Response: {success: true, dataverse_saved: true}
   → Clear localStorage: tt_active_Emp01
   → Redirect: #/time-my-timesheet
   
4. Timesheet page loads
   → GET http://localhost:5000/api/time-tracker/logs?employee_id=Emp01&start_date=...&end_date=...
   → Backend: [TIME_TRACKER] GET ... employee_id=Emp01
   → Backend: [TIME_TRACKER] Read 1 logs from local storage
   → Backend: [TIME_TRACKER] Filtered to 1 logs
   → Response: {success: true, logs: [{seconds: 20, work_date: "2025-01-13"}], source: "local"}
   → Frontend: Group by project/task
   → Frontend: Map to day column (Monday = 0)
   → Frontend: Format time: formatTime(20) = "00:00:20"
   → Frontend: Display in grid
   
5. User sees timesheet
   → Project: VTAB HR Tool
   → Task: TASK003
   → Monday: 00:00:20
   → Total: 00:00:20
```
