# Dataverse Timesheet Integration

## Overview
The timesheet logging system now integrates with **Dataverse table `crc6f_hr_timesheetlog`** for persistent storage with automatic fallback to local JSON files.

## Dataverse Table Structure

### Table: `crc6f_hr_timesheetlog`
**Logical Name:** `crc6f_hr_timesheetlog`  
**Entity Set Name:** `crc6f_hr_timesheetlogs` (used in API URLs)  
**Display Name:** HR_Timesheet Log

### Columns Mapping

| Dataverse Column | Type | Description | Mapped From Frontend |
|-----------------|------|-------------|---------------------|
| `crc6f_hr_timesheetlogid` | GUID | Primary Key | Auto-generated |
| `crc6f_employeeid` | String | Employee ID | `employee_id` |
| `crc6f_projectid` | String | Project ID | `project_id` |
| `crc6f_taskid` | String | Task ID | `task_id` |
| `crc6f_hoursworked` | Decimal | Hours Worked | `seconds / 3600` |
| `crc6f_workdescription` | String | Work Description | `task_name` or `description` |
| `crc6f_approvalstatus` | String | Approval Status | Default: "Pending" |
| `crc6f_approvedby` | String | Approved By | (Future use) |
| `crc6f_timesheetid` | String | Timesheet ID | (Future use) |
| `createdby` | Lookup | Created By | Auto-populated |
| `createdon` | DateTime | Created On | Auto-populated |

## API Endpoints

### 1. Create Timesheet Log (POST)

**Endpoint:** `POST /api/time-tracker/task-log`

**Request Body:**
```json
{
  "employee_id": "Emp01",
  "project_id": "VTAB004",
  "task_guid": "14341df0-0dbf-f011-bbd3-7c1e523baf62",
  "task_id": "TASK003",
  "task_name": "test",
  "seconds": 20,
  "work_date": "2025-01-13",
  "description": "Optional description"
}
```

**Process:**
1. Validates required fields: `employee_id`, `seconds > 0`, `work_date`
2. Converts seconds to hours: `hours_worked = seconds / 3600`
3. Creates Dataverse payload:
   ```json
   {
     "crc6f_employeeid": "Emp01",
     "crc6f_projectid": "VTAB004",
     "crc6f_taskid": "TASK003",
     "crc6f_hoursworked": 0.01,
     "crc6f_workdescription": "test",
     "crc6f_approvalstatus": "Pending"
   }
   ```
4. POSTs to Dataverse: `{RESOURCE}/api/data/v9.2/crc6f_hr_timesheetlogs`
5. On success: Also saves to local JSON as backup
6. On failure: Falls back to local JSON only

**Response (Success):**
```json
{
  "success": true,
  "log": {
    "id": "LOG-1736755200000",
    "employee_id": "Emp01",
    "project_id": "VTAB004",
    "task_id": "TASK003",
    "task_name": "test",
    "seconds": 20,
    "work_date": "2025-01-13",
    "description": "",
    "created_at": "2025-01-13T12:00:00Z"
  },
  "dataverse_saved": true
}
```

**Response (Dataverse Failed, Local Saved):**
```json
{
  "success": true,
  "log": {...},
  "dataverse_saved": false,
  "dataverse_error": "Error details"
}
```

### 2. List Timesheet Logs (GET)

**Endpoint:** `GET /api/time-tracker/logs`

**Query Parameters:**
- `employee_id` (required): Employee ID to filter
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Example:**
```
GET /api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-13&end_date=2025-01-19
```

**Process:**
1. Validates `employee_id` is provided
2. Builds OData filter: `crc6f_employeeid eq 'Emp01'`
3. Fetches from Dataverse: `{RESOURCE}/api/data/v9.2/crc6f_hr_timesheetlogs?$filter=...`
4. Transforms Dataverse records to frontend format:
   - Converts `crc6f_hoursworked` back to seconds: `hours * 3600`
   - Extracts `work_date` from `createdon` field
   - Maps all fields to frontend schema
