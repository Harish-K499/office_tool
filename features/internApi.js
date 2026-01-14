import { API_BASE_URL } from '../config.js';

const BASE_URL = API_BASE_URL.replace(/\/$/, '');

export async function listInterns(page = 1, pageSize = 10) {
  const url = new URL(`${BASE_URL}/api/interns`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch interns');
  }
  return {
    items: data.interns || [],
    total: typeof data.total === 'number' ? data.total : undefined,
    page: data.page || page,
    pageSize: data.pageSize || pageSize,
  };
}

export async function getInternDetails(internId) {
  if (!internId) {
    throw new Error('Intern ID is required');
  }
  const res = await fetch(`${BASE_URL}/api/interns/${encodeURIComponent(internId)}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch intern details');
  }
  return data.intern;
}

export async function createIntern(payload) {
  const res = await fetch(`${BASE_URL}/api/interns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const msg = data.error || `Failed to create intern: ${res.status}`;
    const details = data.details ? ` | ${data.details}` : '';
    throw new Error(`${msg}${details}`);
  }
  return data.intern;
}

export async function updateIntern(internId, payload) {
  if (!internId) {
    throw new Error('Intern ID is required');
  }
  const res = await fetch(`${BASE_URL}/api/interns/${encodeURIComponent(internId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const msg = data.error || `Failed to update intern: ${res.status}`;
    const details = data.details ? ` | ${data.details}` : '';
    throw new Error(`${msg}${details}`);
  }
  return data.intern;
}

export async function getInternProjects(employeeId) {
  if (!employeeId) {
    throw new Error('Employee ID is required');
  }
  const res = await fetch(`${BASE_URL}/api/employees/${encodeURIComponent(employeeId)}/projects`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch intern projects');
  }
  return data.projects || [];
}
