# Timer Pause/Resume Behavior - Fixed ✅

## Summary
Fixed the timer pause/resume behavior in My Tasks to ensure:
1. Timer pauses at exact timestamp (no reset to 00:00:00)
2. Pause button converts to Play button
3. Play button resumes from paused time and continues
4. Page stays on My Tasks (no navigation to My Timesheet on pause)
5. Separate "Stop & Save" button for saving to Dataverse

---

## Problem Fixed

### Original Issues:
1. ❌ Clicking pause would stop and save to Dataverse immediately
2. ❌ Timer would reset to 00:00:00 after pause
3. ❌ Page would navigate to My Timesheet on pause
4. ❌ No way to pause without saving

---

## Solution Implemented

### ✅ NEW BEHAVIOR: Two-Button System

#### **Button 1: Play/Pause Toggle** (Left)
- **When stopped:** Shows Play icon (▶️)
- **When running:** Shows Pause icon (⏸️)
- **When paused:** Shows Play icon (▶️)

#### **Button 2: Stop & Save** (Right, only visible when timer active)
- Shows save/floppy disk icon (💾)
- Only appears when timer is running or paused
- Saves to Dataverse and navigates to My Timesheet

---

## Implementation Details

### 1. Renamed Function (Lines 352-393)

**OLD:** `stopLocalTimer(t)` - Would save and navigate
**NEW:** `stopAndSaveTimer(t)` - Explicitly for saving

```javascript
const stopAndSaveTimer = async (t)=>{
    const cur = getActive();
    if (!cur || cur.task_guid !== t.guid) return;
    
    // Calculate total seconds (accumulated + current session if running)
    let totalSeconds = cur.accumulated || 0;
    if (!cur.paused && cur.started_at) {
        totalSeconds += Math.floor((Date.now() - Number(cur.started_at))/1000);
    }
    totalSeconds = Math.max(1, totalSeconds);
    
    // post timesheet log
    const body = {
        employee_id: empId,
        project_id: t.project_id,
        task_guid: t.guid,
        task_id: t.task_id,
        task_name: t.task_name,
        seconds: totalSeconds,
        work_date: new Date().toISOString().slice(0,10),
        description: ''
    };
    
    try {
        const res = await fetch(`${API}/time-tracker/task-log`, {
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify(body)
        });
        const result = await res.json().catch(()=>({success:false}));
        
        if (res.ok && result.success) {
            clearActive();
            try { sessionStorage.setItem('tt_last_log', JSON.stringify(body)); } catch {}
            window.location.hash = '#/time-my-timesheet';  // ✅ Only navigates here
        } else {
            alert(`Failed to save timesheet: ${result.error || 'Unknown error'}`);
        }
    } catch (err) {
        alert('Failed to save timesheet. Please try again.');
    }
};
```

### 2. Toggle Button Behavior (Lines 503-512)

**ONLY toggles between Play/Pause - NEVER saves**

```javascript
document.querySelectorAll('tr[data-guid] .action-btn.toggle-timer').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
        const tr = e.currentTarget.closest('tr');
        const guid = tr?.getAttribute('data-guid');
        const t = tasks.find(x=>x.guid===guid);
        if (!t) return;
        // Always toggle (start/pause/resume) - never stop
        toggleTimer(t);  // ✅ No navigation, stays on My Tasks
    });
});
```

### 3. Save Button Behavior (Lines 514-521)

**NEW: Separate button for saving**

```javascript
document.querySelectorAll('tr[data-guid] .action-btn.save-timer').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
        const tr = e.currentTarget.closest('tr');
        const guid = tr?.getAttribute('data-guid');
        const t = tasks.find(x=>x.guid===guid);
        if (t) await stopAndSaveTimer(t);  // ✅ Saves and navigates to My Timesheet
    });
});
```

### 4. UI Changes (Lines 437-440)

**Two buttons displayed:**

```javascript
return `
<tr data-guid="${t.guid}">
  <td class="actions-cell" style="width:90px; text-align:left;">
    <button class="action-btn toggle-timer" title="${toggleTitle}">
      <i class="fa-solid ${toggleIcon}"></i>
    </button>
    ${(isRunning || isPaused) ? 
      `<button class="action-btn save-timer" title="Stop & Save" style="margin-left:4px;">
        <i class="fa-solid fa-floppy-disk"></i>
      </button>` : ''}
  </td>
