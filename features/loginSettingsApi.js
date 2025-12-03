// features/loginSettingsApi.js - API functions for managing login accounts (Dataverse login table)
import { API_BASE_URL } from '../config.js';

const BASE_URL = API_BASE_URL.replace(/\/$/, '');

export async function listLoginAccounts() {
  const res = await fetch(`${BASE_URL}/api/login-accounts`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch login accounts');
  }
  return data.items || [];
}

export async function createLoginAccount(payload) {
  const res = await fetch(`${BASE_URL}/api/login-accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create login account');
  }
  return data.item;
}

export async function updateLoginAccount(loginId, payload) {
  const res = await fetch(`${BASE_URL}/api/login-accounts/${encodeURIComponent(loginId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update login account');
  }
  return true;
}

export async function deleteLoginAccount(loginId) {
  const res = await fetch(`${BASE_URL}/api/login-accounts/${encodeURIComponent(loginId)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete login account');
  }
  return true;
}
