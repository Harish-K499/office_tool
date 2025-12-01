# Timesheet Format Fix - HH:MM:SS Display

## Changes Made

### 1. Task Column - Show Only Task ID

**Before:**
- Displayed: "test" (task name)

**After:**
- Displays: "TASK003" or "TASK005" (task ID only)

**Code Change:**
```javascript
// Task ID only (not task name)
const taskId = row.task_id || 'Unknown Task';

<td>
  <div style="padding: 8px;">${taskId}</div>
</td>
```

### 2. Time Format - HH:MM:SS Instead of Decimal Hours

**Before:**
- Stored: 0.01 hours (decimal)
- Displayed: "0.01" in grid
- Total: "0.01h"

**After:**
- Stored: 20 seconds (integer)
- Displayed: "00:00:20" in grid
- Total: "00:00:20"

**Code Changes:**

#### A. Store Seconds (Not Hours)
```javascript
// Group logs by project/task
logs.forEach(l => {
    const dayIdx = Math.floor((new Date(l.work_date) - s)/86400000);
    if (dayIdx >= 0 && dayIdx < 7) {
        const seconds = Number(l.seconds||0);
        // Accumulate if multiple entries for same day
        const existingSecs = grouped[key].hours[dayIdx] || 0;
        grouped[key].hours[dayIdx] = existingSecs + seconds;  // Store seconds
    }
});
```

#### B. Format Helper Function
```javascript
const formatTime = (secs) => {
    if (!secs) return '';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};
```

#### C. Display in Grid
```javascript
const displayVal = h ? formatTime(h) : '';

<input type="text" 
       value="${displayVal}"  // Shows "00:00:20"
       placeholder="00:00:00" 
       readonly />
```

#### D. Row Total
```javascript
const totalSecs = row.hours.reduce((sum, h) => sum + (Number(h) || 0), 0);
const rowTotal = formatTime(totalSecs);  // Shows "00:00:20"
```

#### E. Summary Totals
```javascript
const totalLoggedSecs = logs.reduce((sum, l) => sum + Number(l.seconds||0), 0);

<div>Total logged: <strong>${formatTimeDisplay(totalLoggedSecs)}</strong></div>
// Shows "00:00:20" instead of "0.01h"
```

## Examples

### Example 1: 20 Seconds

**Timer stops at:** 00:00:20

**Backend stores:**
```json
{
  "seconds": 20,
  "work_date": "2025-01-13"
}
```

**Timesheet displays:**
- Grid cell: `00:00:20`
- Row total: `00:00:20`
- Week total: `00:00:20`

### Example 2: 1 Hour 30 Minutes 45 Seconds

**Timer stops at:** 01:30:45

**Backend stores:**
```json
{
  "seconds": 5445,
  "work_date": "2025-01-13"
}
```

**Timesheet displays:**
- Grid cell: `01:30:45`
- Row total: `01:30:45`
- Week total: `01:30:45`

### Example 3: Multiple Entries Same Day

**Entry 1:** 00:00:20 (20 seconds)
**Entry 2:** 00:01:40 (100 seconds)

**Backend stores:**
```json
[
  {"seconds": 20, "work_date": "2025-01-13"},
  {"seconds": 100, "work_date": "2025-01-13"}
]
```

**Timesheet accumulates:**
- Total seconds: 20 + 100 = 120
- Displays: `00:02:00` (2 minutes)

## Data Structure

### Before (Decimal Hours):
```javascript
gridRows = [
  {
    project_id: "VTAB004",
    task_id: "TASK003",
    hours: [0.01, 0, 0, 0, 0, 0, 0]  // Decimal hours
  }
]
```

### After (Seconds):
```javascript
gridRows = [
  {
    project_id: "VTAB004",
    task_id: "TASK003",
    hours: [20, 0, 0, 0, 0, 0, 0]  // Seconds
  }
]
```

## Display Mapping

