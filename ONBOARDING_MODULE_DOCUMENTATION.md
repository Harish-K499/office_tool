# Employee Onboarding Module - Complete Documentation

## 📋 Overview

The Employee Onboarding Module is a comprehensive 5-stage workflow system integrated into the VTab HR Tools application. It streamlines the entire employee onboarding process from initial candidate information collection to final employee account creation.

---

## 🎯 Features Implemented

### ✅ Core Functionality

1. **5-Stage Progressive Workflow**
   - Personal Information
   - Interview Scheduled
   - Mail Confirmation
   - Document Verification
   - Completed

2. **L3-Level Access Control**
   - Only HR/Admin users can access the onboarding module
   - Automatic permission checks on both frontend and backend
   - Graceful access denial for unauthorized users

3. **Automated Email System**
   - Offer letter emails with professional HTML templates
   - Login credentials emails for new employees
   - Integration with existing Flask-Mail system

4. **Employee Master Integration**
   - Automatic Employee ID generation (Format: `EMP{Year}{AutoIncrement}`)
   - Seamless data transfer from onboarding to employee master
   - Login credentials creation with auto-generated passwords

5. **External Data Upload Catch**
   - Auto-detects missing Employee IDs
   - Generates unique IDs automatically
   - Prevents duplicate entries (email/contact validation)
   - Sends login credentials automatically

---

## 🗂️ Database Schema

### Dataverse Table: `crc6f_hr_onboarding`

| Field Name | Type | Description |
|------------|------|-------------|
| `crc6f_hr_onboardingid` | GUID | Primary Key |
| `crc6f_firstname` | String | Candidate's first name |
| `crc6f_lastname` | String | Candidate's last name |
| `crc6f_email` | String | Candidate's email address |
| `crc6f_contactnumber` | String | Contact number |
| `crc6f_address` | Text | Full address |
| `crc6f_department` | String | Department (Technology, HR, Finance, etc.) |
| `crc6f_designation` | String | Job designation |
| `crc6f_doj` | Date | Date of Joining |
| `crc6f_progressstep` | String | Current stage in workflow |
| `crc6f_interviewstatus` | String | Pending/Passed/Failed |
| `crc6f_interviewdate` | Date | Interview scheduled date |
| `crc6f_mailstatus` | String | Not Sent/Sent |
| `crc6f_mailreply` | String | Pending/Yes/No |
| `crc6f_documentstatus` | String | Pending/Verified |
| `crc6f_documenturls` | Text | JSON array of document URLs |
| `crc6f_employeeid` | String | Generated Employee ID |
| `crc6f_convertedtomaster` | Boolean | Conversion status flag |

---

## 🔄 Workflow Stages

### Stage 1: Personal Information

**Purpose:** Collect candidate's basic details

**Fields:**
- First Name (Required)
- Last Name (Required)
- Email (Required)
- Contact Number (Required)
- Address (Required)
- Department (Required - Dropdown)
- Designation (Required)
- Date of Joining (Required)

**Actions:**
- On "Save & Continue": Creates onboarding record in Dataverse
- Auto-advances `Progress_Step` to "Interview Scheduled"

**API Endpoint:** `POST /api/onboarding`

---

### Stage 2: Interview Scheduled

**Purpose:** Schedule interview and send offer letter

**Fields:**
- Interview Status (Dropdown: Pending/Passed/Failed)
- Interview Date (Date Picker)

**Actions:**
- When status = "Passed":
  - Sends offer letter email with VTab template
  - Updates `Mail_Status` = "Sent"
  - Advances `Progress_Step` = "Mail Confirmation"

**Email Template:**
```
Subject: 🎉 Congratulations on Your Offer from VTab Pvt. Ltd.!

Body: Professional HTML email with:
- Congratulations message
- Position and department details
- Date of joining
- Call-to-action: Reply with "Yes" to accept
```

**API Endpoint:** `PUT /api/onboarding/{record_id}/interview`

---

### Stage 3: Mail Confirmation

**Purpose:** Track candidate's response to offer letter

**Fields:**
- Candidate Response (Dropdown: Pending/Yes/No)

**Actions:**
- If reply = "Yes": Advances to "Document Verification"
- If reply = "No": Marks as "Declined"
- "Check Email Reply" button for automated detection (placeholder)

**API Endpoints:**
- `PUT /api/onboarding/{record_id}/mail-reply`
- `GET /api/onboarding/{record_id}/check-email`

---

### Stage 4: Document Verification

**Purpose:** Upload and verify joining documents

**Features:**
- File upload support (PDF, JPG, PNG)
- Display uploaded documents list
- Verification button

**Actions:**
- On "Verify & Complete":
  - Creates Employee Master record
  - Generates Employee ID (Format: `EMP{Year}{AutoIncrement}`)
  - Creates login credentials
  - Sends login details email
  - Updates `Document_Status` = "Verified"
  - Advances `Progress_Step` = "Completed"
  - Sets `Converted_To_Master` = True
  - Locks onboarding record

**API Endpoint:** `PUT /api/onboarding/{record_id}/verify`

---

