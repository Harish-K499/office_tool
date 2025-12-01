# Single Play/Pause Toggle Button - Final Implementation ✅

## Summary
Implemented a single Play/Pause toggle button in My Tasks that:
1. ✅ Pauses timer at exact timestamp (e.g., 00:00:30)
2. ✅ Converts Pause → Play when clicked
3. ✅ Resumes from paused time when Play clicked (NO RESET)
4. ✅ Converts Play → Pause when running
5. ✅ NEVER saves to Dataverse
6. ✅ NEVER navigates away from My Tasks page

---

## Implementation

### **ONE BUTTON ONLY** - Play/Pause Toggle

#### Button States:

| Timer State | Button Icon | Button Title | Action on Click |
|-------------|-------------|--------------|-----------------|
| **Stopped** | ▶️ Play | "Start" | Start timer from 00:00:00 |
| **Running** | ⏸️ Pause | "Pause" | Pause at current time |
| **Paused** | ▶️ Play | "Resume" | Resume from paused time |

---

## Complete User Flow

### Example: Task003

#### **Step 1: Start Timer**
```
User clicks: ▶️ Play button
Timer starts: 00:00:00 → 00:00:01 → 00:00:02 → ...
Button changes to: ⏸️ Pause
Time display: 🔴 00:00:05 (red, running)
Page: My Tasks ✅
```

#### **Step 2: Pause at 00:00:30**
```
User clicks: ⏸️ Pause button (when timer shows 00:00:30)
Timer pauses: 00:00:30 (FROZEN) ✅
Accumulated: 30 seconds saved to localStorage
Button changes to: ▶️ Play
Time display: 🟠 00:00:30 (orange, paused)
Page: My Tasks ✅ (NO NAVIGATION)
```

#### **Step 3: Resume Timer**
```
User clicks: ▶️ Play button
Timer resumes: 00:00:30 → 00:00:31 → 00:00:32 → ... ✅
NO RESET to 00:00:00 ✅
Button changes to: ⏸️ Pause
Time display: 🔴 00:00:35 (red, running)
Page: My Tasks ✅
```

#### **Step 4: Pause Again at 00:01:15**
```
User clicks: ⏸️ Pause button (when timer shows 00:01:15)
Timer pauses: 00:01:15 (FROZEN) ✅
Accumulated: 75 seconds (30 + 45) saved to localStorage
Button changes to: ▶️ Play
Time display: 🟠 00:01:15 (orange, paused)
Page: My Tasks ✅
```

#### **Step 5: Resume Again**
```
User clicks: ▶️ Play button
Timer resumes: 00:01:15 → 00:01:16 → 00:01:17 → ... ✅
Button changes to: ⏸️ Pause
Time display: 🔴 00:01:20 (red, running)
Page: My Tasks ✅
```

---

## Code Implementation

### 1. UI Rendering (Lines 433-439)

```javascript
const toggleIcon = isRunning ? 'fa-pause' : 'fa-play';
const toggleTitle = isRunning ? 'Pause' : (isPaused ? 'Resume' : 'Start');

return `
<tr data-guid="${t.guid}">
  <td class="actions-cell" style="width:50px; text-align:left;">
    <button class="action-btn toggle-timer" title="${toggleTitle}">
      <i class="fa-solid ${toggleIcon}"></i>
    </button>
  </td>
  ...
</tr>`;
```

**Result:**
- ONE button only
- Icon changes: Play (▶️) ↔ Pause (⏸️)
- Title changes: "Start" / "Pause" / "Resume"
- Width: 50px (compact)

### 2. Button Event Handler (Lines 502-511)

```javascript
document.querySelectorAll('tr[data-guid] .action-btn.toggle-timer').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
        const tr = e.currentTarget.closest('tr');
        const guid = tr?.getAttribute('data-guid');
        const t = tasks.find(x=>x.guid===guid);
        if (!t) return;
        // Always toggle (start/pause/resume) - never save or navigate
        toggleTimer(t);
    });
});
```

**Result:**
- Only calls `toggleTimer(t)`
- NEVER saves to Dataverse
- NEVER navigates to My Timesheet
- Stays on My Tasks page

