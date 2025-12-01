# Fix: Empty employee_id Error

## Problem
When stopping a timer, the error occurred:
```
Failed to save timesheet log: employee_id, seconds>0 and work_date required
```

Console showed:
```javascript
{employee_id: '', project_id: 'VTAB004', task_guid: '...', ...}
```

The `employee_id` was empty string.

## Root Cause

The `state` object was not exposed globally on `window`, so `window.state?.user` was returning `undefined`.

The code in `shared.js` was trying to access:
```javascript
const user = window.state?.user || {};
```

But `window.state` didn't exist, so it fell back to empty object `{}`, resulting in empty `employee_id`.

## Solution

### 1. Expose state globally (index.js)
```javascript
// Expose state globally for compatibility
window.state = state;
```

This ensures `window.state` is available throughout the app.

### 2. Use imported state first (shared.js)
```javascript
// Import at top
import { state } from '../state.js';

// In functions
const user = state?.user || window.state?.user || {};
```

This provides a fallback chain:
1. Try imported `state` first
2. Fall back to `window.state`
3. Fall back to empty object

### 3. Add debug logging
```javascript
console.log('My Tasks - User:', user);
console.log('My Tasks - Employee ID:', empId);
```

This helps diagnose issues in the future.

## Files Changed

1. **`index.js`** (line 80)
   - Added `window.state = state;` to expose state globally

2. **`pages/shared.js`** (lines 179, 436)
   - Updated `renderMyTasksPage` to use `state?.user || window.state?.user`
   - Updated `renderMyTimesheetPage` to use `state?.user || window.state?.user`
   - Added console logging for debugging

## Testing

After these changes:

1. **Hard refresh** (Ctrl+F5)
2. **Open console** (F12)
3. **Check state**:
   ```javascript
   console.log(window.state.user);
   // Should show: {name: "...", id: "Emp01", ...}
   ```
4. **Start and stop a timer**
5. **Check console logs**:
   ```
   My Tasks - User: {name: "Admin User", id: "Emp01", ...}
   My Tasks - Employee ID: Emp01
   Posting timesheet log: {employee_id: 'Emp01', ...}
   Response status: 201
   Response data: {success: true, log: {...}}
   ```

## Expected Behavior

### Before Fix:
```javascript
window.state // undefined
user // {}
empId // ''
POST body // {employee_id: '', ...}
Response // 400 Bad Request
```

### After Fix:
```javascript
window.state // {user: {id: "Emp01", ...}, ...}
user // {id: "Emp01", name: "Admin User", ...}
empId // "Emp01"
POST body // {employee_id: "Emp01", ...}
Response // 201 Created
```

## Why This Happened

The app uses ES6 modules with `import/export`, but some pages were written to expect `window.state` to be available globally. The `index.js` file imported `state` but didn't expose it on `window`, causing the disconnect.

## Prevention

Going forward:
1. Always expose shared state on `window` if pages need global access
2. Use imported state first, then fall back to window
3. Add debug logging for critical user data
4. Test with console logs to verify state is populated

## Related Issues

This same pattern should be checked in other pages that use:
- `window.state?.user`
- `window.state?.employees`
- `window.state?.timer`
- etc.

All should have fallback to imported `state` object.