5. Applies date filters in Python
6. On Dataverse failure: Falls back to local JSON

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "abc-123-guid",
      "employee_id": "Emp01",
      "project_id": "VTAB004",
      "task_id": "TASK003",
      "task_name": "test",
      "seconds": 20,
      "work_date": "2025-01-13",
      "description": "test",
      "approval_status": "Pending",
      "created_at": "2025-01-13T12:00:00Z"
    }
  ],
  "source": "dataverse"
}
```

### 3. Delete Timesheet Log (DELETE)

**Endpoint:** `DELETE /api/time-tracker/logs`

**Request Body (Option 1 - By ID):**
```json
{
  "log_id": "abc-123-guid"
}
```

**Request Body (Option 2 - By Criteria):**
```json
{
  "employee_id": "Emp01",
  "work_date": "2025-01-13",
  "project_id": "VTAB004",
  "task_id": "TASK003"
}
```

**Process:**
1. If `log_id` provided:
   - Deletes from Dataverse: `DELETE {RESOURCE}/api/data/v9.2/crc6f_hr_timesheetlogs({log_id})`
   - Also removes from local cache
2. If criteria provided:
   - Falls back to local JSON deletion
3. Returns count of deleted records

**Response:**
```json
{
  "success": true,
  "deleted": 1,
  "source": "dataverse"
}
```

## Data Flow

### When Timer Stops:

```
Frontend (My Tasks)
  ↓
  Calculates total seconds (accumulated + current)
  ↓
POST /api/time-tracker/task-log
  {
    employee_id: "Emp01",
    project_id: "VTAB004",
    task_id: "TASK003",
    seconds: 20,
    work_date: "2025-01-13"
  }
  ↓
Backend (time_tracking.py)
  ↓
  Converts: seconds → hours (20 / 3600 = 0.01)
  ↓
POST to Dataverse
  {
    crc6f_employeeid: "Emp01",
    crc6f_projectid: "VTAB004",
    crc6f_taskid: "TASK003",
    crc6f_hoursworked: 0.01,
    crc6f_workdescription: "test",
    crc6f_approvalstatus: "Pending"
  }
  ↓
Dataverse Table: crc6f_hr_timesheetlog
  ✅ Record created with GUID
  ✅ createdon = current timestamp
  ↓
Backend also saves to local JSON (backup)
  ↓
Response to Frontend
  ↓
Frontend redirects to My Timesheet
```

### When Timesheet Loads:

```
Frontend (My Timesheet)
  ↓
GET /api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-13&end_date=2025-01-19
  ↓
Backend (time_tracking.py)
  ↓
GET from Dataverse
  $filter=crc6f_employeeid eq 'Emp01'
  ↓
Dataverse returns records
  [
    {
      crc6f_hr_timesheetlogid: "abc-123",
      crc6f_employeeid: "Emp01",
      crc6f_projectid: "VTAB004",
      crc6f_taskid: "TASK003",
      crc6f_hoursworked: 0.01,
      crc6f_workdescription: "test",
      createdon: "2025-01-13T12:00:00Z"
    }
  ]
  ↓
Backend transforms to frontend format
  - hours → seconds: 0.01 * 3600 = 20
  - createdon → work_date: "2025-01-13"
  ↓
Response to Frontend
  {
    logs: [{
      employee_id: "Emp01",
      project_id: "VTAB004",
      task_id: "TASK003",
      seconds: 20,
      work_date: "2025-01-13"
    }]
  }
  ↓
Frontend groups by project/task
  ↓
Frontend displays in grid
  Project: VTAB HR Tool
  Task: test
  Mon: 0.01 hours
```

## Fallback Mechanism

The system uses a **dual-storage approach**:

1. **Primary:** Dataverse (cloud, persistent, shared)
2. **Backup:** Local JSON files (server-side cache)

### When Dataverse is Available:
- ✅ All writes go to Dataverse first
- ✅ Then saved to local JSON as backup
- ✅ All reads come from Dataverse
- ✅ Local JSON is updated for consistency

### When Dataverse Fails:
- ⚠️ Writes go to local JSON only
- ⚠️ Response includes `"dataverse_saved": false`
- ⚠️ Reads come from local JSON
- ⚠️ Response includes `"source": "local"`

### Benefits:
- **Reliability:** System works even if Dataverse is down
- **Performance:** Local cache speeds up reads
- **Data Safety:** Dual storage prevents data loss
- **Transparency:** Response indicates data source

## Historical Records

### Fetching Historical Data:

All timesheet logs are stored in Dataverse with timestamps, allowing:

1. **Date Range Queries:**
   ```
   GET /api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-01&end_date=2025-01-31
   ```

2. **Employee History:**
   ```
   GET /api/time-tracker/logs?employee_id=Emp01
   ```
   Returns all logs for the employee

3. **Audit Trail:**
   - `createdon` field shows when log was created
   - `createdby` field shows who created it
   - `crc6f_approvalstatus` tracks approval workflow

### Updating Records:

Currently, the system creates new records on each timer stop. To support updates:

**Option 1: Update existing record**
```python
# Add PATCH endpoint
@bp_time.route("/time-tracker/logs/<log_id>", methods=["PATCH"])
def update_log(log_id):
    # Update Dataverse record
    url = f"{RESOURCE}{DV_API}/crc6f_hr_timesheetlogs({log_id})"
    resp = requests.patch(url, headers=headers, json=payload)