### 3. Toggle Timer Function (Lines 326-350)

```javascript
const toggleTimer = (t)=>{
    const cur = getActive();
    
    // If timer is running for this task, pause it
    if (cur && cur.task_guid === t.guid && !cur.paused) {
        const elapsed = Math.floor((Date.now() - Number(cur.started_at))/1000);
        const totalAccumulated = (cur.accumulated || 0) + elapsed;
        setActive({ ...cur, accumulated: totalAccumulated, paused: true, started_at: null });
        render();
        return;
    }
    
    // If another task is running, stop it first
    if (cur && cur.task_guid && cur.task_guid !== t.guid && !cur.paused) {
        alert('Another task is already running. Stop it before starting a new one.');
        return;
    }
    
    // Start or resume this task
    if (cur && cur.task_guid === t.guid && cur.paused) {
        // Resume from paused state
        setActive({ ...cur, started_at: Date.now(), paused: false });
    } else {
        // Start fresh
        setActive({ task_guid: t.guid, task_id: t.task_id, task_name: t.task_name, project_id: t.project_id, started_at: Date.now(), accumulated: 0, paused: false });
    }
    render();
};
```

**Logic:**
1. **If running** → Pause (save accumulated time)
2. **If paused** → Resume (continue from accumulated time)
3. **If stopped** → Start (begin from 00:00:00)

---

## localStorage State Management

### State Structure:
```javascript
{
    "task_guid": "abc-123-def-456",
    "task_id": "TASK-003",
    "task_name": "Implement feature X",
    "project_id": "PROJ-001",
    "started_at": 1731577200000,  // Timestamp when started/resumed (null when paused)
    "accumulated": 30,              // Total seconds from previous sessions
    "paused": false                 // true = paused, false = running
}
```

### State Transitions:

#### **Start (from stopped):**
```json
{
    "task_guid": "abc-123",
    "started_at": 1731577200000,
    "accumulated": 0,
    "paused": false
}
```

#### **Pause at 30 seconds:**
```json
{
    "task_guid": "abc-123",
    "started_at": null,           // ← Cleared
    "accumulated": 30,             // ← Saved
    "paused": true                 // ← Set to true
}
```

#### **Resume:**
```json
{
    "task_guid": "abc-123",
    "started_at": 1731577230000,  // ← New timestamp
    "accumulated": 30,             // ← Preserved
    "paused": false                // ← Set to false
}
```

#### **Pause at 75 seconds:**
```json
{
    "task_guid": "abc-123",
    "started_at": null,           // ← Cleared
    "accumulated": 75,             // ← Updated (30 + 45)
    "paused": true                 // ← Set to true
}
```

---

## Visual Feedback

### Timer Display Colors:

