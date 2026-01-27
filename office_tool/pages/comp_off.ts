
import { state } from '../state.js';
import { getPageContentHTML } from '../utils.js';
import { renderModal, closeModal } from '../components/modal.js';
import { CompOffRequest } from '../types.js';

const getCompOffContentHTML = () => {
    const tableRows = state.compOffs.map(co => `
        <tr>
            <td>${co.employeeName}</td>
            <td>${co.employeeId}</td>
            <td>${co.availableDays}</td>
        </tr>
    `).join('');

    const requestRows = state.compOffRequests.filter(req => req.employeeId === state.user.id).map(req => `
         <tr>
            <td>${req.dateWorked}</td>
            <td>${req.reason}</td>
            <td><span class="status-badge ${req.status.toLowerCase()}">${req.status}</span></td>
            <td>${req.appliedDate}</td>
        </tr>
    `).join('');

    return `
        <div class="card">
            <h3 style="margin-bottom: 1.5rem;">Compensatory Off Balance</h3>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Employee ID</th>
                            <th>Available Comp Off (Days)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || `<tr><td colspan="3" class="placeholder-text">No comp off data available.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card" style="margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1.5rem;">My Comp Off Requests</h3>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date Worked</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requestRows || `<tr><td colspan="4" class="placeholder-text">No comp off requests found.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

export const renderCompOffPage = () => {
    const controls = `<button id="request-compoff-btn" class="btn btn-primary"><i class="fa-solid fa-plus"></i> REQUEST COMP OFF</button>`;
    const content = getCompOffContentHTML();
    document.getElementById('app-content')!.innerHTML = getPageContentHTML('Compensatory Off', content, controls);
};

export const showRequestCompOffModal = () => {
    const formHTML = `
        <div class="form-group">
            <label for="dateWorked">Date Worked</label>
            <input type="date" id="dateWorked" required>
        </div>
         <div class="form-group">
            <label for="reason">Reason</label>
            <textarea id="reason" rows="3" placeholder="A brief reason for working on this day" required></textarea>
        </div>
    `;
    renderModal('Request Compensatory Off', formHTML, 'submit-compoff-btn');
};

export const handleRequestCompOff = (e: SubmitEvent) => {
    e.preventDefault();

    const newRequest: CompOffRequest = {
        id: state.compOffRequests.length + 1,
        employeeId: state.user.id,
        employeeName: state.user.name,
        dateWorked: (document.getElementById('dateWorked') as HTMLInputElement).value,
        reason: (document.getElementById('reason') as HTMLTextAreaElement).value,
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0]
    };

    state.compOffRequests.unshift(newRequest);
    closeModal();
    renderCompOffPage();
};
