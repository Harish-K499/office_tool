# Team Timesheet Debug Guide

## Issue
Team timesheet not displaying logged hours for employees correctly.

## Root Causes

### 1. Employee ID Case Sensitivity
**Problem:** Employee IDs might be stored in different cases
- Logs saved with: `Emp01` or `emp01`
- Employee list has: `EMP01`
- Comparison fails due to case mismatch

**Solution:** Case-insensitive comparison
```javascript
const logEmpId = (l.employee_id || '').toUpperCase();
const empId = (emp.id || '').toUpperCase();
return logEmpId === empId && l.work_date === dateStr;
```

### 2. Employee ID Format Inconsistency
**Problem:** Different parts of the system use different formats
- `state.user.id` might be: "Emp01"
- Dataverse employee_id might be: "EMP001"
- Logs might have either format

**Solution:** Normalize to uppercase everywhere

## Debug Steps

### Step 1: Check Browser Console

**Hard refresh** (Ctrl+F5) and go to Team Timesheet.

**Look for these logs:**
```
Team Timesheet - Fetching logs for month: 2025-01-01 to 2025-01-31
Team Timesheet - Employees: ["Bala (EMP002)", "Vignesh (EMP001)", ...]
Team Timesheet - Fetch response status: 200
Team Timesheet - Fetched X logs
Team Timesheet - Employee IDs in logs: ["EMP001", "EMP002", ...]
Team Timesheet - Bala (EMP002): 00:00:20 total
```

### Step 2: Check Backend Console

**Look for:**
```
[TIME_TRACKER] GET /time-tracker/logs - employee_id=ALL, start_date=2025-01-01, end_date=2025-01-31
[TIME_TRACKER] Read X logs from local storage
[TIME_TRACKER] Filtered to X logs for ALL employees
```

### Step 3: Verify Employee ID Matching

**Browser Console:**
```javascript
// Check what employee IDs are in the system
fetch('http://localhost:5000/api/employees?page=1&pageSize=100')
  .then(r => r.json())
  .then(d => {
    console.log('Employees:', d.items.map(e => ({
      id: e.employee_id,
      name: `${e.first_name} ${e.last_name}`
    })));
  });

// Check what employee IDs are in logs
fetch('http://localhost:5000/api/time-tracker/logs?employee_id=ALL&start_date=2025-01-01&end_date=2025-01-31')
  .then(r => r.json())
  .then(d => {
    const uniqueIds = [...new Set(d.logs.map(l => l.employee_id))];
    console.log('Employee IDs in logs:', uniqueIds);
  });
```

### Step 4: Check Local Storage File

**Backend console:**
```bash
cd backend
cat _data/timesheet_logs.json
```

**Look for:**
```json
[
  {
    "employee_id": "EMP002",  // ← Check this matches employee list
    "task_id": "TASK003",
    "seconds": 20,
    "work_date": "2025-01-13"
  }
]
```

## Common Issues

### Issue 1: Employee ID Mismatch

**Symptoms:**
- Logs are fetched (console shows X logs)
- But no hours displayed in grid
- Console shows different employee IDs

**Example:**
```
Team Timesheet - Employees: ["Bala (EMP002)", ...]
Team Timesheet - Employee IDs in logs: ["Emp02", ...]
```

**Fix:**
Employee list has `EMP002` but logs have `Emp02` (different format).

**Solution:**
1. Check `state.user.id` when logging time
2. Ensure it matches employee list format
3. Use case-insensitive comparison (already implemented)

### Issue 2: Wrong Employee ID Saved

**Symptoms:**
- Timer works in My Tasks
- My Timesheet shows data correctly
- Team Timesheet doesn't show data

**Check:**
```javascript
// In My Tasks, check what employee ID is being used
console.log('My Tasks - Employee ID:', empId);

// When stopping timer, check what's being sent
console.log('Posting timesheet log:', body);
// Should show: employee_id: "EMP002"
```

**Fix:**
If employee_id is wrong (e.g., "Emp01" instead of "EMP001"), update the user state:
```javascript
// In index.js or state.js
state.user.id = "EMP002"; // Correct format
```

### Issue 3: Date Range Mismatch

**Symptoms:**
- Logs exist in file
- But not fetched for current month

**Check:**
```
Team Timesheet - Fetching logs for month: 2025-01-01 to 2025-01-31
```

**Verify:**
- Today's date is within this range
- Logs have work_date within this range

**Example Problem:**
```json
{
  "work_date": "2024-12-13"  // ← December, not January
}
```

### Issue 4: Empty Logs Array

**Symptoms:**
```
Team Timesheet - Fetched 0 logs
```

**Possible Causes:**
1. No data in `_data/timesheet_logs.json`
2. Backend not running
3. API endpoint returning error

**Fix:**
1. Check backend is running on port 5000
2. Check file exists and has data
3. Check backend console for errors

## Testing Procedure

### Test 1: Log Time as Bala

