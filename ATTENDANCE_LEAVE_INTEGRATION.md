# Attendance & Leave Historical Data Integration

## ✅ What Was Fixed

### 1. **Attendance Historical Data Loading**
- **Backend**: Updated `/api/attendance/<employee_id>/<year>/<month>` to:
  - Fetch records from Dataverse `crc6f_table13s`
  - Classify attendance status based on duration:
    - `>= 9 hours` → **P** (Present)
    - `5-8 hours` → **H** (Half Day)
    - `< 5 hours` → **A** (Absent)
  - Return structured data with `day`, `status`, `checkIn`, `checkOut`, `duration`

- **Frontend**: 
  - Created `features/attendanceApi.js` with `fetchMonthlyAttendance()`
  - Updated `pages/attendance.js`:
    - `renderMyAttendancePage()` now fetches historical data before rendering
    - `renderTeamAttendancePage()` fetches data for all active employees
    - Data populates `state.attendanceData` for calendar display

### 2. **Real-time Calendar Updates After Check-in/Check-out**
- `features/timer.js` already calls `renderMyAttendancePage()` after check-out
- Since `renderMyAttendancePage()` now fetches fresh data from Dataverse, the calendar automatically updates with the latest attendance status

### 3. **Leave Historical Data Loading**
- **Backend**: Added `/api/leaves/<employee_id>` route to:
  - Fetch leave records from Dataverse `crc6f_table14s`
  - Return formatted leave history with all fields

- **Frontend**:
  - Created `features/leaveApi.js` with `fetchEmployeeLeaves()`
  - Updated `pages/leaveTracker.js`:
    - `renderLeaveTrackerPage()` now fetches historical leaves before rendering
    - Displays all past leave applications in the table

## 📋 Attendance Status Classification Rules

```
Duration (hours) | Status | Display
-----------------|--------|--------
>= 9             | P      | Present
5 - 8            | H      | Half Day
< 5              | A      | Absent
```

## 🔌 New API Endpoints

### Get Monthly Attendance
```http
GET /api/attendance/<employee_id>/<year>/<month>
```

**Response:**
```json
{
  "success": true,
  "records": [
    {
      "date": "2025-10-16",
      "day": 16,
      "attendance_id": "ATD-ABC123",
      "checkIn": "09:00:00",
      "checkOut": "18:00:00",
      "duration": 9.0,
      "status": "P"
    }
  ],
  "count": 1
}
```

### Get Employee Leaves
```http
GET /api/leaves/<employee_id>
```

**Response:**
```json
{
  "success": true,
  "leaves": [
    {
      "leave_id": "LVE-XYZ789",
      "leave_type": "Casual Leave",
      "start_date": "2025-10-20",
      "end_date": "2025-10-22",
      "total_days": "3",
      "paid_unpaid": "Paid",
      "status": "Pending",
      "approved_by": "",
      "employee_id": "Emp01"
    }
  ],
  "count": 1
}
```

## 🔄 Data Flow

### Attendance Page Load:
1. User navigates to `#/attendance-my` or `#/attendance-team`
2. `renderMyAttendancePage()` / `renderTeamAttendancePage()` called
3. Fetches historical data via `fetchMonthlyAttendance()`
4. Populates `state.attendanceData[employeeId]` with day-wise records
5. Renders calendar with status indicators (P/H/A)

### After Check-in/Check-out:
1. Timer calls backend `/api/checkin` or `/api/checkout`
2. Backend stores record in Dataverse
3. Timer calls `renderMyAttendancePage()`
4. Fresh data fetched from Dataverse
5. Calendar updates with latest status

### Leave Tracker Page Load:
1. User navigates to `#/leave-tracker`
2. `renderLeaveTrackerPage()` called
3. Fetches historical leaves via `fetchEmployeeLeaves()`
4. Populates `state.leaves` array
5. Renders leave history table

## 📁 Files Modified

### Backend
- `backend/unified_server.py`
  - Updated `get_monthly_attendance()` with status classification
  - Added `get_employee_leaves()` route

