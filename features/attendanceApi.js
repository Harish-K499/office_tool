// features/attendanceApi.js

const BASE_URL = 'http://localhost:5000';

export async function checkIn(employeeId) {
  const res = await fetch(`${BASE_URL}/api/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Check-in failed');
  }
  return data; // { record_id, checkin_time }
}

export async function checkOut(employeeId) {
  const res = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Check-out failed');
  }
  return data; // { checkout_time, duration, total_hours }
}

export async function fetchMonthlyAttendance(employeeId, year, month) {
  const res = await fetch(`${BASE_URL}/api/attendance/${employeeId}/${year}/${month}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch attendance');
  }
  return data.records || []; // Array of { day, status, checkIn, checkOut, duration }
}

export async function fetchAllAttendance(employeeId) {
  const res = await fetch(`${BASE_URL}/api/attendance/${employeeId}/all`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch attendance');
  }
  return data.records || []; // Array of { date, checkIn, checkOut, duration }
}

export async function submitAttendanceToInbox(employeeId, year, month) {
  const res = await fetch(`${BASE_URL}/api/attendance/submit-to-inbox`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId, year, month })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to submit attendance to inbox');
  }
  return data;
}
