# Team Timesheet Update - HH:MM:SS Format

## Changes Made

### 1. Updated `teamRow` Function

**Before:**
- Displayed hardcoded `00:00` for all cells
- No actual data from backend
- No totals calculated

**After:**
- Fetches actual timesheet logs from backend
- Calculates hours per day for each employee
- Displays in HH:MM:SS format
- Calculates monthly total per employee

**Code:**
```javascript
const teamRow = (emp, days, logs) => {
    // Helper to format seconds as HH:MM:SS
    const formatTime = (secs) => {
        if (!secs) return '00:00:00';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    
    // Calculate hours for each day
    const dayHours = days.map(d => {
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayLogs = logs.filter(l => l.employee_id === emp.id && l.work_date === dateStr);
        const totalSecs = dayLogs.reduce((sum, l) => sum + Number(l.seconds || 0), 0);
        return totalSecs;
    });
    
    // Calculate total for the month
    const totalSecs = dayHours.reduce((sum, h) => sum + h, 0);
    
    // Display cells with formatted time
    const cells = dayHours.map(h => `<div class="tt-cell">${formatTime(h)}</div>`).join('');
    const total = `<div class="tt-cell">${formatTime(totalSecs)}</div>`;
    
    return `<div class="tt-row">${left}${total}${cells}</div>`;
};
```

### 2. Updated `renderTeamTimesheetPage` Function

**Before:**
- No data fetching from backend
- Passed only `emp` and `days` to `teamRow`

**After:**
- Fetches timesheet logs for all employees in the month
- Passes `logs` array to `teamRow` for calculations
- Supports fallback if bulk fetch fails

**Code:**
```javascript
export const renderTeamTimesheetPage = async () => {
    // ... existing code ...
    
    // Fetch timesheet logs for the month
    const startDate = days[0].toISOString().split('T')[0];
    const endDate = days[days.length - 1].toISOString().split('T')[0];
    
    let allLogs = [];
    try {
        // Try to fetch all employees' logs at once
        const response = await fetch(`${API}/time-tracker/logs?employee_id=ALL&start_date=${startDate}&end_date=${endDate}`);
        if (response.ok) {
            const data = await response.json();
            allLogs = data.logs || [];
        } else {
            // Fallback: fetch logs for each employee individually
            for (const emp of items) {
                const res = await fetch(`${API}/time-tracker/logs?employee_id=${emp.id}&start_date=${startDate}&end_date=${endDate}`);
                if (res.ok) {
                    const data = await res.json();
                    allLogs = allLogs.concat(data.logs || []);
                }
            }
        }
    } catch (e) {
        console.error('Failed to fetch team logs:', e);
    }
    
    // Pass logs to teamRow
    const rows = items.map(emp => teamRow(emp, days, allLogs)).join('');
};
```

### 3. Backend Support for "ALL" Employees

**Added to `time_tracking.py`:**
```python
# Support "ALL" to fetch all employees' logs (for team timesheet)
if employee_id != "ALL" and r.get("employee_id") != employee_id:
    continue

if employee_id == "ALL":
    print(f"[TIME_TRACKER] Filtered to {len(out)} logs for ALL employees")
else:
    print(f"[TIME_TRACKER] Filtered to {len(out)} logs for employee {employee_id}")
```

## How It Works

### Data Flow:

```
1. Team Timesheet Page Loads
   ↓
2. Fetch all employees from Dataverse
   GET /api/employees
   → [{employee_id: "EMP01", first_name: "John", last_name: "Doe"}, ...]
   ↓
3. Calculate month date range
   Month: January 2025
   Days: [2025-01-01, 2025-01-02, ..., 2025-01-31]
   ↓
4. Fetch all timesheet logs for the month
   GET /api/time-tracker/logs?employee_id=ALL&start_date=2025-01-01&end_date=2025-01-31
   → [
       {employee_id: "EMP01", task_id: "TASK003", seconds: 20, work_date: "2025-01-13"},
       {employee_id: "EMP01", task_id: "TASK005", seconds: 40, work_date: "2025-01-14"},
       {employee_id: "EMP02", task_id: "TASK003", seconds: 120, work_date: "2025-01-13"},
       ...
     ]
   ↓
5. For each employee, calculate daily hours
   EMP01:
   - 2025-01-13: Filter logs → [20 seconds] → Total: 20s → Display: 00:00:20
   - 2025-01-14: Filter logs → [40 seconds] → Total: 40s → Display: 00:00:40
   - 2025-01-15: Filter logs → [] → Total: 0s → Display: 00:00:00
   - ...
   - Monthly Total: 60s → Display: 00:01:00
   ↓
6. Display in grid
   Employee | Total    | Jan 1    | Jan 2    | Jan 13   | Jan 14   | ...
   EMP01    | 00:01:00 | 00:00:00 | 00:00:00 | 00:00:20 | 00:00:40 | ...
   EMP02    | 00:02:00 | 00:00:00 | 00:00:00 | 00:02:00 | 00:00:00 | ...
```

## Display Format

### Time Format: HH:MM:SS

