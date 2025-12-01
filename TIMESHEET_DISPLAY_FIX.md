# Timesheet Display Fix

## Problem
After stopping a timer, the My Timesheet page was not showing:
- Project name
- Task name
- Billing type
- Logged hours in the correct date column

## Root Causes

### 1. Project/Task Dropdowns Instead of Display
The timesheet was showing **dropdowns** with placeholder text instead of displaying the actual project and task names from the logged data.

**Before:**
```html
<select>
  <option value="">Project: Python Development</option>
  <!-- All projects listed -->
</select>
```

**After:**
```html
<div style="padding: 8px; font-weight: 500;">VTAB HR Tool</div>
```

### 2. No Debug Logging
There was no way to see if:
- Logs were being fetched from backend
- Data was being grouped correctly
- Hours were being calculated properly

## Solution

### 1. Display Actual Values (Not Dropdowns)

Changed project and task columns to display the actual logged data:

```javascript
// Find project name from projects list
const project = projects.find(p => (p.crc6f_projectid||p.id) === row.project_id);
const projectName = project ? (project.crc6f_projectname||project.name||row.project_id) : row.project_id || 'Unknown Project';

// Task name from row data
const taskName = row.task_name || row.task_id || 'Unknown Task';

// Display as text, not dropdown
<td>
  <div style="padding: 8px; font-weight: 500;">${projectName}</div>
</td>
<td>
  <div style="padding: 8px;">${taskName}</div>
</td>
```

### 2. Added Debug Logging

```javascript
console.log('My Timesheet - Week:', fmt(s), 'to', fmt(e));
console.log('My Timesheet - Loaded logs:', logs);
console.log('My Timesheet - Grid rows:', gridRows);
```

This helps verify:
- ✅ Week range is correct
- ✅ Logs are fetched from backend
- ✅ Data is grouped by project/task
- ✅ Hours are calculated correctly

### 3. Fixed Empty Row Structure

When no logs exist, create proper empty row:

```javascript
if (gridRows.length === 0) {
    gridRows = [{ 
        id: Date.now(), 
        project_id: '', 
        task_guid: '', 
        task_id: '', 
        task_name: '', 
        billing: 'Non-billable', 
        hours: Array(7).fill('') 
    }];
}
```

## How It Works Now

### When Timer Stops:

1. **POST to backend** with exact data:
   ```javascript
   {
     employee_id: "Emp01",
     project_id: "VTAB004",
     task_guid: "14341df0-0dbf-f011-bbd3-7c1e523baf62",
     task_id: "TASK003",
     task_name: "test",
     seconds: 20,
     work_date: "2025-01-13"
   }
   ```

2. **Backend saves** to `_data/timesheet_logs.json`

3. **Redirect** to `#/time-my-timesheet`

### When Timesheet Loads:

1. **Calculate week range** (Monday to Sunday)
   ```javascript
   startOfWeek: 2025-01-13 (Mon)
   endOfWeek: 2025-01-19 (Sun)
   ```

2. **Fetch logs** from backend:
   ```javascript
   GET /api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-13&end_date=2025-01-19
   ```

3. **Group by project + task**:
   ```javascript
   Key: "VTAB004|14341df0-0dbf-f011-bbd3-7c1e523baf62"
   Value: {
     project_id: "VTAB004",
     task_guid: "14341df0-0dbf-f011-bbd3-7c1e523baf62",
     task_id: "TASK003",
     task_name: "test",
     billing: "Non-billable",
     hours: ["0.01", "", "", "", "", "", ""] // 20 seconds = 0.01 hours in Monday
   }
   ```

4. **Map to day column**:
   ```javascript
   dayIdx = Math.floor((new Date("2025-01-13") - mondayDate) / 86400000)
   // If today is Monday, dayIdx = 0
   ```

5. **Convert seconds to hours**:
   ```javascript
   hours = (20 / 3600).toFixed(2) = "0.01"
   ```

6. **Display in grid**:
   ```
   Project    | Task   | Billing       | Mon  | Tue | Wed | ... | Total
   VTAB HR    | test   | Non-billable  | 0.01 |     |     | ... | 0.01
   ```

## Testing Steps

### 1. Hard Refresh
```
Ctrl + F5
```

### 2. Open Console
```
F12 → Console tab
```

### 3. Start Timer
- Go to My Tasks
- Click Start on "test" task (TASK003)
- Wait 20 seconds
- Timer should show: 00:00:20

