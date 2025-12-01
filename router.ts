
import { renderHomePage } from './pages/home.js';
import { renderEmployeesPage } from './pages/employees.js';
import { renderLeaveTrackerPage } from './pages/leaveTracker.js';
import { renderMyAttendancePage, renderTeamAttendancePage } from './pages/attendance.js';
import { renderInboxPage, renderTimeTrackerPage, renderMeetPage } from './pages/shared.js';
import { renderProjectsRoute } from './pages/projects.js';

const routes: { [key: string]: () => void } = {
    '/': renderHomePage,
    '/employees': renderEmployeesPage,
    '/inbox': renderInboxPage,
    '/meet': renderMeetPage,
    '/time-tracker': renderTimeTrackerPage,
    '/leave-tracker': renderLeaveTrackerPage,
    '/projects': renderProjectsRoute,
    '/attendance-my': renderMyAttendancePage,
    '/attendance-team': renderTeamAttendancePage,
};

export const router = async () => {
    const path = window.location.hash.slice(1) || '/';
    const pageRenderer = routes[path] || renderHomePage; // Default to home
    await pageRenderer();
    updateActiveNav(path);
};

const updateActiveNav = (path: string) => {
    const page = (path === '/') ? 'home' : path.slice(1);
    document.querySelectorAll('.nav-link').forEach(linkEl => {
        const link = linkEl as HTMLElement;
        const linkPage = link.dataset.page;
        const isActive = linkPage === page;
        link.classList.toggle('active', isActive);

        const parentGroup = link.closest('.nav-group');
        if (parentGroup) {
            if (isActive) {
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