| Seconds | Display  | Description |
|---------|----------|-------------|
| 0       | 00:00:00 | No time logged |
| 20      | 00:00:20 | 20 seconds |
| 120     | 00:02:00 | 2 minutes |
| 3600    | 01:00:00 | 1 hour |
| 5445    | 01:30:45 | 1 hour 30 minutes 45 seconds |
| 28800   | 08:00:00 | 8 hours (full workday) |

### Example Display:

```
┌──────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Employee         │ Total    │ Mon 1/13 │ Tue 1/14 │ Wed 1/15 │ Thu 1/16 │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ John Doe         │ 16:30:00 │ 08:00:00 │ 08:00:00 │ 00:30:00 │ 00:00:00 │
│ EMP01            │          │          │          │          │          │
├──────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Jane Smith       │ 24:15:30 │ 08:00:00 │ 08:15:30 │ 08:00:00 │ 00:00:00 │
│ EMP02            │          │          │          │          │          │
└──────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

## Features

### ✅ Implemented:

1. **Real Data Display**
   - Fetches actual timesheet logs from backend
   - Shows logged hours per employee per day
   - Calculates monthly totals

2. **HH:MM:SS Format**
   - Consistent with My Timesheet page
   - Easy to read and understand
   - Accurate to the second

3. **Performance Optimization**
   - Single API call to fetch all logs (employee_id=ALL)
   - Client-side filtering by employee and date
   - Fallback to individual fetches if needed

4. **Month Navigation**
   - Previous/Next month buttons
   - Updates data automatically
   - Shows correct month label

5. **Employee Search**
   - Filter by employee name or ID
   - Real-time search
   - Case-insensitive

### 🔄 Data Accumulation:

If an employee logs multiple tasks on the same day:
```
Logs:
- TASK003: 20 seconds on 2025-01-13
- TASK005: 40 seconds on 2025-01-13
- TASK007: 60 seconds on 2025-01-13

Display:
- Jan 13: 00:02:00 (20 + 40 + 60 = 120 seconds = 2 minutes)
```

## Testing

### Test 1: View Team Timesheet

1. **Hard refresh** (Ctrl+F5)
2. **Go to My Team Timesheet**
3. **Check console:**
   ```
   Team Timesheet - Fetching logs for month: 2025-01-01 to 2025-01-31
   Team Timesheet - Loaded X logs
   ```
4. **Verify display:**
   - ✅ Employee names and IDs shown
   - ✅ Time displayed in HH:MM:SS format
   - ✅ Totals calculated correctly
   - ✅ Empty cells show 00:00:00

### Test 2: Log Time and Verify

1. **Go to My Tasks**
2. **Start timer** on TASK003
3. **Stop after 20 seconds**
4. **Go to My Team Timesheet**
5. **Find your employee row**
6. **Check today's column:**
   - ✅ Should show 00:00:20
   - ✅ Total should show 00:00:20

### Test 3: Multiple Logs Same Day

1. **Log 3 different tasks** on the same day:
   - TASK003: 20 seconds
   - TASK005: 40 seconds
   - TASK007: 60 seconds
2. **Go to My Team Timesheet**
3. **Check today's column:**
   - ✅ Should show 00:02:00 (accumulated total)

### Test 4: Month Navigation

1. **Click Previous Month**
2. **Check console:**
   ```
   Team Timesheet - Fetching logs for month: 2024-12-01 to 2024-12-31
   ```
3. **Verify:**
   - ✅ Month label updates
   - ✅ Days update (31 days for December)
   - ✅ Data updates for that month

## Backend Console Output

```
[TIME_TRACKER] GET /time-tracker/logs - employee_id=ALL, start_date=2025-01-01, end_date=2025-01-31
[TIME_TRACKER] Read 150 logs from local storage
[TIME_TRACKER] Filtered to 150 logs for ALL employees
```

## Browser Console Output

```
Team Timesheet - Fetching logs for month: 2025-01-01 to 2025-01-31
Team Timesheet - Loaded 150 logs
```

## Files Changed

1. **`pages/shared.js`**
   - Updated `teamRow` function to accept `logs` parameter
   - Added `formatTime` helper for HH:MM:SS display
   - Calculate daily hours from logs
   - Calculate monthly totals
   - Updated `renderTeamTimesheetPage` to fetch logs
   - Added console logging for debugging

2. **`backend/time_tracking.py`**
   - Added support for `employee_id=ALL`
   - Returns all employees' logs when requested
   - Added logging for ALL employee queries

## Benefits

1. **Accurate Data**
   - Shows real logged hours
   - Not hardcoded placeholders
   - Matches My Timesheet data

2. **Consistent Format**
   - Same HH:MM:SS format as My Timesheet
   - Easy comparison between pages
   - Professional appearance

3. **Manager View**
   - See all team members at once
   - Compare workloads
   - Identify patterns
   - Track attendance

4. **Performance**
   - Single API call for all data
   - Client-side filtering is fast
   - No lag when switching months

## Future Enhancements

1. **Click to View Details**
   - Click on a cell to see task breakdown
   - Show which tasks were worked on
   - Display project information

2. **Export to Excel**
   - Download team timesheet
   - Generate reports
   - Share with management

3. **Filters**
   - Filter by project
   - Filter by department
   - Filter by date range

4. **Summary Stats**
   - Total hours for team
   - Average hours per employee
   - Overtime tracking
   - Undertime alerts
