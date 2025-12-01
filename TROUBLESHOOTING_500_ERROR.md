# Troubleshooting 500 Error - Onboarding Module

## 🔴 Error: Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)

### Most Likely Cause: **Dataverse Table Not Created**

The onboarding module requires a Dataverse table that doesn't exist yet.

---

## ✅ Solution: Create the Dataverse Table

### Step 1: Create Table in Dataverse

Go to your Dataverse environment and create a new table with one of these names:
- `crc6f_hr_onboarding` (preferred)
- `crc6f_hr_onboardings` (alternative)

### Step 2: Add Required Fields

Create the following columns in the table:

| Display Name | Schema Name | Data Type | Required | Notes |
|--------------|-------------|-----------|----------|-------|
| First Name | `crc6f_firstname` | Single Line of Text | Yes | Max 100 chars |
| Last Name | `crc6f_lastname` | Single Line of Text | Yes | Max 100 chars |
| Email | `crc6f_email` | Single Line of Text | Yes | Max 100 chars |
| Contact Number | `crc6f_contactnumber` | Single Line of Text | Yes | Max 20 chars |
| Address | `crc6f_address` | Multiple Lines of Text | Yes | |
| Department | `crc6f_department` | Single Line of Text | Yes | Max 100 chars |
| Designation | `crc6f_designation` | Single Line of Text | Yes | Max 100 chars |
| Date of Joining | `crc6f_doj` | Date Only | Yes | |
| Progress Step | `crc6f_progressstep` | Single Line of Text | No | Default: "Personal Information" |
| Interview Status | `crc6f_interviewstatus` | Choice | No | Options: Pending, Passed, Failed |
| Interview Date | `crc6f_interviewdate` | Date Only | No | |
| Mail Status | `crc6f_mailstatus` | Choice | No | Options: Not Sent, Sent |
| Mail Reply | `crc6f_mailreply` | Choice | No | Options: Pending, Yes, No |
| Document Status | `crc6f_documentstatus` | Choice | No | Options: Pending, Verified |
| Document URLs | `crc6f_documenturls` | Multiple Lines of Text | No | Store JSON array |
| Employee ID | `crc6f_employeeid` | Single Line of Text | No | Auto-generated |
| Converted to Master | `crc6f_convertedtomaster` | Yes/No | No | Default: No |

---

## 🔍 How to Check What's Wrong

### Step 1: Restart Backend Server
```bash
cd backend
python unified_server.py
```

### Step 2: Try to Submit the Form Again

Watch the terminal/console output. You should see:
```
📝 Creating onboarding record with data: {...}
✅ Using entity set: crc6f_hr_onboardings
📦 Payload: {...}
🔄 Calling create_record...
```

### Step 3: Look for Error Messages

**If you see:**
```
❌ Error creating onboarding record: Error creating record: 404 - ...
```
**Solution:** The table doesn't exist. Create it in Dataverse.

**If you see:**
```
❌ Error creating onboarding record: Error creating record: 400 - Invalid column name 'crc6f_...'
```
**Solution:** A required field is missing. Add it to the table.

**If you see:**
```
❌ Error creating onboarding record: Failed to get token: ...
```
**Solution:** Check your Dataverse credentials in `id.env`:
- TENANT_ID
- CLIENT_ID
- CLIENT_SECRET
- RESOURCE

---

## 🛠️ Quick Fix Options

### Option 1: Use Existing Employee Table (Temporary Workaround)

If you want to test the functionality without creating a new table, you can temporarily use the employee table:

1. Open `backend/unified_server.py`
2. Find line ~5951:
   ```python
   ONBOARDING_ENTITY = "crc6f_hr_onboardings"
   ```
3. Change to:
   ```python
   ONBOARDING_ENTITY = "crc6f_table12s"  # Use employee table temporarily
   ```

**Note:** This is NOT recommended for production as it mixes onboarding and employee data.

### Option 2: Create the Table Properly (Recommended)

Follow the steps in "Solution: Create the Dataverse Table" above.

---

## 📋 Dataverse Table Creation Script

If you have PowerShell access to Dataverse, you can use this script:

```powershell
# Connect to Dataverse
Connect-CrmOnline -ServerUrl "https://yourorg.crm.dynamics.com"

# Create the table
$table = @{
    DisplayName = "HR Onboarding"
    SchemaName = "crc6f_hr_onboarding"
    Description = "Employee onboarding records"
}

# Add fields (example for First Name)
$field = @{
    DisplayName = "First Name"
    SchemaName = "crc6f_firstname"
    Type = "String"
    MaxLength = 100
    Required = $true
}
```

---

## 🧪 Test After Creating Table

1. **Restart backend server**
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Go to Onboarding page**
4. **Fill the form and click "Save & Continue"**

You should see:
- ✅ Success toast message
- ✅ Form advances to Stage 2
- ✅ Record appears in Dataverse table

---

## 🆘 Still Getting 500 Error?

### Check Backend Logs

Look for the exact error message in the terminal. Common issues:

1. **Authentication Error:**
   ```
   Failed to get token: invalid_client
   ```
   **Fix:** Check CLIENT_ID and CLIENT_SECRET in `id.env`

2. **Permission Error:**
   ```
   Error creating record: 403 - Forbidden
   ```
   **Fix:** Grant your app registration permissions to Dataverse

3. **Field Mismatch:**
   ```
   Error creating record: 400 - Invalid column name
   ```
   **Fix:** Ensure all field names match exactly (case-sensitive)

4. **Network Error:**
   ```
   ConnectionError: Failed to establish connection
   ```
   **Fix:** Check internet connection and RESOURCE URL

---

## 📞 Need More Help?

1. **Check the full error in browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages

2. **Check backend terminal output:**
   - Look for the detailed traceback
   - Copy the full error message

3. **Verify Dataverse connection:**
   - Test with existing endpoints (e.g., `/api/employees`)
   - If those work, the issue is specific to onboarding table

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend Terminal:**
```
📝 Creating onboarding record with data: {'firstname': 'John', ...}
✅ Using entity set: crc6f_hr_onboardings
📦 Payload: {'crc6f_firstname': 'John', ...}
🔄 Calling create_record...
✅ Record created: {'crc6f_hr_onboardingid': 'guid-here', ...}
```

**Browser:**
- ✅ Green success toast: "Onboarding record created successfully"
- ✅ Page advances to Stage 2: Interview Scheduled
- ✅ No errors in console

**Dataverse:**
- ✅ New record appears in `crc6f_hr_onboarding` table
- ✅ All fields populated correctly
- ✅ Progress Step = "Interview Scheduled"

---

## 📝 Summary

**The 500 error is most likely because:**
1. The Dataverse table `crc6f_hr_onboarding` doesn't exist
2. OR the table exists but is missing required fields
3. OR there's a field name mismatch

**To fix:**
1. Create the table in Dataverse with all required fields
2. Restart the backend server
3. Try submitting the form again
4. Check backend logs for detailed error messages

---

**Last Updated:** January 2025
