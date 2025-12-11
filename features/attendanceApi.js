// features/attendanceApi.js
import { API_BASE_URL } from '../config.js';
import { state } from '../state.js';
import { timedFetch } from './timedFetch.js';

const BASE_URL = API_BASE_URL.replace(/\/$/, '');
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function checkIn(employeeId, location = null) {
  const payload = {
    employee_id: employeeId,
    client_time: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
  if (location) {
    payload.location = location;
  }
  const res = await timedFetch(`${BASE_URL}/api/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'checkIn');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Check-in failed');
  }
  return data; // { record_id, checkin_time }
}

export async function checkOut(employeeId, location = null) {
  const payload = {
    employee_id: employeeId,
    client_time: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
  if (location) {
    payload.location = location;
  }
  const res = await timedFetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'checkOut');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Check-out failed');
  }
  return data; // { checkout_time, duration, total_hours }
}

export async function fetchMonthlyAttendance(employeeId, year, month) {
  const key = `${String(employeeId || '').toUpperCase()}|${year}|${month}`;
  const now = Date.now();
  const cached = state?.cache?.attendance?.[key];
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await timedFetch(`${BASE_URL}/api/attendance/${employeeId}/${year}/${month}`, {}, 'fetchMonthlyAttendance');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch attendance');
  }
  const records = data.records || []; // Array of { day, status, checkIn, checkOut, duration }
  try {
    if (state?.cache?.attendance) {
      state.cache.attendance[key] = { data: records, fetchedAt: now };
    }
  } catch { /* ignore cache errors */ }
  return records;
}

export async function fetchAllAttendance(employeeId) {
  const res = await timedFetch(`${BASE_URL}/api/attendance/${employeeId}/all`, {}, 'fetchAllAttendance');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch attendance');
  }
  return data.records || []; // Array of { date, checkIn, checkOut, duration }
}

// Aggregated team attendance for a month
export async function fetchTeamMonthlyAttendance(employeeIds = [], year, month) {
  const ids = employeeIds.filter(Boolean).map(id => String(id).toUpperCase());
  if (!ids.length) return {};
  const params = new URLSearchParams();
  params.set('year', String(year));
  params.set('month', String(month));
  params.set('employee_ids', ids.join(','));
  const res = await timedFetch(`${BASE_URL}/api/attendance/team-month?${params.toString()}`, {}, 'fetchTeamMonthlyAttendance');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch team attendance');
  }
  return data.records || {};
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
