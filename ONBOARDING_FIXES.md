# Onboarding Module - Bug Fixes & Enhancements

## 🐛 Issues Fixed

### 1. **500 Internal Server Error on Save & Continue**

**Problem:**
- The onboarding API was calling `create_record()` and `update_record()` with 3 parameters
- These functions from `dataverse_helper.py` only accept 2 parameters
- This caused a 500 error when trying to save Stage 1 personal information

**Solution:**
- Fixed all `create_record(entity_set, payload, token)` calls to `create_record(entity_set, payload)`
- Fixed all `update_record(entity_set, record_id, payload, token)` calls to `update_record(entity_set, record_id, payload)`
- The functions internally handle token acquisition via `get_access_token()`

**Files Modified:**
- `backend/unified_server.py` (lines 6275, 6336, 6362, 6474, 6514, 6541, 6562)

---

### 2. **Employee Master Creation Logic**

**Problem:**
- Employee creation from onboarding was not using the same robust logic as bulk upload
- Missing field mapping, experience calculation, quota hours, leave balance, etc.

**Solution:**
- Implemented complete employee creation logic matching bulk upload functionality:
  - ✅ Uses `get_field_map()` to handle different table structures
  - ✅ Properly maps firstname/lastname vs fullname fields
  - ✅ Calculates experience based on Date of Joining
  - ✅ Sets quota hours to 9
  - ✅ Creates login record with proper access level
  - ✅ Creates leave balance record based on experience
  - ✅ Sends login credentials email
  - ✅ Updates onboarding record with employee ID

**Files Modified:**
- `backend/unified_server.py` (lines 6421-6562 in `verify_documents_and_complete()`)

---

## ✨ Features Implemented

### 1. **Offer Letter Email on Interview Pass**

**Functionality:**
- When interview status is set to "Passed" in Stage 2
- System automatically sends professional offer letter email
- Email includes:
  - Candidate name
  - Position and department
  - Date of joining
  - Request to reply "Yes" to accept
- Updates `Mail_Status` to "Sent"
- Advances `Progress_Step` to "Mail Confirmation"

**Implementation:**
```python
if interview_status == 'Passed':
    candidate_data = {
        'email': candidate.get('crc6f_email'),
        'firstname': candidate.get('crc6f_firstname'),
        'lastname': candidate.get('crc6f_lastname'),
        'designation': candidate.get('crc6f_designation'),
        'department': candidate.get('crc6f_department'),
        'doj': candidate.get('crc6f_doj')
    }
    send_offer_letter_email(candidate_data)
    update_payload['crc6f_mailstatus'] = 'Sent'
    update_payload['crc6f_progressstep'] = 'Mail Confirmation'
```

---

### 2. **Mail Reply Detection (Stage 3)**

**Current Implementation:**
- Manual dropdown to select candidate response (Yes/No/Pending)
- When "Yes" is selected, automatically advances to "Document Verification"
- "Check Email Reply" button is a placeholder for future email integration

**Future Enhancement:**
- Integrate with email service (IMAP/POP3) to automatically detect replies
- Parse email content for "Yes" confirmation
- Auto-update `Mail_Reply` field

---

### 3. **Complete Employee Master Transfer**

**What Happens When Onboarding is Completed:**

1. **Generate Employee ID:**
   - Format: `EMP{Year}{AutoIncrement}` (e.g., EMP2025103)
   - Queries existing employees to find next available number

2. **Create Employee Master Record:**
   - Transfers all data from onboarding to `crc6f_table12s`
   - Maps fields correctly using `get_field_map()`
   - Sets active status to "Active"
   - Calculates experience from DOJ
   - Sets quota hours to 9

3. **Create Login Credentials:**
   - Username: Employee email
   - Password: Auto-generated 8-character random password
   - Access Level: Determined by designation (L1/L2/L3)
   - User ID: Generated from employee ID and first name
   - Status: Active

4. **Create Leave Balance:**
   - Allocates CL and SL based on experience:
     - 0-1 years: 12 CL, 12 SL (Fresher)
     - 1-3 years: 15 CL, 15 SL (Junior)
     - 3-5 years: 18 CL, 18 SL (Mid-Level)
     - 5+ years: 21 CL, 21 SL (Senior)
   - Sets Comp Off to 0
   - Calculates total quota

5. **Send Login Credentials Email:**
   - Professional HTML email with:
     - Employee ID
     - Username (email)
     - Temporary password
     - Portal URL
     - Security instructions

6. **Update Onboarding Record:**
   - Sets `Document_Status` to "Verified"
   - Sets `Progress_Step` to "Completed"
   - Sets `Employee_ID` to generated ID
   - Sets `Converted_To_Master` to True
   - Locks the record (no further edits)

---

## 🔄 Complete Workflow

### Stage 1: Personal Information
```
User fills form → Click "Save & Continue"
↓
POST /api/onboarding
↓
Creates record in crc6f_hr_onboarding
↓
Sets Progress_Step = "Interview Scheduled"
↓
Returns success with record ID
```

### Stage 2: Interview Scheduled
```
User selects status "Passed" + date → Click "Update & Send Offer Letter"
↓
PUT /api/onboarding/{id}/interview
↓
Updates interview_status and interview_date
↓
Sends offer letter email via send_offer_letter_email()
↓
Sets Mail_Status = "Sent"
↓
Sets Progress_Step = "Mail Confirmation"
```

### Stage 3: Mail Confirmation
```
User selects "Yes" → Click "Update Reply"
↓
PUT /api/onboarding/{id}/mail-reply
↓
Updates mail_reply = "Yes"
↓
Sets Progress_Step = "Document Verification"
```

