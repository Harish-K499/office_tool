const BASE_URL = 'http://localhost:5000';

const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { success: false, error: err?.message || 'Unexpected error' };
  }
  if (!res.ok || data?.success === false) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.details = data;
    throw error;
  }
  return data;
};

export const listHierarchy = async ({
  page = 1,
  pageSize = 25,
  search = '',
  manager = '',
  department = '',
  groupByManager = false
} = {}) => {
  const url = new URL(`${BASE_URL}/api/team-management/hierarchy`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (search) url.searchParams.set('search', search);
  if (manager) url.searchParams.set('manager', manager);
  if (department) url.searchParams.set('department', department);
  if (groupByManager) url.searchParams.set('groupByManager', 'true');

  const res = await fetch(url.toString(), { method: 'GET' });
  return handleResponse(res);
};

export const createHierarchyMapping = async ({ employeeId, managerId }) => {
  const res = await fetch(`${BASE_URL}/api/team-management/hierarchy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, managerId })
  });
  return handleResponse(res);
};

export const updateHierarchyMapping = async (recordId, { managerId }) => {
  const res = await fetch(`${BASE_URL}/api/team-management/hierarchy/${encodeURIComponent(recordId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ managerId })
  });
  return handleResponse(res);
};

export const deleteHierarchyMapping = async (recordId) => {
  const res = await fetch(`${BASE_URL}/api/team-management/hierarchy/${encodeURIComponent(recordId)}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
};
