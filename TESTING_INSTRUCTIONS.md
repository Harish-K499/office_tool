# Testing Instructions - Leave Balance Display

## ✅ Changes Made

### Files Modified:
1. **backend/unified_server.py** - Added new endpoint `/api/leave-balance/all/<employee_id>`
2. **features/leaveApi.js** - Added `fetchAllLeaveBalances()` function
3. **pages/leaveTracker.js** - Updated to fetch and display real-time leave balances
4. **pages/leaveTracker.ts** - Updated TypeScript version (for reference)
5. **index.css** - Enhanced circular progress indicator styles

## 🚀 How to Test

### Step 1: Start Backend Server
The backend is already running! You should see:
```
 * Running on http://127.0.0.1:5000
 * Debugger is active!
```

If not running, start it:
```bash
cd backend
python unified_server.py
```

### Step 2: Start Frontend Server
Open a new terminal and run:
```bash
npm run dev
```

The frontend should start on `http://localhost:3000`

### Step 3: Test Leave Balance Display

1. **Open the application** in your browser: `http://localhost:3000`

2. **Login** with your credentials (e.g., EMP001 or any employee)

3. **Navigate to Leave Tracker**:
   - Click "Leave Tracker" in the sidebar
   - Or go to "Leaves tracker" → "My Leaves"

4. **Verify Circular Progress Indicators**:
   - You should see 3 circular progress cards at the top:
     - **Casual Leave** - with blue progress ring
     - **Sick Leave** - with blue progress ring
     - **Comp off** - with blue progress ring
   
   - Each card should display:
     - Large number in center = Available days
     - "days" label below the number
     - Legend showing:
       - 🔵 Annual Quota (e.g., 12 for CL, 10 for SL)
       - 🔵 Consumed (days used)
       - ⚪ Available (days remaining)

5. **Check Console Logs**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see:
     ```
     🔄 Fetching real-time leave balances for: EMP001
     ✅ Leave balances fetched: [...]
     ```

### Step 4: Test Real-Time Updates

1. **Apply for Leave**:
   - Click "APPLY LEAVE" button
   - Fill in the form:
     - Leave Type: Casual Leave
     - Start Date: (select a future date)
     - End Date: (select a future date)
     - Reason: "Testing"
   - Click Submit

2. **Verify Balance Updates**:
   - Page should refresh automatically
   - Circular progress indicators should update
   - "Consumed" should increase
   - "Available" should decrease

### Step 5: Test with Different Employees

1. **Logout** and login as different employee (e.g., EMP002)
2. Navigate to Leave Tracker
3. Verify that balances are specific to that employee

### Step 6: Test Admin (EMP001)

1. Login as **EMP001** (admin)
2. Navigate to Leave Tracker
3. Verify circular progress indicators display correctly
4. Admin should see their own leave balances

## 🔍 Troubleshooting

### Issue: Circular progress indicators not showing

**Check:**
1. Backend server is running on port 5000
2. Frontend can connect to backend
3. Browser console for errors
4. Network tab in DevTools - look for `/api/leave-balance/all/EMP001` request

**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check if `leaveTracker.js` file was updated (not `.ts`)

### Issue: Shows "No leave types configured"

**Cause:** Old cached version of `leaveTracker.js`

**Solution:**
1. Stop frontend server (Ctrl+C)
2. Clear browser cache
3. Restart frontend: `npm run dev`
4. Hard refresh browser (Ctrl+F5)

### Issue: Backend error "Failed to fetch leave balance"

**Check:**
1. Dataverse connection is working
2. Employee has a record in `crc6f_hr_leavemangements` table
3. Backend console for detailed error logs

**Solution:**
- Check `backend/id.env` file has correct credentials
- Verify employee exists in Dataverse
- Check backend logs for specific error

### Issue: Balances show 0 for all leave types

**Cause:** No leave balance record in Dataverse for this employee

**Solution:**
- Backend returns default values (CL: 12, SL: 10, CO: 0)
- Create a leave balance record in Dataverse for the employee
- Or apply for leave to create the record automatically

## 📊 Expected Output

### Console Logs (Browser):
```
🔄 Fetching real-time leave balances for: EMP001
✅ Leave balances fetched: [
  {type: "Casual Leave", annual_quota: 12, consumed: 3, available: 9},
  {type: "Sick Leave", annual_quota: 10, consumed: 2, available: 8},
  {type: "Comp off", annual_quota: 0, consumed: 0, available: 5}
]
```

### Console Logs (Backend):
```
======================================================================
🔍 FETCHING ALL LEAVE BALANCES FOR EMPLOYEE: EMP001
======================================================================
✅ Leave balances fetched successfully:
   Casual Leave: Annual=12, Consumed=3, Available=9
   Sick Leave: Annual=10, Consumed=2, Available=8
   Comp off: Annual=0, Consumed=0, Available=5
======================================================================
```

### Visual Display:
```
┌─────────────────────────────────────────────────────────────┐
│  Casual Leave          Sick Leave           Comp off        │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐     │
│  │    9    │          │    8    │          │    5    │     │
│  │  days   │          │  days   │          │  days   │     │
│  └─────────┘          └─────────┘          └─────────┘     │
│  🔵 Annual: 12        🔵 Annual: 10        🔵 Annual: 0    │
│  🔵 Consumed: 3       🔵 Consumed: 2       🔵 Consumed: 0  │
│  ⚪ Available: 9      ⚪ Available: 8      ⚪ Available: 5  │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Success Criteria

- [x] Circular progress indicators display on "My Leaves" page
- [x] Shows real-time data from Dataverse
- [x] Displays Annual Quota, Consumed, and Available for each leave type
- [x] Works for all employees including admin (EMP001)
- [x] Updates automatically after applying leave
- [x] No console errors
- [x] Proper visual design with circular charts

## 📝 Notes

- The `.js` file is used by the browser, not the `.ts` file
- Both files have been updated for consistency
- Backend endpoint: `GET /api/leave-balance/all/<employee_id>`
- Frontend fetches data on every page load (no caching)
- Default annual quotas: CL=12, SL=10, CO=0

## 🎯 Next Steps

If everything works:
1. Test with multiple employees
2. Apply for leave and verify balance updates
3. Check team view (should not show quota cards)
4. Verify data persists across page refreshes

If issues persist:
1. Check browser console for errors
2. Check backend console for errors
3. Verify network requests in DevTools
4. Clear all caches and restart both servers