### Stage 4: Document Verification
```
User uploads documents → Click "Verify & Complete"
↓
PUT /api/onboarding/{id}/verify
↓
Generates Employee ID (EMP2025103)
↓
Creates Employee Master record in crc6f_table12s
↓
Creates Login record in login table
↓
Creates Leave Balance record
↓
Sends login credentials email
↓
Updates onboarding record:
  - Document_Status = "Verified"
  - Progress_Step = "Completed"
  - Employee_ID = "EMP2025103"
  - Converted_To_Master = True
```

### Stage 5: Completed
```
Displays success summary:
  - Employee ID
  - Full name
  - Email
  - Department & Designation
  - Date of Joining
  - Conversion status
```

---

## 📧 Email Templates

### Offer Letter Email
```html
Subject: 🎉 Congratulations on Your Offer from VTab Pvt. Ltd.!

Dear [First Name] [Last Name],

We are delighted to offer you the position of [Designation] 
in the [Department] department at VTab Pvt. Ltd.

Date of Joining: [DOJ]

Please reply to this email with "Yes" to confirm your acceptance.

Best Regards,
HR Team
VTab Pvt. Ltd.
```

### Login Credentials Email
```html
Subject: Welcome to VTab Pvt. Ltd. - Your Login Credentials

Dear [First Name] [Last Name],

Welcome to VTab Pvt. Ltd.! 🎉

Employee ID: [EMP2025103]
Username: [email@example.com]
Temporary Password: [aB3dE7fG]

Please login and change your password immediately.

Best Regards,
HR Team
VTab Pvt. Ltd.
```

---

## 🧪 Testing Checklist

### ✅ Stage 1 - Personal Information
- [ ] Fill all required fields
- [ ] Click "Save & Continue"
- [ ] Verify no 500 error
- [ ] Verify record created in Dataverse
- [ ] Verify progress advances to Stage 2

### ✅ Stage 2 - Interview Scheduled
- [ ] Set status to "Passed"
- [ ] Select interview date
- [ ] Click "Update & Send Offer Letter"
- [ ] Verify offer letter email received
- [ ] Verify progress advances to Stage 3

### ✅ Stage 3 - Mail Confirmation
- [ ] Select "Yes" response
- [ ] Click "Update Reply"
- [ ] Verify progress advances to Stage 4

### ✅ Stage 4 - Document Verification
- [ ] Click "Verify & Complete"
- [ ] Verify Employee ID generated
- [ ] Verify employee created in crc6f_table12s
- [ ] Verify login created in login table
- [ ] Verify leave balance created
- [ ] Verify login credentials email received
- [ ] Verify progress advances to Stage 5

### ✅ Stage 5 - Completed
- [ ] Verify all details displayed correctly
- [ ] Verify "View Employee Master" button works
- [ ] Verify record is locked (no edits allowed)

---

## 🔐 Security Notes

### Current Implementation:
- Passwords are hashed using `_hash_password()` function
- Login attempts tracked
- User status set to "Active"

### Production Recommendations:
1. **Password Hashing:**
   - Currently using basic hashing
   - Consider bcrypt or Argon2 for production
   
2. **Email Security:**
   - Use app-specific passwords for Gmail
   - Consider OAuth2 for production
   
3. **Access Control:**
   - Add L3 validation on backend routes
   - Implement JWT or session-based auth
   
4. **Data Validation:**
   - Add email format validation
   - Add phone number format validation
   - Prevent SQL injection in queries

---

## 📊 Database Changes

### Onboarding Table: `crc6f_hr_onboarding`
All fields implemented as per specification.

### Employee Table: `crc6f_table12s`
Records created with:
- Employee ID (auto-generated)
- Name (mapped correctly)
- Email, Contact, Address
- Department, Designation
- Date of Joining
- Experience (calculated)
- Quota Hours (set to 9)
- Active Flag (set to Active)

### Login Table
Records created with:
- Username (email)
- Password (hashed)
- Access Level (L1/L2/L3)
- User ID (generated)
- Employee Name
- User Status (Active)
- Login Attempts (0)

### Leave Balance Table
Records created with:
- Employee ID
- CL, SL (based on experience)
- Comp Off (0)
- Total Quota
- Actual Total
- Leave Allocation Type

---

## 🚀 Deployment Notes

1. **Restart Backend Server:**
   ```bash
   cd backend
   python unified_server.py
   ```

2. **Clear Browser Cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear localStorage if needed

3. **Verify Environment Variables:**
   - MAIL_SERVER
   - MAIL_USERNAME
   - MAIL_PASSWORD
   - MAIL_DEFAULT_SENDER

4. **Test Email Sending:**
   - Send test email first
   - Verify SMTP settings
   - Check spam folder

---

## 📝 Change Log

**Version 1.1.0 - January 2025**
- ✅ Fixed 500 error on create_record calls
- ✅ Implemented complete employee master transfer logic
- ✅ Added login credentials creation
- ✅ Added leave balance creation
- ✅ Added offer letter email on interview pass
- ✅ Added mail reply detection (manual)
- ✅ Ensured same logic as bulk upload

**Version 1.0.0 - January 2025**
- Initial onboarding module implementation

---

## 🆘 Support

If you encounter any issues:

1. **Check Backend Logs:**
   - Look for error messages in terminal
   - Check for Dataverse connection errors

2. **Check Browser Console:**
   - Look for API errors
   - Check network tab for failed requests

3. **Verify Dataverse:**
   - Ensure `crc6f_hr_onboarding` table exists
   - Ensure all fields are created
   - Check permissions

4. **Test Email:**
   - Send test email using `/api/test-email` endpoint
   - Verify SMTP credentials

---

**Status:** ✅ All fixes implemented and ready for testing
**Next Steps:** Test complete workflow end-to-end
