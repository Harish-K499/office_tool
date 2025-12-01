
import { state } from '../state.js';
import { getPageContentHTML } from '../utils.js';
import { renderModal, closeModal } from '../components/modal.js';
import { Leave } from '../types.js';

export const renderLeaveTrackerPage = async () => {
    const controls = `<button id="apply-leave-btn" class="btn btn-primary"><i class="fa-solid fa-plus"></i> APPLY LEAVE</button>`;
    
    const uid = String(state.user.id || '').toUpperCase();
    
    // Fetch real-time leave balances from backend
    let leaveBalances = [];
    try {
        console.log(`🔄 Fetching real-time leave balances for user: ${uid}`);
        const { fetchAllLeaveBalances } = await import('../features/leaveApi.js');
        leaveBalances = await fetchAllLeaveBalances(uid);
        console.log(`✅ Leave balances loaded:`, leaveBalances);
    } catch (err) {
        console.error('❌ Failed to fetch leave balances:', err);
        // Use default balances if fetch fails
        leaveBalances = [
            { type: 'Casual Leave', annual_quota: 12, consumed: 0, available: 12 },
            { type: 'Sick Leave', annual_quota: 10, consumed: 0, available: 10 },
            { type: 'Comp off', annual_quota: 0, consumed: 0, available: 0 }
        ];
    }
    
    // Fetch historical leave data for the current user
    try {
        console.log(`🔄 Fetching leave history for user: ${uid}`);
        
        // Import the fetchEmployeeLeaves function
        const { fetchEmployeeLeaves } = await import('../features/leaveApi.js');
        const leaves = await fetchEmployeeLeaves(uid);
        
        console.log(`📊 Fetched ${leaves.length} leave records for ${uid}`);
        
        // Update state with fetched leaves
        state.leaves = leaves.map(l => ({
            id: l.leave_id,
            title: l.leave_type || 'Leave',
            startDate: l.start_date,
            endDate: l.end_date,
            leaveType: l.leave_type,
            appliedBy: l.employee_id,
            approvalStatus: l.status || 'Pending',
            leaveCount: parseInt(l.total_days) || 1,
            lopDays: 0,
            appliedDate: l.start_date
        }));
        
        console.log(`✅ Leave data loaded: ${state.leaves.length} records`);
    } catch (err) {
        console.error('❌ Failed to fetch leave history:', err);
        // Initialize empty leave data if fetch fails
        if (!state.leaves) {
            state.leaves = [];
        }
    }
    
    // Generate quota cards with real-time data
    const quotaCards = leaveBalances.map(balance => {
        const { type, annual_quota, consumed, available } = balance;
        
        // Calculate percentage for circular progress
        // For Comp off (no annual quota), show consumed vs available
        let consumedPercentage = 0;
        if (annual_quota > 0) {
            consumedPercentage = (consumed / annual_quota) * 100;
        } else if (available > 0) {
            // For comp off, show available as 100%
            consumedPercentage = 0;
        }
        
        // Create conic gradient for circular chart
        const chartStyle = `background: conic-gradient(#1e3a8a 0% ${consumedPercentage}%, #e5e7eb ${consumedPercentage}% 100%);`;

        return `
            <div class="leave-quota-card">
                <div class="quota-chart" style="${chartStyle}">
                    <div class="quota-chart-inner">
                        <div class="quota-available">${available}</div>
                        <div class="quota-label">days</div>
                    </div>
                </div>
                <div class="quota-details">
                    <h4>${type}</h4>
                    <ul class="quota-legend">
                        <li><span class="legend-dot" style="background-color: #3b82f6;"></span> Annual Quota: ${annual_quota}</li>
                        <li><span class="legend-dot" style="background-color: #1e3a8a;"></span> Consumed: ${consumed}</li>
                        <li><span class="legend-dot" style="background-color: #e5e7eb;"></span> Available: ${available}</li>
                    </ul>
                </div>
            </div>
        `;
    }).join('');

    const tableRows = state.leaves.map(l => `
        <tr>
            <td>${l.startDate}</td>
            <td>${l.endDate}</td>
            <td>${l.leaveType}</td>
            <td>${l.appliedBy}</td>
            <td><span class="status-badge ${l.approvalStatus.toLowerCase()}">${l.approvalStatus}</span></td>
            <td>${l.leaveCount} day(s)</td>
            <td>${l.lopDays || '-'}</td>
            <td>${l.appliedDate}</td>
        </tr>
    `).join('');
    
    const content = `
        <div class="leave-quota-grid">${quotaCards}</div>
        <div class="card leave-history">
            <h3>Leave History</h3>
            <div class="table-container">
                <table class="table">
                    <thead><tr><th>Start date</th><th>End date</th><th>Leave type</th><th>Applied by</th><th>Approval status</th><th>Leave count</th><th>LOP days</th><th>Applied date</th></tr></thead>
                    <tbody>${tableRows || `<tr><td colspan="8" class="placeholder-text">No leave history. Apply for leave using the APPLY LEAVE button.</td></tr>`}</tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('app-content')!.innerHTML = getPageContentHTML('My Leaves', content, controls);
};

export const showApplyLeaveModal = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const formHTML = `
        <div class="form-group">
            <label for="employeeId">Employee ID</label>
            <input type="text" id="employeeId" value="${state.user.id}" readonly>
        </div>
        <div class="form-group">
            <label for="leaveTitle">Leave Title</label>
            <input type="text" id="leaveTitle" placeholder="e.g., Family function" required>
        </div>
        <div class="form-group">
            <label for="leaveType">Leave Type</label>
            <select id="leaveType">
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Comp off</option>
                <option>Earned Leave</option>
            </select>
        </div>
        <div class="form-group">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate" min="${today}" required>
        </div>
        <div class="form-group">
            <label for="endDate">End Date</label>
            <input type="date" id="endDate" min="${today}" required>
        </div>
        <div class="form-group">
            <label for="reason">Reason</label>
            <textarea id="reason" rows="3" placeholder="A brief reason for your leave"></textarea>
        </div>
    `;
    renderModal('Apply Leave', formHTML, 'submit-leave-btn');
};

export const handleApplyLeave = async (e: SubmitEvent) => {
    e.preventDefault();
    const startDate = (document.getElementById('startDate') as HTMLInputElement).value;
    const endDate = (document.getElementById('endDate') as HTMLInputElement).value;
    
    if (!startDate || !endDate) {
        alert('Please select start and end dates.');
        return;
    }

    try {
        const uid = String(state.user.id || '').toUpperCase();
        const leaveData = {
            leave_type: (document.getElementById('leaveType') as HTMLSelectElement).value,
            start_date: startDate,
            end_date: endDate,
            applied_by: uid,
            paid_unpaid: 'Paid',
            status: 'Pending'
        };

        console.log('📤 Applying leave with data:', leaveData);

        // Import the applyLeave function
        const { applyLeave } = await import('../features/leaveApi.js');
        await applyLeave(leaveData);

        console.log('✅ Leave applied successfully');
        closeModal();
        
        // Refresh the leave history
        await renderLeaveTrackerPage();
        
        alert('Leave applied successfully!');
    } catch (err) {
        console.error('❌ Failed to apply leave:', err);
        alert(`Failed to apply leave: ${err.message || err}`);
    }
};