### Frontend
- `features/attendanceApi.js` - Added `fetchMonthlyAttendance()`
- `features/leaveApi.js` - Created with `fetchEmployeeLeaves()` and `applyLeave()`
- `pages/attendance.js` - Made render functions async, fetch data on load
- `pages/leaveTracker.js` - Made async, fetch leaves on load
- `features/timer.js` - Already refreshes attendance after check-out

## ✅ Testing Checklist

- [ ] Navigate to My Attendance → see historical records with P/H/A status
- [ ] Navigate to Team Attendance → see all employees' historical records
- [ ] Check-in → calendar updates immediately
- [ ] Check-out → calendar shows correct status based on duration
- [ ] Navigate to Leave Tracker → see all past leave applications
- [ ] Apply new leave → appears in history after submission
- [ ] Change month in attendance → fetches new month's data

## 🚀 How to Run

1. **Start Backend:**
   ```bash
   cd backend
   python unified_server.py
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test:**
   - Open `http://localhost:3005`
   - Navigate to Attendance/Leave pages
   - Verify historical data loads from Dataverse

## 👥 Employee Master Data & Leave Settings

### Employee DOJ Information
Based on the employee master table analysis, here are the corrected Date of Joining (DOJ) values:

| Employee ID | Name | DOJ | Leave Eligibility Start |
|-------------|------|-----|------------------------|
| EMP001 | Bala R | 10/24/2021 | Immediate (3+ years) |
| EMP002 | Karthick R | 10/24/2023 | Immediate (2+ years) |
| EMP003 | Suresh K | 10/24/2023 | Immediate (2+ years) |
| EMP004 | Priya M | 10/24/2024 | Immediate (1+ year) |
| EMP005 | Anitha P | 10/24/2025 | Probation (New joinee) |

### Leave Allocation Rules Based on DOJ
```
Tenure (from DOJ) | Annual Leave | Casual Leave | Sick Leave
------------------|--------------|--------------|------------
0-6 months       | 0 days       | 3 days       | 5 days
6-12 months      | 10 days      | 6 days       | 7 days
1-2 years        | 15 days      | 8 days       | 10 days
2+ years         | 21 days      | 12 days      | 12 days
```

### 🚨 Data Mapping Issues Identified
**Critical**: Employee master table has field misalignment:
- `crc6f_doj` field contains designation data instead of dates
- Actual DOJ values are stored in `crc6f_email` field
- Email addresses are stored in `crc6f_quotahours` field

**Recommendation**: Fix the data import/mapping process to ensure correct field alignment.

### Correct Field Mapping (What Should Be)
```
Field Name          | Current Data        | Should Contain
--------------------|--------------------|-----------------
crc6f_doj          | "Power BI Developer"| "10/24/2021"
crc6f_email        | "10/24/2021"       | "bala.r@vtab.com"
crc6f_quotahours   | "suresh.k@vtab.com"| "40" (hours)
crc6f_designation  | "Data Analytics"    | "Power BI Developer"
crc6f_department   | "Admin"            | "IT Department"
```

### Employee Data Correction Required
For proper leave calculation integration, the following fields need correction:

| Employee | Current DOJ Field | Actual DOJ | Current Email Field | Actual Email |
|----------|------------------|------------|--------------------| -------------|
| EMP001 | Power BI Developer | 10/24/2021 | 10/24/2021 | suresh.k@vtab.com |
| EMP002 | Power BI Developer | 10/24/2023 | 10/24/2023 | karthick.r@vatb.com |
| EMP003 | Power BI Developer | 10/24/2023 | 10/24/2023 | anita.p@vtab.com |
| EMP004 | Power BI Developer | 10/24/2024 | 10/24/2024 | priya.m@vtab.com |
| EMP005 | None | 10/24/2025 | 10/24/2025 | None |

## 🔄 Leave Balance Calculation Updates

### Experience-Based Leave Allocation
The system now automatically calculates leave quotas based on employee experience (calculated from DOJ):

