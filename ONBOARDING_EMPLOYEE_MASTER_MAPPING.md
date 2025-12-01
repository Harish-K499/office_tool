# Onboarding to Employee Master - Column Mapping

## Overview
When you click "Verify & Complete" in Stage 4 of Onboarding, the system:
1. Uploads documents to `crc6f_hr_onboarding` table
2. Creates a new employee in `employee_master` table using the **existing bulk upload logic**
3. Auto-generates Employee ID (e.g., EMP2025001)
4. Creates Login credentials
5. Creates Leave balance record

## Required Columns in Onboarding Table (`crc6f_hr_onboarding`)

These fields MUST be filled in Stages 1-3 before verification:

| Onboarding Field | Dataverse Column | Required | Collected in Stage |
|------------------|------------------|----------|-------------------|
| First Name | `crc6f_firstname` | ✅ Yes | Stage 1 |
| Last Name | `crc6f_lastname` | ✅ Yes | Stage 1 |
| Email | `crc6f_email` | ✅ Yes | Stage 1 |
| Contact Number | `crc6f_contactno` | ✅ Yes | Stage 1 |
| Address | `crc6f_address` | ✅ Yes | Stage 1 |
| Department | `crc6f_department` | ✅ Yes | Stage 1 |
| Designation | `crc6f_designation` | ✅ Yes | Stage 1 |
| Date of Joining | `crc6f_doj` | ✅ Yes | Stage 1 |
| Interview Status | `crc6f_interviewstatus` | ✅ Yes | Stage 2 |
| Mail Reply | `crc6f_offerpmailreply` | ✅ Yes | Stage 3 |

## Columns Created in Employee Master Table

When verification succeeds, these columns are populated in `crc6f_table12s` (Employee Master):

| Employee Master Field | Dataverse Column | Source | Auto-Generated |
|----------------------|------------------|--------|----------------|
| Employee ID | `crc6f_employeeid` | Auto-generated | ✅ Yes (EMP2025001) |
| First Name | `crc6f_firstname` | From onboarding | ❌ No |
| Last Name | `crc6f_lastname` | From onboarding | ❌ No |
| Email | `crc6f_email` | From onboarding | ❌ No |
| Contact Number | `crc6f_contactnumber` | From onboarding `crc6f_contactno` | ❌ No |
| Address | `crc6f_address` | From onboarding | ❌ No |
| Department | `crc6f_department` | From onboarding | ❌ No |
| Designation | `crc6f_designation` | From onboarding | ❌ No |
| Date of Joining | `crc6f_doj` | From onboarding | ❌ No |
| Active Flag | `crc6f_activeflag` | Set to "Active" | ✅ Yes |
| Experience | `crc6f_experience` | Calculated from DOJ | ✅ Yes |
| Quota Hours | `crc6f_quotahours` | Set to "9" | ✅ Yes |

## Additional Records Created Automatically

### 1. Login Record (`crc6f_hr_login_detailses`)
| Field | Value |
|-------|-------|
| Username | Same as email |
| Password | Temp@123 (hashed) |
| Access Level | Based on designation (L1/L2/L3) |
| User ID | Auto-generated |
| Employee Name | First + Last name |
| User Status | Active |

### 2. Leave Balance Record (`crc6f_hr_leavemangements`)
| Field | Value |
|-------|-------|
| Employee ID | Auto-generated EMP ID |
| CL (Casual Leave) | Based on experience |
| SL (Sick Leave) | Based on experience |
| Comp Off | 0 |
| Total | CL + SL |
| Allocation Type | Based on experience |

## Common Errors and Solutions

### Error: "Employee with email ... already exists"
**Cause:** Email already exists in Employee Master table  
**Solution:** 
- Check if employee already exists in Employee Master
- Use a different email address
- Delete the duplicate employee first

### Error: "Employee with contact number ... already exists"
**Cause:** Contact number already exists in Employee Master table  
**Solution:**
- Check if employee already exists in Employee Master
- Use a different contact number
- Delete the duplicate employee first

### Error: "Failed to create employee record"
**Cause:** Missing required fields or Dataverse connection issue  
**Solution:**
- Ensure all Stage 1 fields are filled
- Check backend console for detailed error
- Verify Dataverse connection (RESOURCE env variable)

### Error: "Document verification failed"
**Cause:** Multiple possible reasons  
**Solution:**
1. Open browser DevTools → Network tab
2. Click on the failed `verify` request
3. Check Response tab for error details
4. Check backend console for stack trace

## Field Mapping Between Tables

```
Onboarding Table          →    Employee Master Table
─────────────────────────      ──────────────────────────
crc6f_firstname           →    crc6f_firstname
crc6f_lastname            →    crc6f_lastname
crc6f_email               →    crc6f_email
crc6f_contactno           →    crc6f_contactnumber  ⚠️ Note: Different field name
crc6f_address             →    crc6f_address
crc6f_department          →    crc6f_department
crc6f_designation         →    crc6f_designation
crc6f_doj                 →    crc6f_doj
(auto-generated)          →    crc6f_employeeid
(set to "Active")         →    crc6f_activeflag
(calculated)              →    crc6f_experience
(set to "9")              →    crc6f_quotahours
```

## Verification Flow Step-by-Step

1. **Upload Documents** (if any selected)
   - Files saved to `backend/storage/uploads/`
   - URLs stored in `crc6f_documentsuploaded` as JSON array
   - Status set to `crc6f_documentsstatus = 'Pending'`

2. **Create Employee** (calls `/api/employees`)
   - Auto-generates Employee ID
   - Checks for duplicate email/contact
   - Creates employee record in `crc6f_table12s`
   - Creates login record in `crc6f_hr_login_detailses`
   - Creates leave balance in `crc6f_hr_leavemangements`
   - Sends login credentials email

3. **Update Onboarding Record**
   - `crc6f_documentsstatus = 'Verified'`
   - `crc6f_progresssteps = 'Completed'`
   - `crc6f_convertedtoemployee = True`
   - `crc6f_onboardingid = <Generated Employee ID>`

## Testing Checklist

Before clicking "Verify & Complete":

- [ ] Stage 1: All personal information filled (name, email, contact, address, department, designation, DOJ)
- [ ] Stage 2: Interview status = "Passed"
- [ ] Stage 3: Mail reply = "Yes"
- [ ] Stage 4: Documents uploaded (optional but recommended)
- [ ] Email is unique (not in Employee Master)
- [ ] Contact number is unique (not in Employee Master)
- [ ] Backend server is running
- [ ] Dataverse connection is working

## Debugging Steps

If verification fails:

1. **Check Browser Console**
   ```
   F12 → Console tab → Look for error messages
   ```

2. **Check Network Tab**
   ```
   F12 → Network tab → Click failed request → Response tab
   ```

3. **Check Backend Console**
   ```
   Look for lines starting with:
   ❌ Error calling employee creation API
   ❌ Employee creation failed
   ❌ Error completing onboarding
   ```

4. **Common Backend Error Patterns**
   - `Duplicate email`: Employee already exists
   - `Duplicate contact`: Contact number already exists
   - `404`: Dataverse table not found
   - `401/403`: Authentication/permission issue
   - `Timeout`: Dataverse connection slow/failed

## Support

If you continue to face issues:
1. Copy the full error from browser Network tab Response
2. Copy the backend console error with stack trace
3. Share both for detailed diagnosis