### 4. Stop Timer
- Click Stop button
- Check console logs:
  ```
  Posting timesheet log: {employee_id: "Emp01", project_id: "VTAB004", ...}
  Response status: 201
  Response data: {success: true, log: {...}}
  ```
- Should redirect to My Timesheet

### 5. Verify Timesheet Display
Check console logs:
```
My Timesheet - Week: 2025-01-13 to 2025-01-19
My Timesheet - Loaded logs: [{employee_id: "Emp01", project_id: "VTAB004", ...}]
My Timesheet - Grid rows: [{project_id: "VTAB004", task_name: "test", hours: ["0.01", ...]}]
```

Check UI:
- ✅ Project column shows: "VTAB HR Tool" (or project name)
- ✅ Task column shows: "test"
- ✅ Billing shows: "Non-billable" (dropdown)
- ✅ Monday column shows: "0.01"
- ✅ Total column shows: "0.01"
- ✅ Total logged shows: "0.01h"

## Example Console Output

### Successful Flow:
```
My Tasks - User: {name: "Admin User", id: "Emp01", ...}
My Tasks - Employee ID: Emp01

[After stopping timer]
Posting timesheet log: {
  employee_id: "Emp01",
  project_id: "VTAB004",
  task_guid: "14341df0-0dbf-f011-bbd3-7c1e523baf62",
  task_id: "TASK003",
  task_name: "test",
  seconds: 20,
  work_date: "2025-01-13"
}
Response status: 201
Response data: {success: true, log: {...}}

[After redirect]
My Timesheet - User: {name: "Admin User", id: "Emp01", ...}
My Timesheet - Employee ID: Emp01
My Timesheet - Week: 2025-01-13 to 2025-01-19
My Timesheet - Loaded logs: [
  {
    employee_id: "Emp01",
    project_id: "VTAB004",
    task_guid: "14341df0-0dbf-f011-bbd3-7c1e523baf62",
    task_id: "TASK003",
    task_name: "test",
    seconds: 20,
    work_date: "2025-01-13"
  }
]
My Timesheet - Grid rows: [
  {
    project_id: "VTAB004",
    task_guid: "14341df0-0dbf-f011-bbd3-7c1e523baf62",
    task_id: "TASK003",
    task_name: "test",
    billing: "Non-billable",
    hours: ["0.01", "", "", "", "", "", ""]
  }
]
```

## Troubleshooting

### If timesheet is empty:

1. **Check console logs** - Are logs being fetched?
   ```javascript
   My Timesheet - Loaded logs: []  // ❌ Empty
   ```

2. **Check backend** - Is data saved?
   ```bash
   cat "f:/Final file for my tasks and timesheet/Final-Vtab/backend/_data/timesheet_logs.json"
   ```

3. **Check date range** - Is today within the week?
   ```javascript
   My Timesheet - Week: 2025-01-13 to 2025-01-19
   // Today should be between these dates
   ```

4. **Check employee_id** - Does it match?
   ```javascript
   My Timesheet - Employee ID: Emp01
   // Should match the ID used when stopping timer
   ```

### If project/task shows "Unknown":

1. **Check projects loaded**:
   ```javascript
   console.log(projects);  // Should have list of projects
   ```

2. **Check project_id match**:
   ```javascript
   // Row has: project_id: "VTAB004"
   // Projects list should have: {crc6f_projectid: "VTAB004", crc6f_projectname: "VTAB HR Tool"}
   ```

### If hours are wrong:

1. **Check seconds in log**:
   ```javascript
   seconds: 20  // Should be the actual elapsed seconds
   ```

2. **Check conversion**:
   ```javascript
   hours = 20 / 3600 = 0.0055... → "0.01" (rounded to 2 decimals)
   ```

3. **Check day index**:
   ```javascript
   dayIdx = 0  // Monday
   dayIdx = 1  // Tuesday
   // etc.
   ```

## Files Changed

1. **`pages/shared.js`**
   - Changed project/task columns from dropdowns to text display
   - Added debug logging for week range, loaded logs, and grid rows
   - Fixed empty row structure to include all required fields
   - Project name lookup from projects list
   - Task name display from row data

## Benefits

1. **Clearer Display** - Shows actual logged data, not editable dropdowns
2. **Better Debugging** - Console logs show exactly what's happening
3. **Accurate Data** - Project and task names match what was logged
4. **Proper Formatting** - Hours displayed as decimal (0.01 for 20 seconds)
5. **Dynamic Updates** - Automatically shows new entries after stopping timer
