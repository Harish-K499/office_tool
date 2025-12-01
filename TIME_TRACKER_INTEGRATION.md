# Time Tracker Integration Guide

## Overview
This document describes the complete Time Tracker implementation with My Tasks and My Timesheet modules.

## Files Modified

### 1. Frontend Files

#### `pages/shared.js`
- **`renderMyTasksPage()`** - My Tasks page with timer functionality
- **`renderMyTimesheetPage()`** - My Timesheet weekly grid page

#### `router.js`
Add these routes:
```javascript
const routes = {
  "/time-my-tasks": renderMyTasksPage,
  "/time-my-timesheet": renderMyTimesheetPage,
};
```

#### `components/layout.js`
Add navigation items:
```javascript
<li><a href="#/time-my-tasks" class="nav-link" data-page="time-my-tasks">My Tasks</a></li>
<li><a href="#/time-my-timesheet" class="nav-link" data-page="time-my-timesheet">My Timesheet</a></li>
```

### 2. Backend Files

#### `backend/time_tracking.py`
New blueprint with endpoints:
- `GET /api/tasks` - List tasks with optional filters (assigned_to, project_id)
- `POST /api/time-tracker/task-log` - Create timesheet log entry
- `GET /api/time-tracker/logs` - Get timesheet logs (employee_id, start_date, end_date)
- `DELETE /api/time-tracker/logs` - Delete timesheet entries

#### `backend/unified_server.py`
Register the blueprint:
```python
from time_tracking import time_tracking_bp
app.register_blueprint(time_tracking_bp)
```

## Features Implemented

### My Tasks Page
1. **Role-Based Visibility**
   - Admin/L3 users (EMP001, Bala, Vignesh): See all tasks
   - Regular users: See only assigned tasks (filtered by assigned_to)

2. **Timer Functionality**
   - Start button: Stores timestamp in localStorage, shows running badge
   - Live ticking: Updates every second with format HH:MM:SS
   - Stop button: Calculates elapsed time, posts to backend, redirects to My Timesheet
   - Prevents multiple timers running simultaneously

3. **UI Features**
   - Search tasks by ID, name, status, project
   - Refresh button to reload tasks
   - Color-coded status badges (In Progress, Hold, Done)
   - Project and client columns

### My Timesheet Page
1. **Weekly Grid View**
   - Monday-to-Sunday week display
   - Week navigation (previous/next buttons)
   - Automatically anchors to current week or last logged date

2. **Editable Grid**
   - Project dropdown (populated from backend)
   - Task dropdown (populated from backend)
   - Billing type selector (Billable/Non-billable)
   - Hour inputs for each day (Mon-Sun)
   - Row totals calculated automatically

3. **Data Management**
   - Loads existing logs from backend for selected week
   - Groups logs by project/task combination
   - Add row button to create new entries
   - Delete row button with confirmation
   - Submit button to save changes
   - Cancel button to reset changes

4. **Summary Display**
   - Total logged hours for the week
   - Total billable hours
   - Highlights today's column

## API Endpoints

### GET /api/tasks
**Query Parameters:**
- `assigned_to` (optional): Filter by employee ID
- `project_id` (optional): Filter by project

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "guid": "task-guid",
      "task_id": "TASK-001",
      "task_name": "Task Name",
      "project_id": "PROJ-001",
      "task_status": "In Progress",
      "due_date": "2025-01-15",
      "task_priority": "High"
    }
  ]
}
```

### POST /api/time-tracker/task-log
**Request Body:**
```json
{
  "employee_id": "EMP001",
  "project_id": "PROJ-001",
  "task_guid": "task-guid",
  "task_id": "TASK-001",
  "task_name": "Task Name",
  "seconds": 3600,
  "work_date": "2025-01-13",
  "description": "Optional description"
}
```

### GET /api/time-tracker/logs
**Query Parameters:**
- `employee_id` (required): Employee ID
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "employee_id": "EMP001",
      "project_id": "PROJ-001",
      "task_guid": "task-guid",
      "task_id": "TASK-001",
      "task_name": "Task Name",
      "seconds": 3600,
      "work_date": "2025-01-13"
    }
  ]
}
```

### DELETE /api/time-tracker/logs
**Request Body:**
```json
{
  "employee_id": "EMP001",
  "project_id": "PROJ-001",
  "task_guid": "task-guid",
  "work_date": "2025-01-13"
}
```

