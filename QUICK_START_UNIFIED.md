# Quick Start Guide - Unified Backend

## 🚀 Single Backend Setup

Your entire application now runs on **ONE backend server** - no more juggling multiple servers!

## Start Your Application

### 1. Start the Unified Backend
```bash
cd backend
python unified_server.py
```

You'll see:
```
================================================================================
🚀 UNIFIED BACKEND SERVER STARTING
================================================================================
  ✅ Attendance Management (Check-in/Check-out)
  ✅ Leave Tracker (Apply Leave)
  ✅ Asset Management (CRUD Operations)
  ✅ Employee Master (CRUD & Bulk Upload)
  ✅ Holiday Management (CRUD Operations)
  ✅ Deleted Employees Management (CSV)
================================================================================
```

### 2. Start the Frontend
```bash
# In a new terminal (keep backend running)
npm run dev
```

### 3. Open Your Browser
```
http://localhost:5173
```

## 📍 All Available Endpoints (Port 5000)

| Service | Endpoint | Methods |
|---------|----------|---------|
| **Attendance** | `/api/checkin` | POST |
| | `/api/checkout` | POST |
| | `/api/attendance/<id>/<year>/<month>` | GET |
| **Leave** | `/api/apply-leave` | POST |
| | `/api/leaves/<employee_id>` | GET |
| | `/api/leaves/approve/<leave_id>` | POST |
| | `/api/leaves/reject/<leave_id>` | POST |
| | `/api/leave-balance/<id>/<type>` | GET |
| **Employees** | `/api/employees` | GET, POST |
| | `/api/employees/<id>` | PUT, DELETE |
| | `/api/employees/bulk` | POST |
| **Assets** | `/assets` | GET, POST |
| | `/assets/update/<id>` | PATCH |
| | `/assets/delete/<id>` | DELETE |
| **Holidays** | `/api/holidays` | GET, POST |
| | `/api/holidays/<id>` | PATCH, DELETE |
| **Utilities** | `/ping` | GET |
| | `/api/info` | GET |

## 🎯 Features Navigation

### For All Employees:
- **Home** - Dashboard overview
- **Employees** - View employee directory
- **Inbox** - Messages and notifications
- **Time Tracker** - Track work hours
- **Attendance Tracker** → 
  - My attendance - Your attendance calendar
  - **Holidays** - View holidays (submenu)
- **Leave Tracker** →
  - My leaves - Apply and view your leaves
  - My leave settings - Manage leave quotas
- **Projects** - View projects
- **Assets** - View assigned assets

### For Admins (EMP001 or bala.t@vtab.com):
All of the above PLUS:
- **Attendance Tracker** → My team attendance
- **Leave Tracker** → My team leaves
- **Holidays** - Full CRUD management

## 🔧 Environment Configuration

Make sure `backend/id.env` exists with:
```env
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
RESOURCE=https://your-org.crm.dynamics.com
```

## ✅ Verification

### Check Backend Health:
```bash
curl http://localhost:5000/ping
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Check Holiday Endpoint:
```bash
curl http://localhost:5000/api/holidays
```

Should return array of holidays.

## 🐛 Common Issues

### "Port 5000 already in use"
**Solution:** Kill the process and restart:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### "Module not found" errors
**Solution:** Install dependencies:
```bash
cd backend
pip install flask flask-cors requests python-dotenv msal
```

### "CORS error" in browser
**Solution:** Unified server already has CORS enabled. Make sure:
1. Backend is running
2. Using correct URLs (localhost:5000)
3. No firewall blocking requests

### Holidays not loading
**Solution:** 
1. Check backend console for holiday logs
2. Verify Dataverse table name: `crc6f_hr_holidayses`
3. Test endpoint directly: `curl http://localhost:5000/api/holidays`

## 📊 What Runs Where

```
Port 5000 (Backend)
  └── unified_server.py
        ├── Attendance Management
        ├── Leave Tracker
        ├── Employee Master
        ├── Asset Management
        ├── Holiday Management ← NEW
        └── Deleted Employees CSV

Port 5173 (Frontend)
  └── Vite Dev Server
        └── Your Vue/React/JS Application
```

## 🎉 That's It!

You now have a **single unified backend** serving all your application needs. No more multiple servers, port conflicts, or confusion!

---

For detailed migration info, see: `UNIFIED_BACKEND_MIGRATION.md`