```

**Result:**
- Play/Pause button always visible
- Save button only visible when timer is active (running or paused)
- Column width increased to 90px to fit both buttons

---

## Complete User Flow

### Scenario 1: Start → Pause → Resume → Save

**Step 1: Start Timer**
```
User clicks: Play button (▶️)
Timer starts: 00:00:00 → 00:00:01 → 00:00:02 → ...
Button changes to: Pause (⏸️)
Save button appears: 💾
Page: Stays on My Tasks ✅
```

**Step 2: Pause at 00:00:30**
```
User clicks: Pause button (⏸️) at 00:00:30
Timer pauses: 00:00:30 (frozen) ✅
Accumulated: 30 seconds saved to localStorage
Button changes to: Play (▶️)
Save button: Still visible 💾
Page: Stays on My Tasks ✅
```

**Step 3: Resume Timer**
```
User clicks: Play button (▶️)
Timer resumes: 00:00:30 → 00:00:31 → 00:00:32 → ... ✅
Button changes to: Pause (⏸️)
Save button: Still visible 💾
Page: Stays on My Tasks ✅
```

**Step 4: Pause Again at 00:01:15**
```
User clicks: Pause button (⏸️) at 00:01:15
Timer pauses: 00:01:15 (frozen) ✅
Accumulated: 75 seconds (30 + 45) saved to localStorage
Button changes to: Play (▶️)
Save button: Still visible 💾
Page: Stays on My Tasks ✅
```

**Step 5: Save to Dataverse**
```
User clicks: Save button (💾)
Total time: 00:01:15 (75 seconds)
Action: POST to /api/time-tracker/task-log
Dataverse: Record created with 75 seconds
Timer cleared: localStorage cleared
Page: Navigates to My Timesheet ✅
```

---

## Scenario 2: Multiple Pause/Resume Cycles

### Example: Task003

**Cycle 1:**
```
Play → 00:00:00
Running → 00:00:15
Pause → 00:00:15 ✅ (accumulated: 15s)
Page: My Tasks ✅
```

**Cycle 2:**
```
Play → 00:00:15 ✅ (resumes from 15s)
Running → 00:00:45
Pause → 00:00:45 ✅ (accumulated: 45s)
Page: My Tasks ✅
```

**Cycle 3:**
```
Play → 00:00:45 ✅ (resumes from 45s)
Running → 00:01:30
Pause → 00:01:30 ✅ (accumulated: 90s)
Page: My Tasks ✅
```

**Save:**
```
Save → 00:01:30 (90 seconds total)
Dataverse: Record created
Page: My Timesheet ✅
```

---

## Key Features

### ✅ Timer Persistence
- **Accumulated time** stored in localStorage
- **Survives page refresh** (timer state restored)
- **Never resets** unless explicitly saved or cleared

### ✅ Visual Feedback
- **Running:** Red timer (🔴 00:00:30)
- **Paused:** Orange timer (🟠 00:00:30)
- **Stopped:** Dash (-)

### ✅ Button States
| Timer State | Toggle Button | Save Button | Time Display |
|-------------|---------------|-------------|--------------|
| Stopped | ▶️ Play | Hidden | - |
| Running | ⏸️ Pause | 💾 Visible | 🔴 00:00:30 |
| Paused | ▶️ Play | 💾 Visible | 🟠 00:00:30 |

### ✅ Navigation Rules
| Action | Navigation |
|--------|------------|
| Click Play | Stay on My Tasks ✅ |
| Click Pause | Stay on My Tasks ✅ |
| Click Save | Go to My Timesheet ✅ |

---

## localStorage Structure

### Active Timer State:
```javascript
{
    "task_guid": "abc-123-def-456",
    "task_id": "TASK-003",
    "task_name": "Implement feature X",
    "project_id": "PROJ-001",
    "started_at": 1731577200000,  // Timestamp when started/resumed
    "accumulated": 30,              // Total seconds from previous sessions
    "paused": false                 // true = paused, false = running
}
```

### Example Flow:

**Start:**
```json
{
    "task_guid": "abc-123",
    "started_at": 1731577200000,
    "accumulated": 0,
    "paused": false
}
```

**Pause at 30 seconds:**
```json
{
    "task_guid": "abc-123",
    "started_at": null,
    "accumulated": 30,
    "paused": true
}
```

**Resume:**
```json
{
    "task_guid": "abc-123",
    "started_at": 1731577230000,
    "accumulated": 30,
    "paused": false
}
```

**Pause at 75 seconds:**
```json
{
    "task_guid": "abc-123",
    "started_at": null,
    "accumulated": 75,
    "paused": true
}
```

---

## Testing Checklist

### Basic Pause/Resume:
- [ ] Click Play → timer starts from 00:00:00
- [ ] Timer runs: 00:00:01, 00:00:02, 00:00:03...
- [ ] Click Pause at 00:00:30 → timer freezes at 00:00:30 ✅
- [ ] Button changes to Play ✅
- [ ] Page stays on My Tasks ✅
- [ ] Click Play → timer resumes from 00:00:30 ✅
- [ ] Timer continues: 00:00:31, 00:00:32...
- [ ] No reset to 00:00:00 ✅

### Multiple Cycles:
- [ ] Pause at 00:00:15 → accumulated: 15s
- [ ] Resume → continues from 00:00:15
- [ ] Pause at 00:00:45 → accumulated: 45s
- [ ] Resume → continues from 00:00:45
- [ ] Pause at 00:01:30 → accumulated: 90s
- [ ] All cycles stay on My Tasks ✅

### Save Functionality:
- [ ] Save button only visible when timer active
- [ ] Click Save → navigates to My Timesheet ✅
- [ ] Dataverse record created with correct seconds
- [ ] Timer cleared from localStorage
- [ ] My Timesheet shows correct time in correct date column

### Edge Cases:
- [ ] Refresh page while running → timer state restored
- [ ] Refresh page while paused → timer shows paused time
- [ ] Start different task → alert shown (one task at a time)
- [ ] Close browser → timer state persists (localStorage)

---

## Summary of Changes

### Files Modified: **1**
- `pages/shared.js`

### Functions Changed: **3**
1. **Renamed:** `stopLocalTimer()` → `stopAndSaveTimer()`
   - Only called by Save button
   - Saves to Dataverse and navigates

2. **Updated:** Toggle button event handler
   - Only calls `toggleTimer()`
   - Never saves or navigates

3. **Added:** Save button event handler
   - Calls `stopAndSaveTimer()`
   - Saves and navigates to My Timesheet

### UI Changes:
- Column width: 50px → 90px (to fit both buttons)
- Added Save button (floppy disk icon)
- Save button only visible when timer active

---

## Result

✅ **Perfect pause/resume behavior:**
- Timer pauses at exact timestamp (e.g., 00:00:30)
- Pause button converts to Play button
- Play button resumes from paused time (00:00:30 → 00:00:31)
- **NO RESET to 00:00:00**
- Page stays on My Tasks during pause/resume
- Separate Save button for saving to Dataverse
- Only navigates to My Timesheet when explicitly saving

**Ready for testing!** 🎉
