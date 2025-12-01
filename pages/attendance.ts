
import { state } from '../state.js';
import { AttendanceDayData } from '../types.js';

const renderAttendanceTrackerPage = (mode: 'my' | 'team') => {
    const date = state.currentAttendanceDate;
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getStatusCellHTML = (dayData: AttendanceDayData | undefined) => {
        if (!dayData) return '';
        const { status, isLate, isManual, isPending, half, EOP } = dayData;
        
        let content = status;
        if (status === 'HL') {
            content = `<div class="status-hl-text">HL</div><div class="status-hl-half">${half} ${EOP ? '(EOP)' : ''}</div>`;
        } else if (EOP) {
            content = `${status} (EOP)`;
        }

        return `
            <div class="status-cell status-${status.toLowerCase()}">
                ${content}
                ${isLate ? '<i class="fa-solid fa-clock-rotate-left late-icon" title="Late entry"></i>' : ''}
                ${isManual ? '<i class="fa-solid fa-hand manual-icon" title="Manual entry"></i>' : ''}
                ${isPending ? '<i class="fa-solid fa-triangle-exclamation pending-icon" title="Pending"></i>' : ''}
            </div>
        `;
    }

    const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
    
    const getTeamViewHTML = () => {
        const daysHeader = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayName = new Date(year, date.getMonth(), day).toLocaleString('default', { weekday: 'short' });
            return `<th>${dayName}<br>${String(day).padStart(2, '0')}</th>`;
        }).join('');
        
        const employeeRows = state.employees.filter(e => e.status === 'Active').map(emp => {
            const empAttendance = state.attendanceData[emp.id] || {};
            const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
                const dayData = empAttendance[i + 1];
                return `<td>${getStatusCellHTML(dayData)}</td>`;
            }).join('');

            return `
                <tr>
                    <td class="employee-name-cell">
                        <div class="employee-id-badge">${emp.id.slice(-3)}</div>
                        <div class="employee-details">
                            <span class="employee-name">${emp.name}</span>
                            <span class="employee-id">${emp.id}</span>
                        </div>
                    </td>
                    ${dayCells}
                </tr>
            `;
        }).join('');

        return `
            <div class="table-container">
                <table class="team-attendance-table">
                    <thead>
                        <tr>
                            <th class="employee-name-cell-header">Employee Name</th>
                            ${daysHeader}
                        </tr>
                    </thead>
                    <tbody>${employeeRows || `<tr><td colspan="${daysInMonth + 1}" class="placeholder-text">No active employees to display.</td></tr>`}</tbody>
                </table>
            </div>
            <div class="attendance-legend">
                <div class="legend-item"><i class="fa-solid fa-clock-rotate-left late-icon"></i> Late entry</div>
                <div class="legend-item"><i class="fa-solid fa-hand manual-icon"></i> Manual entry</div>
                <div class="legend-item"><i class="fa-solid fa-triangle-exclamation pending-icon"></i> Pending</div>
            </div>
        `;
    };

    const getMyViewHTML = () => {
        const myAttendance = state.attendanceData[state.user.id] || {};
        const month = date.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
    
        const calendarCells = [];
        
        for (let i = 0; i < firstDayIndex; i++) {
            calendarCells.push('<div class="calendar-day empty"></div>');
        }
    
        for(let i = 1; i <= daysInMonth; i++) {
            const dayData = myAttendance[i];
            const isSelected = i === state.selectedAttendanceDay;
            const statusHTML = getStatusCellHTML(dayData);
    
            calendarCells.push(`
                <div class="calendar-day ${isSelected ? 'selected' : ''}" data-day="${i}">
                    <div class="day-header">${i}</div>
                    <div class="day-content">${statusHTML ? statusHTML.replace('status-cell', '') : '&nbsp;'}</div>
                </div>
            `);
        }
    
        const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        // Get filtered attendance data based on current filter
        const currentFilter = state.attendanceFilter || 'week';
        let filteredAttendanceData: AttendanceDayData[] = [];
        
        if (currentFilter === 'week') {
            // Get current week data
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            filteredAttendanceData = Object.values(myAttendance)
                .filter(d => d && d.checkIn && d.checkOut)
                .filter(d => {
                    const dayDate = new Date(year, month, d.day);
                    return dayDate >= startOfWeek && dayDate <= endOfWeek;
                });
        } else if (currentFilter === 'month') {
            // Get current month data
            filteredAttendanceData = Object.values(myAttendance)
                .filter(d => d && d.checkIn && d.checkOut);
        } else if (currentFilter === 'year') {
            // Get current year data - for now, show current month
            filteredAttendanceData = Object.values(myAttendance)
                .filter(d => d && d.checkIn && d.checkOut);
        }
        
        // Calculate total login time for filtered data
        let totalLoginTime = 0;
        let entryExitDetailsHTML = '';
        
        if (filteredAttendanceData.length > 0) {
            filteredAttendanceData.forEach(d => {
                const dayStr = String(d.day || 1).padStart(2, '0');
                const start = new Date(`${yearMonth}-${dayStr}T${d.checkIn}`);
                const end = new Date(`${yearMonth}-${dayStr}T${d.checkOut}`);
                const dayMs = end.getTime() - start.getTime();
                if (!isNaN(dayMs)) {
                    totalLoginTime += dayMs;
                }
            });
            
            const totalHours = Math.floor(totalLoginTime / 3600000);
            const totalMins = Math.floor((totalLoginTime % 3600000) / 60000);
            
            entryExitDetailsHTML = `
                <tr><td>Total Login Time</td><td>${totalHours}h ${totalMins}m</td></tr>
                <tr><td>Days Worked</td><td>${filteredAttendanceData.length} days</td></tr>
                <tr><td>Average per Day</td><td>${filteredAttendanceData.length > 0 ? Math.floor(totalLoginTime / filteredAttendanceData.length / 3600000) + 'h ' + Math.floor((totalLoginTime / filteredAttendanceData.length % 3600000) / 60000) + 'm' : '0h 0m'}</td></tr>
            `;
        } else {
            entryExitDetailsHTML = `<tr><td colspan="2" class="placeholder-text">No attendance data for selected period</td></tr>`;
        }
        const recentLogDays = Object.values(myAttendance)
            .filter(d => d.status === 'P' && d.checkIn && d.checkOut)
            .sort((a,b) => b.day - a.day)
            .slice(0, 3);
    
        const firstLastOutRows = recentLogDays.map(d => {
            const totalMs = new Date(`${yearMonth}-01T${d.checkOut}:00`).getTime() - new Date(`${yearMonth}-01T${d.checkIn}:00`).getTime();
            const totalHours = String(Math.floor(totalMs / 3600000)).padStart(2, '0');
            const totalMins = String(Math.floor((totalMs % 3600000) / 60000)).padStart(2, '0');
    
            return `
            <tr>
                <td>${d.day} ${date.toLocaleString('default', { month: 'short' })} ${year}</td>
                <td>${d.checkIn}</td>
                <td>${d.checkOut}</td>
                <td>${totalHours}h ${totalMins}m</td>
            </tr>`
        }).join('') || `<tr><td colspan="4" class="placeholder-text">No recent check-in data</td></tr>`;
    
        return `
            <div class="my-attendance-grid">
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
                ${calendarCells.join('')}
            </div>
            <div class="attendance-details-grid">
                <div class="card">
                    <h4>First in / Last out</h4>
                    <div class="table-container">
                        <table class="table">
                        <thead><tr><th>Date</th><th>First in</th><th>Last out</th><th>Total in-time</th></tr></thead>
                        <tbody>${firstLastOutRows}</tbody>
                        </table>
                    </div>
                </div>
                 <div class="card">
                    <h4>Entry / Exit details</h4>
                     <div class="table-container">
                        <table class="table">
                        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                        <tbody>${entryExitDetailsHTML}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    };

    const teamControls = `
        <div class="page-header-actions">
            <button class="btn btn-secondary"><i class="fa-solid fa-download"></i> Export</button>
        </div>
    `;

    const headerHTML = `
        <div class="attendance-header page-header">
            <div class="page-header-title">
                <h1>${mode === 'my' ? 'My attendance' : 'My team attendance'}</h1>
            </div>
            <div class="month-navigator">
                <button class="month-nav-btn" data-direction="prev"><i class="fa-solid fa-chevron-left"></i></button>
                <span>${monthName} ${year}</span>
                <button class="month-nav-btn" data-direction="next"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            ${mode === 'team' ? teamControls : `<div class="page-header-actions"><button id="submit-attendance-btn" class="btn btn-success"><i class="fa-solid fa-paper-plane"></i> SUBMIT ATTENDANCE</button></div>`}
        </div>
    `;

    const content = `
        ${headerHTML}
        <div class="card attendance-card">
            ${mode === 'my' ? getMyViewHTML() : getTeamViewHTML()}
        </div>
    `;

    document.getElementById('app-content')!.innerHTML = content;
    
    // Set up event listeners
    const timeFilter = document.getElementById('time-filter') as HTMLSelectElement;
    if (timeFilter) {
        timeFilter.value = state.attendanceFilter || 'week';
        timeFilter.addEventListener('change', (e) => {
            state.attendanceFilter = (e.target as HTMLSelectElement).value;
            renderAttendanceTrackerPage(mode);
        });
    }

    // Set up submit attendance button listener
    const submitBtn = document.getElementById('submit-attendance-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmitAttendance);
    }
}

export const renderMyAttendancePage = async () => {
    const date = state.currentAttendanceDate;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    try {
        const uid = String(state.user.id || '').toUpperCase();
        console.log(`🔄 Fetching attendance for user: ${uid}, year: ${year}, month: ${month}`);
        
        // Import the fetchMonthlyAttendance function
        const { fetchMonthlyAttendance } = await import('../features/attendanceApi.js');
        const records = await fetchMonthlyAttendance(uid, year, month);
        
        console.log(`📊 Fetched ${records.length} attendance records for ${uid}`);
        
        const attendanceMap = {};
        records.forEach(rec => {
            if (rec.day) {
                attendanceMap[rec.day] = {
                    day: rec.day,
                    status: rec.status,
                    checkIn: rec.checkIn,
                    checkOut: rec.checkOut,
                    duration: rec.duration
                };
            }
        });
        state.attendanceData[state.user.id] = attendanceMap;
        console.log(`✅ Attendance data loaded for ${Object.keys(attendanceMap).length} days`);
    } catch (err) {
        console.error('❌ Failed to fetch attendance:', err);
        // Initialize empty attendance data if fetch fails
        state.attendanceData[state.user.id] = {};
    }
    
    renderAttendanceTrackerPage('my');
};

export const renderTeamAttendancePage = async () => {
    const date = state.currentAttendanceDate;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // Get current user's employee ID
    const currentEmpId = String(state.user?.id || '').toUpperCase();
    console.log('🔍 Current employee ID for team attendance:', currentEmpId);
    
    // For emp001 (admin), fetch all employees from Dataverse
    // For other employees, use the filtered list as before
    let employeesToFetch = [];
    
    try {
        if (currentEmpId === 'EMP001') {
            console.log('✅ Admin user detected. Fetching attendance for ALL employees from Dataverse');
            // Import the listEmployees function if not already imported
            const { listEmployees } = await import('../features/employeeApi.js');
            const allEmployees = await listEmployees(1, 5000);
            employeesToFetch = allEmployees.items || [];
            console.log(`📊 Fetched ${employeesToFetch.length} employees from Dataverse`);
        } else {
            console.log('👥 Regular user. Showing only department teammates');
            employeesToFetch = state.employees.filter(e => e.status === 'Active');
        }
        
        // Clear previous attendance data to avoid stale records
        state.attendanceData = {};
        
        // Import the fetchMonthlyAttendance function
        const { fetchMonthlyAttendance } = await import('../features/attendanceApi.js');
        
        // Fetch attendance for each employee
        await Promise.all(employeesToFetch.map(async (emp) => {
            const empId = String(emp.employee_id || emp.id || '').toUpperCase();
            if (!empId) {
                console.warn('⚠️ Skipping employee with no ID:', emp);
                return;
            }
            
            console.log(`🔄 Fetching attendance for employee: ${empId}`);
            const records = await fetchMonthlyAttendance(empId, year, month);
            console.log(`📊 Fetched ${records.length} attendance records for ${empId}`);
            
            const attendanceMap = {};
            records.forEach(rec => {
                if (rec.day) {
                    attendanceMap[rec.day] = {
                        status: rec.status,
                        checkIn: rec.checkIn,
                        checkOut: rec.checkOut,
                        duration: rec.duration
                    };
                }
            });
            
            // Store employee name for display
            const empName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.name || empId;
            
            // Store both attendance data and employee info
            state.attendanceData[empId] = attendanceMap;
        }));
        
        console.log(`✅ Team attendance loaded for ${Object.keys(state.attendanceData).length} employees`);
    } catch (err) {
        console.error('❌ Failed to fetch team attendance:', err);
        // Initialize empty attendance data if fetch fails
        state.attendanceData = {};
    }
    
    renderAttendanceTrackerPage('team');
};

export const handleAttendanceNav = (direction: 'prev' | 'next') => {
    const currentDate = state.currentAttendanceDate;
    currentDate.setDate(1); // Avoid month skipping issues
    if(direction === 'next') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
};

export const handleSubmitAttendance = async () => {
    try {
        const date = state.currentAttendanceDate;
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const employeeId = String(state.user.id || '').toUpperCase();

        console.log(`📤 Submitting attendance for ${employeeId} - ${year}/${month}`);

        // Import the submitAttendanceToInbox function (we'll create this)
        const { submitAttendanceToInbox } = await import('../features/attendanceApi.js');

        await submitAttendanceToInbox(employeeId, year, month);

        alert('Attendance submitted successfully! It has been sent to admin for review.');
        console.log('✅ Attendance submitted to admin inbox');

    } catch (error) {
        console.error('❌ Failed to submit attendance:', error);
        alert(`Failed to submit attendance: ${error.message || error}`);
    }
};
