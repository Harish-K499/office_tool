import { getPageContentHTML } from '../utils.js';

export const renderHomePage = () => {
    const content = `
        <h2>Welcome!</h2>
        <div class="dashboard-grid" style="margin-top: 1.5rem;">
            <div class="card dashboard-card"><h3><i class="fa-solid fa-martini-glass-citrus"></i> Upcoming holidays</h3> <p class="placeholder-text">No upcoming holidays</p></div>
            <div class="card dashboard-card"><h3><i class="fa-solid fa-user-plus"></i> New joiners</h3> <p class="placeholder-text">No new joiners</p></div>
            <div class="card dashboard-card"><h3><i class="fa-solid fa-users"></i> Department members</h3> <p class="placeholder-text">No department members</p></div>
            <div class="card dashboard-card"><h3><i class="fa-solid fa-plane-departure"></i> People on leave</h3> <p class="placeholder-text">No one on leave</p></div>
        </div>
    `;
    document.getElementById('app-content')!.innerHTML = getPageContentHTML("Welcome!", content);
};