```

**Option 2: Aggregate by day**
- Check if log exists for employee + project + task + date
- If exists: Update hours (add to existing)
- If not: Create new record

## Approval Workflow

The `crc6f_approvalstatus` field supports workflow:

### Status Values:
- **"Pending"** - Default when created
- **"Approved"** - Manager approved
- **"Rejected"** - Manager rejected
- **"Submitted"** - Employee submitted for approval

### Implementation:

1. **Submit for Approval:**
   ```javascript
   // Frontend: Update status to "Submitted"
   PATCH /api/time-tracker/logs/{log_id}
   { "approval_status": "Submitted" }
   ```

2. **Manager Approval:**
   ```javascript
   // Frontend: Manager updates status
   PATCH /api/time-tracker/logs/{log_id}
   {
     "approval_status": "Approved",
     "approved_by": "manager_id"
   }
   ```

3. **Filter by Status:**
   ```
   GET /api/time-tracker/logs?employee_id=Emp01&status=Pending
   ```

## Testing

### 1. Test Create (POST)

**Backend Console:**
```bash
cd "f:/Final file for my tasks and timesheet/Final-Vtab/backend"
python unified_server.py
```

**Browser Console:**
```javascript
fetch('http://localhost:5000/api/time-tracker/task-log', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    employee_id: 'Emp01',
    project_id: 'VTAB004',
    task_id: 'TASK003',
    task_name: 'test',
    seconds: 20,
    work_date: '2025-01-13',
    description: 'Test entry'
  })
})
.then(r => r.json())
.then(d => console.log('Create result:', d));
```

**Expected:** `dataverse_saved: true`

### 2. Test Fetch (GET)

```javascript
fetch('http://localhost:5000/api/time-tracker/logs?employee_id=Emp01&start_date=2025-01-13&end_date=2025-01-19')
.then(r => r.json())
.then(d => console.log('Fetch result:', d));
```

**Expected:** `source: "dataverse"`, logs array with records

### 3. Test Delete (DELETE)

```javascript
fetch('http://localhost:5000/api/time-tracker/logs', {
  method: 'DELETE',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    log_id: 'abc-123-guid'
  })
})
.then(r => r.json())
.then(d => console.log('Delete result:', d));
```

**Expected:** `deleted: 1`, `source: "dataverse"`

### 4. Verify in Dataverse

**Power Apps Portal:**
1. Go to Dataverse
2. Navigate to Tables → `crc6f_hr_timesheetlog`
3. View data
4. Verify record exists with correct values

**OData Query:**
```
{RESOURCE}/api/data/v9.2/crc6f_hr_timesheetlogs?$filter=crc6f_employeeid eq 'Emp01'
```

## Troubleshooting

### Issue: Dataverse not saving

**Check:**
1. Backend console for errors
2. Token is valid: `get_access_token()` returns token
3. RESOURCE and DV_API env variables are set
4. Network connectivity to Dataverse

**Debug:**
```python
# Add to backend
print(f"Posting to: {url}")
print(f"Payload: {payload}")
print(f"Response: {resp.status_code} - {resp.text}")
```

### Issue: Records not appearing in timesheet

**Check:**
1. Console logs: `My Timesheet - Loaded logs:`
2. Response source: Should be `"dataverse"`
3. Date range: Logs within current week?
4. Employee ID matches

**Debug:**
```javascript
// Browser console
fetch('http://localhost:5000/api/time-tracker/logs?employee_id=Emp01')
.then(r => r.json())
.then(d => console.log('All logs:', d));
```

### Issue: Fallback to local storage

**Symptoms:**
- Response shows `"source": "local"`
- Response shows `"dataverse_saved": false`

**Causes:**
- Dataverse API down
- Authentication failed
- Network timeout
- Invalid payload

**Solution:**
- Check backend console for error details
- Verify Dataverse connection
- Data still saved locally, will sync when Dataverse is back

## Future Enhancements

1. **Sync Mechanism:**
   - Periodic job to sync local → Dataverse
   - Retry failed saves
   - Conflict resolution

2. **Batch Operations:**
   - Submit entire week at once
   - Bulk approve/reject

3. **Advanced Filtering:**
   - Filter by project
   - Filter by approval status
   - Filter by date range

4. **Reporting:**
   - Weekly summaries
   - Project-wise breakdown
   - Billable vs non-billable hours

5. **Notifications:**
   - Notify on approval/rejection
   - Remind to submit timesheet
   - Alert on missing entries