| Seconds | HH:MM:SS | Previous (Hours) |
|---------|----------|------------------|
| 20 | 00:00:20 | 0.01h |
| 60 | 00:01:00 | 0.02h |
| 120 | 00:02:00 | 0.03h |
| 3600 | 01:00:00 | 1.00h |
| 5445 | 01:30:45 | 1.51h |
| 7200 | 02:00:00 | 2.00h |

## Testing

### Test 1: Start and Stop Timer

1. Go to My Tasks
2. Start timer on TASK005
3. Wait 20 seconds
4. Stop timer
5. Check My Timesheet:
   - ✅ Task column shows: "TASK005" (not "test")
   - ✅ Monday cell shows: "00:00:20" (not "0.01")
   - ✅ Total shows: "00:00:20" (not "0.01h")

### Test 2: Multiple Timers Same Task

1. Start timer on TASK003
2. Stop after 30 seconds
3. Start timer on TASK003 again
4. Stop after 1 minute 30 seconds
5. Check My Timesheet:
   - ✅ Shows single row for TASK003
   - ✅ Monday cell shows: "00:02:00" (30s + 90s = 120s = 2 minutes)

### Test 3: Different Tasks

1. Start timer on TASK003
2. Stop after 20 seconds
3. Start timer on TASK005
4. Stop after 40 seconds
5. Check My Timesheet:
   - ✅ Shows two rows
   - ✅ Row 1: TASK003 - 00:00:20
   - ✅ Row 2: TASK005 - 00:00:40
   - ✅ Total logged: 00:01:00

## Console Output

### When Timesheet Loads:

```javascript
My Timesheet - Week: 2025-01-13 to 2025-01-19
My Timesheet - Loaded logs: [
  {
    employee_id: "Emp01",
    project_id: "VTAB004",
    task_id: "TASK005",
    seconds: 20,
    work_date: "2025-01-13"
  }
]
My Timesheet - Grid rows: [
  {
    project_id: "VTAB004",
    task_id: "TASK005",
    hours: [20, 0, 0, 0, 0, 0, 0]  // Seconds, not hours
  }
]
```

### Display Calculation:

```javascript
// For Monday cell (20 seconds)
formatTime(20)
  → h = Math.floor(20 / 3600) = 0
  → m = Math.floor(20 / 60) = 0
  → s = 20 % 60 = 20
  → "00:00:20"

// For row total (20 seconds)
totalSecs = 20 + 0 + 0 + 0 + 0 + 0 + 0 = 20
formatTime(20) → "00:00:20"

// For week total (20 seconds)
totalLoggedSecs = 20
formatTimeDisplay(20) → "00:00:20"
```

## Benefits

1. **Exact Time Display**
   - Shows precise time: 00:00:20
   - No rounding errors from decimal conversion
   - Matches timer display format

2. **Better Readability**
   - HH:MM:SS is standard time format
   - Easier to understand than decimal hours
   - Consistent with timer display

3. **Accurate Accumulation**
   - Stores seconds as integers
   - No floating-point precision issues
   - Correct totals when adding multiple entries

4. **Task Identification**
   - Shows TASK003, TASK005 (clear IDs)
   - Not "test" (ambiguous names)
   - Easy to match with My Tasks page

## Files Changed

**`pages/shared.js`**
- Changed task display from `task_name` to `task_id`
- Changed hours storage from decimal to seconds
- Added `formatTime()` helper for HH:MM:SS display
- Updated grid cell display to show HH:MM:SS
- Updated row totals to show HH:MM:SS
- Updated summary totals to show HH:MM:SS
- Changed placeholder from "00:00" to "00:00:00"

## Backward Compatibility

**Old data (decimal hours):**
- If old logs exist with decimal hours, they'll be converted:
  - Backend should store seconds (already done)
  - Frontend expects seconds (now updated)

**Migration:**
- No migration needed if backend always stored seconds
- Frontend now correctly interprets seconds as seconds (not hours)

## Next Steps

1. **Hard refresh** (Ctrl+F5)
2. **Test with TASK005**
3. **Verify format**: HH:MM:SS
4. **Check task column**: Shows TASK005 (not task name)
5. **Test accumulation**: Multiple entries same day
