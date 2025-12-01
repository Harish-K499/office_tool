# Notification System Setup Guide

## Overview
The notification system sends alerts when:
1. **Employee applies for leave** → Admin (EMP001) receives notification
2. **Admin approves leave** → Employee receives notification
3. **Admin rejects leave** → Employee receives notification with reason

## Dataverse Table Setup

### Create Notifications Table

**Table Name:** `Notifications`  
**Logical Name:** `crc6f_notifications`  
**Collection Name (API):** `crc6f_notificationses`

### Required Columns

| Display Name | Logical Name | Data Type | Description |
|-------------|--------------|-----------|-------------|
| **Notification ID** | `crc6f_notificationid` | Text (Single line) | Unique ID (e.g., NOT-ABC1234) |
| **Recipient ID** | `crc6f_recipientid` | Text (Single line) | Employee ID who receives notification |
| **Type** | `crc6f_type` | Text (Single line) | Notification type (leave_application, leave_approved, leave_rejected) |
| **Message** | `crc6f_message` | Text (Multiple lines) | Notification message content |
| **Related ID** | `crc6f_relatedid` | Text (Single line) | Related leave ID (optional) |
| **Is Read** | `crc6f_isread` | Yes/No (Boolean) | Whether notification has been read |
| **Created At** | `crc6f_createdat` | Date and Time | When notification was created |

### Primary Key
The table will have an auto-generated primary key: `crc6f_notificationsid` (GUID)

## Steps to Create in Dataverse

1. **Navigate to Power Apps** (https://make.powerapps.com)
2. **Select your environment**
3. **Go to Tables** → **New table**
4. **Create table:**
   - Display name: `Notifications`
   - Plural name: `Notifications`
   - Schema name: `crc6f_notifications`
5. **Add the columns** listed above with exact logical names
6. **Save and publish** all customizations

## Backend Configuration

The backend is already configured with:
- Entity name: `crc6f_notificationses`
- All API endpoints for creating, reading, and marking notifications as read

## Frontend Integration

The frontend is already integrated with:
- Notification badge in header (bell icon)
- Auto-updates badge count on page load and after actions
- Sends notifications automatically when:
  - Leave is applied
  - Leave is approved
  - Leave is rejected

## Testing the System

### 1. Create the Dataverse Table
Follow the steps above to create the notifications table.

### 2. Restart Backend
```bash
cd backend
python unified_server.py
```

### 3. Test Leave Application Flow
1. **Employee** (not EMP001) applies for leave
2. Check backend logs - should see: `📬 Creating notification for EMP001`
3. **Admin** (EMP001) logs in
4. Bell icon should show notification count
5. Admin approves/rejects leave
6. **Employee** logs in again
7. Bell icon should show notification about approval/rejection

## API Endpoints

### Create Notification
```
POST /api/notifications
Body: {
  "recipient_id": "EMP001",
  "type": "leave_application",
  "message": "New leave request from EMP005",
  "related_id": "LVE-ABC1234"
}
```

### Get Notifications
```
GET /api/notifications/{employee_id}
GET /api/notifications/{employee_id}?unread=true
```

### Mark as Read
```
PATCH /api/notifications/{notification_id}/read
```

### Mark All as Read
```
PATCH /api/notifications/{employee_id}/read-all
```

## Notification Types

| Type | Trigger | Recipient | Message Format |
|------|---------|-----------|----------------|
| `leave_application` | Employee applies leave | Admin (EMP001) | "New leave request from {emp_id}: {type} ({dates})" |
| `leave_approved` | Admin approves leave | Employee | "Your {type} request has been approved" |
| `leave_rejected` | Admin rejects leave | Employee | "Your {type} request has been rejected. Reason: {reason}" |

## UI Components

### Notification Badge
- Location: Header (bell icon)
- Shows count of unread notifications
- Updates automatically after actions
- Hidden when count is 0

### Future Enhancement (Optional)
You can add a notification dropdown panel by clicking the bell icon to show:
- List of recent notifications
- Mark as read functionality
- Click to navigate to related item

## Troubleshooting

### Badge not updating
- Check browser console for errors
- Verify employee ID is set in `state.user`
- Check backend logs for notification creation

### Notifications not created
- Verify Dataverse table exists with correct schema names
- Check backend logs for errors
- Ensure all column logical names match exactly

### 400 Error from Dataverse
- Double-check all column logical names
- Ensure `crc6f_` prefix is used consistently
- Verify table collection name is `crc6f_notificationses`

## Summary

✅ **Backend:** Fully implemented with all API routes  
✅ **Frontend:** Integrated with leave application and approval flows  
⏳ **Dataverse:** Needs table creation (follow steps above)  
✅ **Notification Badge:** Implemented and auto-updating

Once you create the Dataverse table, the entire notification system will work automatically!