**Backend Changes (`unified_server.py`):**
- Updated `/api/leave-balance/all/<employee_id>` endpoint
- Removed hardcoded default quotas (CL=12, SL=10)
- Implemented dynamic allocation based on DOJ:
  ```python
  # Calculate experience from DOJ
  experience_years = (current_date - doj_date).days / 365.25
  
  # Assign allocation type
  if experience_years >= 3:    # Type 1
      cl_annual = 6, sl_annual = 6
  elif experience_years >= 2:  # Type 2
      cl_annual = 4, sl_annual = 4
  else:                        # Type 3
      cl_annual = 3, sl_annual = 3
  ```

### Leave Balance Display
The "My Leaves" panel now shows:
- **Casual Leave**: Based on employee's allocation type
- **Sick Leave**: Based on employee's allocation type  
- **Comp Off**: Earned comp offs (default 0)
- **Total**: Sum of CL + SL + Comp Off available
- **Actual Total**: Total annual quota (CL + SL)

### Example Allocations
| Employee | Experience | Type | CL Quota | SL Quota | Total |
|----------|-----------|------|----------|----------|-------|
| EMP001 (Bala R) | 4 years | Type 1 | 6 | 6 | 12 |
| EMP002 (Karthick R) | 2 years | Type 2 | 4 | 4 | 8 |
| EMP003 (Suresh K) | 2 years | Type 2 | 4 | 4 | 8 |
| EMP004 (Priya M) | 1 year | Type 3 | 3 | 3 | 6 |
| EMP005 (Anitha P) | 0 years | Type 3 | 3 | 3 | 6 |

## 🔄 Syncing Leave Allocations to Dataverse

### New API Endpoint
```http
POST /api/sync-leave-allocations
```

This endpoint:
1. Fetches all employees from the employee master table
2. Calculates experience from DOJ for each employee
3. Determines allocation type (Type 1/2/3) based on experience
4. Updates or creates records in `crc6f_hr_leavemangements` table with:
   - `crc6f_employeeid`: Employee ID
   - `crc6f_cl`: Casual Leave quota (6/4/3)
   - `crc6f_sl`: Sick Leave quota (6/4/3)
   - `crc6f_total`: Total quota (12/8/6)

### Running the Sync
```bash
cd backend
python sync_allocations.py
```

**Result**: All 5 employees' leave allocations have been synced to Dataverse! ✅

| Employee | Synced CL | Synced SL | Synced Total |
|----------|-----------|-----------|--------------|
| EMP001 | 6 | 6 | 12 |
| EMP002 | 4 | 4 | 8 |
| EMP003 | 4 | 4 | 8 |
| EMP004 | 3 | 3 | 6 |
| EMP005 | 3 | 3 | 6 |

## 🔐 Admin Access Control

### **Administrator**
- **EMP001 (Bala R)** - Full admin access
  - Can view team attendance
  - Can view team leaves
  - Can approve/reject leave applications
  - Can access leave settings
  - Can manage employee allocations

### **Regular Employees**
- **EMP002 (Karthick R)** - Employee access only
- **EMP003 (Suresh K)** - Employee access only ✅
- **EMP004 (Priya M)** - Employee access only
- **EMP005 (Anitha P)** - Employee access only

**Note**: All employees except EMP001 have restricted access to their own data only. They cannot view team attendance, team leaves, or access administrative features.

## 📝 Notes

- All data is fetched fresh on every page load (no caching)
- Status classification happens server-side for consistency
- Check-in/check-out automatically refreshes the calendar
- Leave history includes all fields from Dataverse
- **Important**: Leave quotas are now dynamically calculated from DOJ
- **Fixed**: DOJ field mapping corrected to fetch actual dates instead of roles
- **Synced**: Leave allocations are now stored in `crc6f_hr_leavemangements` table
- **My Leaves Panel**: Displays correct quotas based on employee experience
- **Admin Access**: Only EMP001 has administrative privileges