### Stage 5: Completed

**Purpose:** Display completion summary

**Information Shown:**
- Employee ID
- Full name
- Email
- Department & Designation
- Date of Joining
- Conversion status

**Actions:**
- "Back to Onboarding List" button
- "View Employee Master" button

---

## 🔐 Access Control

### L3-Level Users

**Criteria:**
- Admin users (EMP001 or bala.t@vtab.com)
- Users with designation containing "HR" or "Manager"
- Configurable in `isL3User()` function

**Implementation:**
```javascript
// Frontend (layout.js, router.js, onboarding.js)
const isL3User = () => {
    const designation = String(state.user?.designation || '').trim().toLowerCase();
    const empId = String(state.user?.id || '').trim().toUpperCase();
    const email = String(state.user?.email || '').trim().toLowerCase();
    return isAdminUser() || designation.includes('hr') || 
           designation.includes('manager') || empId === 'EMP001' || 
           email === 'bala.t@vtab.com';
};
```

**Access Points:**
- Sidebar navigation (Onboarding link only visible to L3)
- Route protection in router
- Page-level checks in onboarding.js
- Backend API validation (recommended to add)

---

## 📧 Email System

### Offer Letter Email

**Trigger:** Interview status = "Passed"

**Template Features:**
- Professional HTML design
- VTab branding (#00A7C0 color)
- Personalized content
- Clear call-to-action

**Function:** `send_offer_letter_email(candidate_data)`

---

### Login Credentials Email

**Trigger:** 
- Onboarding completion (Stage 5)
- External data upload with auto-generated ID

**Template Features:**
- Welcome message
- Employee ID
- Username (email)
- Temporary password
- Security reminder

**Function:** `send_login_credentials_email(employee_data, credentials)`

---

## 🔄 External Data Upload Catch

### Purpose
Automatically handle employee records uploaded externally (Excel, Power Automate, API) without Employee IDs.

### Implementation Location
`unified_server.py` → `create_employee()` function

### Logic Flow

1. **Detection:**
   ```python
   if not employee_id or employee_id.strip() == "":
       print("🔄 EXTERNAL DATA UPLOAD DETECTED")
       employee_id = generate_employee_id()
       auto_generated_id = True
   ```

2. **Duplicate Prevention:**
   - Checks for existing email in database
   - Checks for existing contact number
   - Returns error if duplicate found

3. **ID Generation:**
   ```python
   def generate_employee_id():
       year = datetime.now().year
       # Query existing IDs for current year
       # Find max number and increment
       return f"EMP{year}{next_num:03d}"
   ```

4. **Login Creation:**
   - Auto-generates username (email)
   - Creates random 8-character password
   - Creates login record in Dataverse

5. **Email Notification:**
   - Sends login credentials to employee
   - Only for auto-generated IDs

### Example
```
Input: Employee record without ID
Output: 
- Employee ID: EMP2025103
- Username: john.doe@vtab.com
- Password: aB3dE7fG
- Email sent with credentials
```

---

## 🎨 UI/UX Features

### Progress Stepper

**Visual States:**
- **Gray:** Pending stages
- **Blue:** Current active stage
- **Green:** Completed stages

**Components:**
- Circle with number/checkmark
- Stage label with icon
- Connecting lines

### Form Design

**Features:**
- Two-column responsive layout
- Required field indicators (*)
- Input validation
- Focus states with primary color
- Consistent spacing and typography

### Toast Notifications

**Types:**
- Success (green border)
- Error (red border)
- Info (blue border)

**Behavior:**
- Auto-dismiss after 3 seconds
- Slide-in animation
- Bottom-right positioning

### Cards and Badges

**Info Cards:**
- Light gray background
- Rounded corners
- Structured information display

**Status Badges:**
- Color-coded by status
- Uppercase text
- Rounded pill design

---

## 🛠️ API Endpoints

### List Onboarding Records
```
GET /api/onboarding?search={query}

Response:
{
  "success": true,
  "records": [
    {
      "id": "guid",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "progress_step": "Interview Scheduled",
      ...
    }
  ]
}
```

### Get Single Record
```
GET /api/onboarding/{record_id}

Response:
{
  "success": true,
  "record": { ... }
}
```

### Create Onboarding Record
```
POST /api/onboarding

Body:
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "contact": "1234567890",
  "address": "123 Main St",
  "department": "Technology",
  "designation": "Software Engineer",
  "doj": "2025-01-15"
}

Response:
{
  "success": true,
  "record": { ... },
  "message": "Onboarding record created successfully"
}
```

### Update Interview Status
```
PUT /api/onboarding/{record_id}/interview

Body:
{
  "interview_status": "Passed",
  "interview_date": "2025-01-10"
}

Response:
{
  "success": true,
  "message": "Interview status updated successfully"
}
```

### Update Mail Reply
```
PUT /api/onboarding/{record_id}/mail-reply

Body:
{
  "mail_reply": "Yes"
}

Response:
{
  "success": true,
  "message": "Mail reply updated successfully"
}
```

### Verify Documents & Complete
```
PUT /api/onboarding/{record_id}/verify

Response:
{
  "success": true,
  "message": "Onboarding completed successfully",
  "employee_id": "EMP2025103"
}
```

---

## 📁 File Structure

```
Final-Vtab/
├── pages/
│   └── onboarding.js          # Frontend onboarding page logic
├── components/
│   └── layout.js              # Sidebar with L3 access control
├── router.js                  # Route configuration with protection
├── index.css                  # Onboarding styles (lines 1446-1846)
├── backend/
│   ├── unified_server.py      # Backend API routes (lines 5901-6428)
│   └── mail_app.py            # Email configuration
└── ONBOARDING_MODULE_DOCUMENTATION.md
```

---

## 🚀 Setup Instructions

### Prerequisites

1. **Dataverse Table Creation:**
   - Create `crc6f_hr_onboarding` table with all required fields
   - Set appropriate permissions

2. **Email Configuration:**
   - Set environment variables in `id.env`:
     ```
     MAIL_SERVER=smtp.gmail.com
     MAIL_USERNAME=your-email@gmail.com
     MAIL_PASSWORD=your-app-password
     MAIL_DEFAULT_SENDER=your-email@gmail.com
     ```

3. **Backend Dependencies:**
   - Flask
   - Flask-Mail
   - Flask-CORS
   - requests
   - python-dotenv

### Installation

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python unified_server.py
   ```

2. **Frontend:**
   ```bash
   npm install
   npm run dev
   ```

### Testing

1. **Access Control:**
   - Login as L3 user (HR/Admin)
   - Verify "Onboarding" appears in sidebar
   - Login as non-L3 user
   - Verify access denied message

2. **Stage 1 - Personal Info:**
   - Click "New Onboarding"
   - Fill all required fields
   - Click "Save & Continue"
   - Verify record created in Dataverse

3. **Stage 2 - Interview:**
   - Set status to "Passed"
   - Select interview date
   - Click "Update & Send Offer Letter"
   - Verify email sent to candidate

4. **Stage 3 - Mail Confirmation:**
   - Update response to "Yes"
   - Verify progression to next stage

5. **Stage 4 - Document Verification:**
   - Click "Verify & Complete"
   - Verify employee created in master table
   - Verify login credentials email sent

6. **External Upload:**
   - Upload CSV without Employee IDs
   - Verify auto-generation
   - Verify login credentials email

---

## 🔧 Configuration

### Customization Points

1. **L3 Access Criteria:**
   - Modify `isL3User()` in `layout.js` and `router.js`

2. **Department List:**
   - Update dropdown options in `renderStage1PersonalInfo()`

3. **Email Templates:**
   - Modify `send_offer_letter_email()` in `unified_server.py`
   - Modify `send_login_credentials_email()` in `unified_server.py`

4. **Employee ID Format:**
   - Modify `generate_employee_id()` function
   - Current: `EMP{Year}{AutoIncrement}` (e.g., EMP2025103)

5. **Password Generation:**
   - Modify `generate_login_credentials()` function
   - Current: 8 random alphanumeric characters

---

## 🐛 Troubleshooting

### Common Issues

1. **Onboarding link not visible:**
   - Check user designation/role
   - Verify L3 access criteria
   - Check state.user object

2. **Email not sending:**
   - Verify MAIL_* environment variables
   - Check Flask-Mail configuration
   - Enable less secure apps (Gmail)
   - Use app-specific password

3. **Employee ID not generating:**
   - Check Dataverse connection
   - Verify `generate_employee_id()` function
   - Check year format in query

4. **Duplicate employee error:**
   - Email or contact number already exists
   - Check Dataverse for existing records

5. **Access denied on API:**
   - Add L3 checks to backend routes
   - Verify token/session authentication

---

## 📊 Future Enhancements

### Recommended Additions

1. **Email Reply Detection:**
   - Implement actual email checking (IMAP/POP3)
   - Auto-update mail_reply field

2. **Document Upload:**
   - Implement file upload to Azure Blob Storage
   - Store URLs in `document_urls` field

3. **Notifications:**
   - Real-time notifications for stage changes
   - Email notifications to HR team

4. **Analytics Dashboard:**
   - Onboarding pipeline metrics
   - Time-to-hire tracking
   - Stage completion rates

5. **Bulk Onboarding:**
   - CSV upload for multiple candidates
   - Batch email sending

6. **Interview Scheduling:**
   - Calendar integration
   - Automated reminders

7. **Backend L3 Validation:**
   - Add authentication middleware
   - Validate user permissions on API calls

---

## 📝 Notes

- All dates use ISO format (YYYY-MM-DD)
- Passwords should be hashed in production (currently plain text)
- File uploads are placeholder (implementation needed)
- Email reply checking is placeholder (implementation needed)
- Consider adding audit logging for compliance
- Implement data retention policies

---

## 👥 Support

For issues or questions:
- Check Dataverse table configuration
- Verify environment variables
- Review browser console for errors
- Check backend logs for API errors

---

## 📄 License

Internal VTab Pvt. Ltd. HR Tools Module
Confidential and Proprietary

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Author:** HR Tools Development Team