## Data Flow

### Starting a Timer (My Tasks)
1. User clicks Start button on a task
2. Timestamp stored in localStorage: `tt_active_{employeeId}`
3. UI updates to show Stop button and running timer
4. Timer ticks every second showing elapsed time

### Stopping a Timer (My Tasks)
1. User clicks Stop button
2. Calculate elapsed seconds
3. POST to `/api/time-tracker/task-log` with:
   - employee_id, project_id, task_guid, task_id, task_name
   - seconds (elapsed time)
   - work_date (today)
4. Clear localStorage timer
5. Store context in sessionStorage: `tt_last_log`
6. Redirect to `#/time-my-timesheet`

### Loading Timesheet (My Timesheet)
1. Determine week range (Monday-Sunday)
2. GET `/api/time-tracker/logs` with employee_id, start_date, end_date
3. Group logs by project_id + task_guid
4. Populate grid with hours for each day
5. Calculate row and week totals

### Saving Timesheet (My Timesheet)
1. User edits hours in grid
2. Click Submit button
3. POST each modified row to `/api/time-tracker/task-log`
4. Show success message
5. Refresh grid

## LocalStorage Keys
- `tt_active_{employeeId}` - Active timer state
  ```json
  {
    "task_guid": "guid",
    "task_id": "TASK-001",
    "task_name": "Task Name",
    "project_id": "PROJ-001",
    "started_at": 1736755200000
  }
  ```

- `tt_projects_v1` - Cached projects for client lookup
- `sessionStorage: tt_last_log` - Last logged entry for week anchor

## CSS Classes
- `.status-badge` - Task status indicator
- `.status-badge.inprogress` - Blue badge for in-progress
- `.status-badge.hold` - Orange badge for on-hold
- `.status-badge.done` - Green badge for completed
- `.running` - Red text for running timer
- `.ts-header` - Timesheet header with blue background
- `.ts-table` - Timesheet grid table
- `.ts-hour-input` - Hour input cells
- `.ts-cell-today` - Highlighted today column

## Integration Steps

1. **Copy Frontend Code**
   - Copy `renderMyTasksPage` and `renderMyTimesheetPage` from `pages/shared.js`
   - Add routes to `router.js`
   - Add navigation links to `components/layout.js`

2. **Setup Backend**
   - Copy `backend/time_tracking.py`
   - Register blueprint in `unified_server.py`
   - Ensure Dataverse connection is configured

3. **Test Flow**
   - Navigate to My Tasks
   - Start a timer on a task
   - Wait a few seconds (timer should tick)
   - Stop the timer
   - Verify redirect to My Timesheet
   - Check that hours appear in the correct day column
   - Test week navigation
   - Test add/delete rows

## Known Issues & Fixes

### Issue 1: Timer Not Ticking
**Fix:** Implemented `setInterval` to update timer display every second
- Added `updateTimers()` function
- Starts interval when active timer detected
- Clears interval on page re-render

### Issue 2: Timesheet Not Showing Logged Hours
**Fix:** Proper data grouping and display
- Groups logs by project_id + task_guid
- Maps work_date to correct day column (0-6 for Mon-Sun)
- Converts seconds to hours (divide by 3600)
- Displays as "HH:MM" format

### Issue 3: Week Navigation Not Working
**Fix:** Proper anchor date management
- Uses Monday as week start
- Calculates week range correctly
- Updates anchor on prev/next click
- Re-renders grid with new date range

## UI Match with Screenshot
The My Timesheet page now matches the provided screenshot:
- ✅ Blue header with "My timesheet" title
- ✅ Week navigation in center (date range display)
- ✅ Submit and Cancel Changes buttons on right
- ✅ Total logged and Total billable summary row
- ✅ Project, Task, Billing dropdowns
- ✅ Mon-Sun columns with date labels
- ✅ Hour input cells (editable)
- ✅ Row totals column
- ✅ Delete row button (X icon)
- ✅ Add row button at bottom
- ✅ Today's column highlighted

## Next Steps
1. Implement Submit functionality to save all grid changes
2. Add validation for hour inputs (HH:MM format)
3. Add project/task filtering in dropdowns
4. Implement billable hours calculation
5. Add export to Excel feature
6. Add approval workflow for submitted timesheets
