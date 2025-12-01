# Quick Fix - API Not Defined Error

## Error
```
Failed to fetch team logs: ReferenceError: API is not defined
    at renderTeamTimesheetPage (shared.js:789:45)
```

## Cause
The `API` constant was not defined in the `renderTeamTimesheetPage` function.

## Fix
Added `const API = 'http://localhost:5000/api';` at the start of the function.

**Before:**
```javascript
export const renderTeamTimesheetPage = async () => {
    try {
        const base = window.__teamTsMonth || new Date();
        // ... rest of code
        const response = await fetch(`${API}/time-tracker/logs?...`);
        //                              ^^^ API not defined!
```

**After:**
```javascript
export const renderTeamTimesheetPage = async () => {
    const API = 'http://localhost:5000/api';  // ← Added this
    
    try {
        const base = window.__teamTsMonth || new Date();
        // ... rest of code
        const response = await fetch(`${API}/time-tracker/logs?...`);
        //                              ^^^ Now works!
```

## Test Now

1. **Hard refresh** (Ctrl+F5)
2. **Go to Team Timesheet**
3. **Check console** - should see:
   ```
   Team Timesheet - Fetching logs for month: 2025-10-31 to 2025-11-29
   Team Timesheet - Employees: Array(18)
   Team Timesheet - Fetch response status: 200
   Team Timesheet - Fetched X logs
   Team Timesheet - Employee IDs in logs: [...]
   ```

4. **No more errors!** ✅

## Expected Output

```
Team Timesheet - Fetching logs for month: 2025-10-31 to 2025-11-29
Team Timesheet - Employees: Array(18)
Team Timesheet - Fetch response status: 200
Team Timesheet - Fetched 5 logs
Team Timesheet - Employee IDs in logs: ["EMP001", "EMP002"]
Team Timesheet - Bala (EMP002): 00:00:20 total
Team Timesheet - Loaded 5 logs
```

## Files Changed
- `pages/shared.js` - Line 761: Added `const API = 'http://localhost:5000/api';`