1. **Login as Bala** (or set state.user.id = "EMP002")
2. **Check console:**
   ```
   My Tasks - Employee ID: EMP002
   ```
3. **Start timer** on TASK003
4. **Stop after 20 seconds**
5. **Check backend console:**
   ```
   [TIME_TRACKER] POST /time-tracker/task-log - employee_id=EMP002, task_id=TASK003, seconds=20
   ```
6. **Go to My Timesheet**
   - Should show 00:00:20 in today's column
7. **Go to Team Timesheet**
   - Find Bala's row
   - Should show 00:00:20 in today's column
   - Console should show:
     ```
     Team Timesheet - Bala (EMP002): 00:00:20 total
     ```

### Test 2: Verify All Employees

For each employee in the team:

1. **Check employee list:**
   ```javascript
   // Browser console
   fetch('http://localhost:5000/api/employees?page=1&pageSize=100')
     .then(r => r.json())
     .then(d => console.table(d.items.map(e => ({
       ID: e.employee_id,
       Name: `${e.first_name} ${e.last_name}`
     }))));
   ```

2. **Log time as that employee**
3. **Verify in Team Timesheet**

### Test 3: Multiple Employees Same Day

1. **Log time as Employee 1** (20 seconds)
2. **Log time as Employee 2** (40 seconds)
3. **Go to Team Timesheet**
4. **Verify:**
   - Employee 1 row shows 00:00:20
   - Employee 2 row shows 00:00:40
   - Other employees show 00:00:00

## Expected Console Output

### Successful Flow:

```
=== My Tasks ===
My Tasks - User: {id: "EMP002", name: "Bala", ...}
My Tasks - Employee ID: EMP002

[Timer stopped]
Posting timesheet log: {
  employee_id: "EMP002",
  task_id: "TASK003",
  seconds: 20,
  work_date: "2025-01-13"
}
Response status: 201

=== Team Timesheet ===
Team Timesheet - Fetching logs for month: 2025-01-01 to 2025-01-31
Team Timesheet - Employees: [
  "Vignesh (EMP001)",
  "Bala (EMP002)",
  "John Doe (EMP003)"
]
Team Timesheet - Fetch response status: 200
Team Timesheet - Fetched 1 logs
Team Timesheet - Employee IDs in logs: ["EMP002"]
Team Timesheet - Bala (EMP002): 00:00:20 total
```

## Quick Fixes

### Fix 1: Normalize Employee IDs

**In `renderMyTasksPage`:**
```javascript
const empId = String((user.id || user.employee_id || user.employeeId || '')).trim().toUpperCase();
```

**In `stopLocalTimer`:**
```javascript
const empId = (user.id || user.employee_id || user.employeeId || '').trim().toUpperCase();
```

### Fix 2: Check State User ID

**Browser Console:**
```javascript
console.log('Current user:', window.state.user);
// Should show: {id: "EMP002", name: "Bala", ...}

// If wrong, update it:
window.state.user.id = "EMP002"; // Correct ID
```

### Fix 3: Verify Backend Data

**Check saved logs:**
```bash
cd backend
cat _data/timesheet_logs.json | grep employee_id
```

**Should show:**
```
"employee_id": "EMP002",
"employee_id": "EMP001",
```

**NOT:**
```
"employee_id": "Emp02",  // ← Wrong format
"employee_id": "emp001", // ← Wrong case
```

## Files to Check

1. **`pages/shared.js`**
   - Line ~214: `renderMyTasksPage` - Employee ID extraction
   - Line ~118: `teamRow` - Employee ID matching
   - Line ~767: `renderTeamTimesheetPage` - Employee list and log fetching

2. **`backend/time_tracking.py`**
   - Line ~299: POST endpoint - Employee ID saving
   - Line ~407: GET endpoint - Employee ID filtering

3. **`backend/_data/timesheet_logs.json`**
   - Check employee_id values match employee list

4. **`state.js` or `index.js`**
   - Check `state.user.id` is set correctly

## Verification Checklist

- [ ] Backend is running on port 5000
- [ ] Hard refresh frontend (Ctrl+F5)
- [ ] Console shows no errors
- [ ] Employee list loads correctly
- [ ] Logs are fetched (console shows count)
- [ ] Employee IDs in logs match employee list
- [ ] Case-insensitive comparison is working
- [ ] Dates are in correct format (YYYY-MM-DD)
- [ ] Today's date is within month range
- [ ] Grid displays HH:MM:SS format
- [ ] Totals are calculated correctly

## If Still Not Working

1. **Clear all data:**
   ```bash
   rm backend/_data/timesheet_logs.json
   ```

2. **Restart backend:**
   ```bash
   cd backend
   python unified_server.py
   ```

3. **Hard refresh frontend:**
   ```
   Ctrl + F5
   ```

4. **Log fresh data:**
   - Go to My Tasks
   - Start and stop timer
   - Check console logs at each step
   - Verify data in Team Timesheet

5. **Share console output:**
   - Copy all console logs
   - Check for errors or mismatches
   - Compare employee IDs in logs vs employee list
