# Timer Updates - Pause/Resume & Timesheet Sync

## Changes Made

### 1. Pause/Resume Functionality

#### New Features:
- **Pause Button**: When timer is running, shows Pause button alongside Stop
- **Resume Button**: When timer is paused, shows Resume (Play) button alongside Stop
- **Accumulated Time**: Timer tracks total accumulated time across pause/resume cycles
- **Visual Indicators**: 
  - Running timer: Red color (#d63031)
  - Paused timer: Orange color (#f39c12)

#### Implementation Details:

**Timer State Structure:**
```javascript
{
  task_guid: "guid",
  task_id: "TASK-001",
  task_name: "Task Name",
  project_id: "PROJ-001",
  started_at: 1736755200000,  // Timestamp when current session started
  accumulated: 3600,           // Total seconds accumulated from previous sessions
  paused: false                // true when paused, false when running
}
```

**Functions Added:**
- `pauseLocalTimer(task)` - Pauses the timer and accumulates elapsed time
- Updated `startLocalTimer(task)` - Handles both fresh start and resume
- Updated `stopLocalTimer(task)` - Calculates total time including accumulated

**Button States:**
- **Not Started**: Shows Play button only
- **Running**: Shows Pause + Stop buttons
- **Paused**: Shows Play (Resume) + Stop buttons

### 2. Timesheet Time Display

#### Fixed Issues:
1. **Accurate Time Logging**: Timer now sends exact accumulated seconds to backend
2. **Proper Display**: Timesheet shows hours as decimal (e.g., "14.16" for 14h 10m)
3. **Multiple Entries**: If multiple logs exist for same day/task, they accumulate
4. **Date Mapping**: Correctly maps work_date to the right day column (Mon-Sun)

#### How It Works:

**When Timer Stops:**
1. Calculate total seconds: `accumulated + current_session`
2. POST to `/api/time-tracker/task-log` with exact seconds
3. Store context in sessionStorage
4. Redirect to My Timesheet

**When Timesheet Loads:**
1. Fetch logs for current week from backend
2. Group by project_id + task_guid
3. Convert seconds to hours: `seconds / 3600`
4. Map to correct day column based on work_date
5. Display as decimal hours (2 decimal places)

**Example:**
- Timer runs for 14 hours 10 minutes = 51,000 seconds
- Backend stores: `seconds: 51000`
- Timesheet displays: `14.17` hours in today's column

### 3. Timer Display Updates

#### Live Ticking:
- Updates every second via `setInterval`
- Shows format: `HH:MM:SS` (e.g., "14:10:35")
- Continues ticking even when paused (shows accumulated time)
- Color changes based on state (red=running, orange=paused)

#### Accumulated Time Calculation:
```javascript
let totalSecs = active.accumulated || 0;
if (!active.paused && active.started_at) {
    totalSecs += Math.floor((Date.now() - active.started_at) / 1000);
}
```

## User Flow

### Starting a Timer:
1. User clicks **Start** button on a task
2. Timer begins at 00:00:00 and ticks every second
3. Button changes to **Pause** + **Stop**
4. Timer color: Red (running)

### Pausing a Timer:
1. User clicks **Pause** button
2. Current elapsed time is added to accumulated total
3. Timer display freezes but continues showing accumulated time
4. Button changes to **Play** (Resume) + **Stop**
5. Timer color: Orange (paused)

### Resuming a Timer:
1. User clicks **Play** (Resume) button
2. Timer continues from accumulated time
3. Button changes back to **Pause** + **Stop**
4. Timer color: Red (running)

### Stopping a Timer:
1. User clicks **Stop** button
2. Total time calculated (accumulated + current session if running)
3. POST request sent to backend with exact seconds
4. Timer cleared from localStorage
5. Automatic redirect to My Timesheet
6. Time appears in today's column for that task

### Viewing in Timesheet:
1. My Timesheet loads current week (Mon-Sun)
2. Fetches all logs from backend for the week
3. Groups logs by project + task
4. Displays hours in correct day columns
5. Shows row totals and week totals
6. Highlights today's column in blue

## Technical Details

### LocalStorage Structure:
```javascript
// Key: tt_active_{employeeId}
{
  "task_guid": "abc-123",
  "task_id": "TASK-001",
  "task_name": "Python Training",
  "project_id": "PROJ-001",
  "started_at": 1736755200000,
  "accumulated": 3600,
  "paused": false
}
```

### Backend API Call (Stop Timer):
```javascript
POST /api/time-tracker/task-log
{
  "employee_id": "EMP001",
  "project_id": "PROJ-001",
  "task_guid": "abc-123",
  "task_id": "TASK-001",
  "task_name": "Python Training",
  "seconds": 51000,              // Total accumulated seconds
  "work_date": "2025-01-13",     // Today's date
  "description": ""
}
```

### Timesheet Data Loading:
```javascript
GET /api/time-tracker/logs?employee_id=EMP001&start_date=2025-01-13&end_date=2025-01-19

Response:
{
  "success": true,
  "logs": [
    {
      "employee_id": "EMP001",
      "project_id": "PROJ-001",
      "task_guid": "abc-123",
      "task_id": "TASK-001",
      "task_name": "Python Training",
      "seconds": 51000,
      "work_date": "2025-01-13"
    }
  ]
}
```

### Timesheet Display Calculation:
```javascript
// Convert seconds to hours
const hours = (51000 / 3600).toFixed(2);  // "14.17"

// Map to correct day column
const dayIndex = Math.floor((new Date("2025-01-13") - mondayDate) / 86400000);
// If today is Wednesday, dayIndex = 2 (Mon=0, Tue=1, Wed=2)

// Display in grid
gridRows[0].hours[2] = "14.17";
```

## CSS Updates

### Timer Colors:
```css
.running { 
  color: #d63031;  /* Red for running */
  font-weight: 600;
}

.paused {
  color: #f39c12;  /* Orange for paused */
  font-weight: 600;
}
```

### Timesheet Today Column:
```css
.ts-cell-today {
  background: #e3f2fd;  /* Light blue highlight */
}
```

## Testing Checklist

- [x] Start timer - should begin at 00:00:00
- [x] Timer ticks every second
- [x] Pause timer - time freezes, color changes to orange
- [x] Resume timer - continues from paused time
- [x] Stop timer - redirects to timesheet
- [x] Timesheet shows correct hours in today's column
- [x] Multiple pause/resume cycles accumulate correctly
- [x] Week navigation works in timesheet
- [x] Today's column is highlighted
- [x] Row totals calculate correctly
- [x] Can't start another task while one is running
- [x] Can start same task after stopping

## Known Limitations

1. **Manual Time Entry**: Currently timesheet inputs are readonly (from backend logs only)
2. **Edit Functionality**: Submit button not yet implemented for manual edits
3. **Validation**: No validation for manual hour entries yet
4. **Multiple Entries**: If you log time multiple times for same task/day, they accumulate

## Future Enhancements

1. Allow manual time entry in timesheet grid
2. Implement Submit functionality to save manual edits
3. Add time format validation (HH:MM or decimal)
4. Add edit/delete buttons for individual log entries
5. Add timer history/log view
6. Add daily/weekly time limits and warnings
7. Add project/task selection in timesheet dropdowns
8. Implement approval workflow for submitted timesheets
