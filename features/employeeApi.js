// features/employeeApi.js

const BASE_URL = 'http://localhost:5000';

export async function listEmployees(page = 1, pageSize = 5) {
  const url = new URL(`${BASE_URL}/api/employees`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch employees');
  }
  return {
    items: data.employees || [],
    total: typeof data.total === 'number' ? data.total : undefined,
    page: data.page || page,
    pageSize: data.pageSize || pageSize
  };
}

export async function createEmployee(payload) {
  const res = await fetch(`${BASE_URL}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create employee');
  }
  return data.employee;
}

export async function updateEmployee(employeeId, payload) {
  const res = await fetch(`${BASE_URL}/api/employees/${encodeURIComponent(employeeId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update employee');
  }
  return data.employee;
}

export async function deleteEmployee(employeeId) {
  const res = await fetch(`${BASE_URL}/api/employees/${encodeURIComponent(employeeId)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete employee');
  }
  return true;
}

export async function bulkCreateEmployees(employees) {
  const res = await fetch(`${BASE_URL}/api/employees/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employees })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to bulk upload employees');
  }
  return data;
}
