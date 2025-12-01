# Leave Tracker UI Fix

## 🐛 Issues Fixed

### 1. **Leave data not showing after applying leave**
**Root Cause:** 
- Frontend was sending `applied_by: state.user.name` ("Admin User") instead of `state.user.id` ("Emp01")
- Backend stores and filters by `crc6f_employeeid`, so it couldn't match the name
- After applying leave, the page wasn't awaiting the async `renderLeaveTrackerPage()` call

**Fix:**
- Changed `applied_by` to send `state.user.id` instead of `state.user.name`
- Added `await` when calling `renderLeaveTrackerPage()` after successful submission
- Removed manual `state.leaves.push()` since we now fetch fresh data from Dataverse

### 2. **Historical leave data not loading**
**Root Cause:**
- Router was calling async `renderLeaveTrackerPage()` synchronously
- Page rendered before data was fetched from Dataverse

**Fix:**
- Made `router()` function async
- Added `await` when calling page renderers
- Now properly waits for data to load before rendering

## 📝 Changes Made

### `pages/leaveTracker.js`
```javascript
// Before:
const appliedBy = state.user.name; // Sent "Admin User"

// After:
const appliedBy = state.user.id; // Sends "Emp01"
```

```javascript
// Before:
state.leaves.push({...}); // Manual state update
closeModal();
renderLeaveTrackerPage(); // No await

// After:
closeModal();
await renderLeaveTrackerPage(); // Fetches fresh data from Dataverse
```

### `router.js`
```javascript
// Before:
export const router = () => {
    const pageRenderer = routes[path] || renderHomePage;
    pageRenderer(); // Synchronous call
    updateActiveNav(path);
};

// After:
export const router = async () => {
    const pageRenderer = routes[path] || renderHomePage;
    await pageRenderer(); // Waits for async page renderers
    updateActiveNav(path);
};
```

## ✅ Expected Behavior Now

### On Page Load:
1. Navigate to Leave Tracker (`#/leave-tracker`)
2. `renderLeaveTrackerPage()` is called (async)
3. Fetches historical leaves via `GET /api/leaves/Emp01`
4. Populates `state.leaves` array
5. Renders table with all historical leaves

### After Applying Leave:
1. Fill out leave application form
2. Submit → sends `POST /apply_leave` with `applied_by: "Emp01"`
3. Backend stores in Dataverse with `crc6f_employeeid: "Emp01"`
4. On success:
   - Close modal
   - Call `await renderLeaveTrackerPage()` → fetches fresh data
   - Show success alert
5. Table now shows the newly applied leave

## 🧪 Testing Steps

1. **Test Historical Data:**
   ```
   - Open Leave Tracker page
   - Should see all past leave applications
   - Check browser console for "Fetching leaves from Dataverse"
   ```

2. **Test Apply Leave:**
   ```
   - Click "APPLY LEAVE"
   - Fill form:
     - Leave Type: Casual Leave
     - Start Date: Tomorrow
     - End Date: Day after tomorrow
     - Compensation: Paid
   - Submit
   - Should see success alert
   - Table should immediately show the new leave
   ```

3. **Verify in Backend:**
   ```
   - Check backend console for:
     "✅ Record Created: {leave_id: 'LVE-...', ...}"
   - Verify crc6f_employeeid is "Emp01" (not "Admin User")
   ```

4. **Test Refresh:**
   ```
   - Reload page (F5)
   - Navigate away and back to Leave Tracker
   - Historical data should persist and load correctly
   ```

## 🔍 Debug Tips

If leaves still don't show:

1. **Check Backend Logs:**
   ```
   Look for:
   - "GET /api/leaves/Emp01" request
   - Response with leave records
   ```

2. **Check Browser Console:**
   ```javascript
   // Should see:
   console.log('Fetching leaves for:', state.user.id); // "Emp01"
   ```

3. **Check Network Tab:**
   ```
   - GET /api/leaves/Emp01 → Status 200
   - Response body should have "leaves" array
   ```

4. **Verify Employee ID Match:**
   ```
   - In Dataverse, check crc6f_employeeid field
   - Should be "Emp01" (or "EMP01" - case insensitive filter)
   ```

## 📊 Data Flow

```
Apply Leave:
1. User fills form
2. Frontend sends: { applied_by: "Emp01", ... }
3. Backend stores: { crc6f_employeeid: "Emp01", ... }
4. Frontend calls: await renderLeaveTrackerPage()
5. Fetches: GET /api/leaves/Emp01
6. Backend filters: WHERE crc6f_employeeid = 'Emp01'
7. Returns matching records
8. UI updates with fresh data
```

## 🚀 Ready to Test

All fixes are in place. Reload the frontend and test:
1. Navigate to Leave Tracker → see historical data
2. Apply new leave → see it appear immediately
3. Refresh page → data persists

The UI should now properly reflect both historical and newly applied leaves! 🎉
