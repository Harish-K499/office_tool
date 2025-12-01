
import { renderHomePage } from './pages/home.js';
import { renderEmployeesPage, renderBulkUploadPage, renderBulkDeletePage } from './pages/employees.js';
import { renderInternsPage } from './pages/interns.js';
import { renderInternDetailPage } from './pages/internDetail.js';
import { renderTeamManagementPage } from './pages/teamManagement.js';
import { renderLeaveTrackerPage } from './pages/leaveTracker.js';
import { renderLeaveSettingsPage } from './pages/leaveSettings.js';
import { renderLoginSettingsPage } from './pages/loginSettings.js';
import { renderMyAttendancePage, renderTeamAttendancePage } from './pages/attendance.js';
import { renderInboxPage, renderTimeTrackerPage, renderMyTasksPage, renderMyTimesheetPage, renderTeamTimesheetPage, renderTTClientsPage, renderMeetPage } from './pages/shared.js';
import { renderProjectsRoute } from './pages/projects.js';
import { renderAssetsPage } from "./pages/assets.js";
import { renderHolidaysPage } from './pages/holidays.js';
import { state } from './state.js';
import { renderCompOffPage } from "./pages/comp_off.js";
import { renderOnboardingPage } from './pages/onboarding.js';

// Check if current user is admin
const isAdminUser = () => {
  const empId = String(state.user?.id || '').trim().toUpperCase();
  const email = String(state.user?.email || '').trim().toLowerCase();
  const flag = !!state.user?.is_admin;
  return flag || empId === 'EMP001' || email === 'bala.t@vtab.com';
};

const isManagerOrAdmin = () => {
  const managerFlag = !!state.user?.is_manager;
  return isAdminUser() || managerFlag;
};

// Check if current user is L3 level (HR/Admin with onboarding access)
const isL3User = () => {
  const designation = String(state.user?.designation || '').trim().toLowerCase();
  const empId = String(state.user?.id || '').trim().toUpperCase();
  const email = String(state.user?.email || '').trim().toLowerCase();
  return isAdminUser() || designation.includes('hr') || designation.includes('manager') || empId === 'EMP001' || email === 'bala.t@vtab.com';
};

// Access denied page for non-admin users
const renderAccessDenied = (redirectPath = '#/') => {
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="padding: 40px; text-align: center;">
      <i class="fa-solid fa-lock" style="font-size: 48px; color: #e74c3c; margin-bottom: 16px;"></i>
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
      <p>Only administrators (EMP001) can view team data.</p>
      <button class="btn btn-primary" onclick="window.location.hash='${redirectPath}'" style="margin-top: 16px;">
        <i class="fa-solid fa-arrow-left"></i> Go Back
      </button>
    </div>
  `;
};

const routes = {
  "/": renderHomePage,
  "/employees": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/");
      return;
    }
    await renderEmployeesPage();
  },
  "/interns": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/" );
      return;
    }
    await renderInternsPage();
  },
  "/employees/bulk-upload": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/");
      return;
    }
    await renderBulkUploadPage();
  },
  "/employees/bulk-delete": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/");
      return;
    }
    await renderBulkDeletePage();
  },
  "/team-management": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/");
      return;
    }
    await renderTeamManagementPage();
  },
  "/inbox": renderInboxPage,
  "/meet": renderMeetPage,
  "/time-tracker": renderTimeTrackerPage,
  "/time-my-tasks": renderMyTasksPage,
  "/time-my-timesheet": renderMyTimesheetPage,
  "/time-team-timesheet": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/time-my-timesheet");
      return;
    }
    await renderTeamTimesheetPage();
  },
  "/time-clients": async () => {
    if (!isManagerOrAdmin()) {
      renderAccessDenied("#/time-my-timesheet");
      return;
    }
    await renderTTClientsPage();
  },
  "/time-projects": renderProjectsRoute,
  "/leave-tracker": renderLeaveTrackerPage,
  "/leave-my": async () => {
    window.__leaveViewMode = "my";
    await renderLeaveTrackerPage(1, true);
  },
  "/leave-team": async () => {
    if (!isAdminUser()) {
      console.warn("⚠️ Access denied: Only admin can view team leaves");
      renderAccessDenied("#/leave-my");
      return;
    }
    window.__leaveViewMode = "team";
    await renderLeaveTrackerPage(1, true);
  },
  "/leave-settings": renderLeaveSettingsPage,
  "/login-settings": async () => {
    if (!isAdminUser()) {
      renderAccessDenied("#/");
      return;
    }
    await renderLoginSettingsPage();
  },
  "/compoff": renderCompOffPage,
  "/attendance-my": renderMyAttendancePage,
  "/attendance-team": async () => {
    if (!isAdminUser()) {
      console.warn("⚠️ Access denied: Only admin can view team attendance");
      renderAccessDenied("#/attendance-my");
      return;
    }
    await renderTeamAttendancePage();
  },
  "/assets": renderAssetsPage,
  "/attendance-holidays": renderHolidaysPage,
  "/onboarding": async () => {
    if (!isL3User()) {
      console.warn("⚠️ Access denied: Only L3 users can access onboarding");
      renderAccessDenied("#/");
      return;
    }
    await renderOnboardingPage();
  },
};

export const router = async () => {
  const full = window.location.hash.slice(1) || '/';
  const path = full.split('?')[0] || '/';
  if (path.startsWith('/interns/')) {
    const internId = decodeURIComponent(path.substring('/interns/'.length));
    await renderInternDetailPage(internId);
    updateActiveNav('/interns');
    return;
  }
  const pageRenderer = routes[path] || renderHomePage; // Default to home

  await pageRenderer();
  updateActiveNav(path);
};

const updateActiveNav = (path) => {
  const page = (path === '/') ? 'home' : path.slice(1);

  document.querySelectorAll('.nav-group').forEach((group) => {
    group.classList.remove('open');
    group.querySelector('.nav-toggle')?.classList.remove('active');
  });

  document.querySelectorAll('.nav-link').forEach((linkEl) => {
    const link = linkEl;
    const linkPage = link.dataset.page;
    const isActive = linkPage === page;
    link.classList.toggle('active', isActive);

    if (isActive) {
      const parentGroup = link.closest('.nav-group');
      if (parentGroup) {
        parentGroup.classList.add('open');
        parentGroup.querySelector('.nav-toggle')?.classList.add('active');
      }
    }
  });
};

export const initRouter = () => {
  window.addEventListener('hashchange', router);
  window.addEventListener('load', () => {
    if (!window.location.hash) {
      window.location.hash = '#/';
    }
    router();
  });
};