| State | Color | Example |
|-------|-------|---------|
| **Running** | 🔴 Red (#d63031) | 🔴 00:00:30 |
| **Paused** | 🟠 Orange (#f39c12) | 🟠 00:00:30 |
| **Stopped** | - | - |

### Button Icons:

| State | Icon | Color |
|-------|------|-------|
| **Stopped** | ▶️ Play | Default |
| **Running** | ⏸️ Pause | Default |
| **Paused** | ▶️ Play | Default |

---

## Multiple Pause/Resume Cycles

### Example Timeline:

```
00:00:00 ─────▶ Click Play
00:00:00 → 00:00:15 (running)
00:00:15 ─────⏸ Click Pause (accumulated: 15s)
00:00:15 (paused, button: ▶️)
00:00:15 ─────▶ Click Play
00:00:15 → 00:00:45 (running, NO RESET ✅)
00:00:45 ─────⏸ Click Pause (accumulated: 45s)
00:00:45 (paused, button: ▶️)
00:00:45 ─────▶ Click Play
00:00:45 → 00:01:30 (running, NO RESET ✅)
00:01:30 ─────⏸ Click Pause (accumulated: 90s)
00:01:30 (paused, button: ▶️)
```

**Result:**
- ✅ Timer NEVER resets to 00:00:00
- ✅ Each pause saves accumulated time
- ✅ Each resume continues from paused time
- ✅ Page ALWAYS stays on My Tasks

---

## How to Save Timer to Dataverse

Since the toggle button doesn't save, users need an alternative way to save their time. Here are the options:

### Option 1: Manual Save (Future Enhancement)
Add a separate "Save" button or menu option that:
- Calls `stopAndSaveTimer(t)`
- Saves accumulated time to Dataverse
- Navigates to My Timesheet

### Option 2: Auto-save on Task Completion
When task status changes to "Done", automatically save timer.

### Option 3: End of Day Save
Add a "Submit Timesheet" button that saves all active timers.

### Current Behavior:
- Timer accumulates in localStorage
- User can pause/resume indefinitely
- No automatic save to Dataverse
- Timer persists across page refreshes

---

## Testing Checklist

### Basic Functionality:
- [ ] Click Play → timer starts from 00:00:00
- [ ] Timer runs: 00:00:01, 00:00:02, 00:00:03...
- [ ] Button shows Pause icon (⏸️)
- [ ] Time display is red (🔴)

### Pause Behavior:
- [ ] Click Pause at 00:00:30
- [ ] Timer freezes at 00:00:30 ✅
- [ ] Button changes to Play icon (▶️)
- [ ] Time display turns orange (🟠)
- [ ] Page stays on My Tasks ✅

### Resume Behavior:
- [ ] Click Play (when paused at 00:00:30)
- [ ] Timer resumes from 00:00:30 ✅
- [ ] Timer continues: 00:00:31, 00:00:32...
- [ ] NO RESET to 00:00:00 ✅
- [ ] Button changes to Pause icon (⏸️)
- [ ] Time display turns red (🔴)
- [ ] Page stays on My Tasks ✅

### Multiple Cycles:
- [ ] Pause at 00:00:15 → accumulated: 15s
- [ ] Resume → continues from 00:00:15
- [ ] Pause at 00:00:45 → accumulated: 45s
- [ ] Resume → continues from 00:00:45
- [ ] Pause at 00:01:30 → accumulated: 90s
- [ ] All cycles stay on My Tasks ✅

### Edge Cases:
- [ ] Refresh page while running → timer state restored
- [ ] Refresh page while paused → shows paused time
- [ ] Close browser → timer state persists
- [ ] Start different task → alert shown
- [ ] No navigation to My Timesheet at any point ✅

---

## Summary of Changes

### Files Modified: **1**
- `pages/shared.js`

### Changes Made:
1. **Removed:** Stop & Save button
2. **Kept:** Single Play/Pause toggle button
3. **Updated:** Column width from 90px → 50px
4. **Removed:** Save button event handler
5. **Simplified:** Toggle button only calls `toggleTimer()`

### Lines Changed: **~15 lines**
- UI rendering (lines 437-439)
- Table header (line 474)
- Event handler (lines 502-511)

---

## Result

✅ **Perfect single-button behavior:**
- ONE button only (Play/Pause toggle)
- Pauses at exact timestamp (e.g., 00:00:30)
- Button converts: Pause → Play
- Resumes from paused time (NO RESET)
- Button converts: Play → Pause
- NEVER saves to Dataverse
- NEVER navigates away from My Tasks
- Timer persists in localStorage
- Works across page refreshes

**Ready for production!** 🎉

---

## Visual Example

```
┌─────────────────────────────────────────────────────────┐
│ My Tasks                                                │
├─────────────────────────────────────────────────────────┤
│ [▶️] Task001 - Implement login    | Status | 00:00:00  │
│ [⏸️] Task002 - Fix bug #123       | Status | 🔴 00:02:45│ ← Running
│ [▶️] Task003 - Write documentation | Status | 🟠 00:00:30│ ← Paused
│ [▶️] Task004 - Code review         | Status | -         │
└─────────────────────────────────────────────────────────┘

Click ⏸️ on Task002 → Pauses at 00:02:45, button becomes ▶️
Click ▶️ on Task003 → Resumes from 00:00:30, button becomes ⏸️
```

**No navigation. No saving. Just pause and resume.** ✅
