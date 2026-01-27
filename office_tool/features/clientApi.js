import { API_BASE_URL } from '../config.js';

const BASE_URL = API_BASE_URL.replace(/\/$/, '');

const buildQueryString = (params = {}) => {
  const url = new URL(`${BASE_URL}/api/clients`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url;
};

export async function listClients(params = {}) {
  const url = buildQueryString(params);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch clients');
  }
  return data;
}

export async function createClient(payload) {
  const res = await fetch(`${BASE_URL}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create client');
  }
  return data.client;
}

export async function updateClient(recordId, payload) {
  const res = await fetch(`${BASE_URL}/api/clients/${encodeURIComponent(recordId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update client');
  }
  return data.client;
}

export async function deleteClient(recordId) {
  const res = await fetch(`${BASE_URL}/api/clients/${encodeURIComponent(recordId)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete client');
  }
  return true;
}

export async function getNextClientId() {
  const res = await fetch(`${BASE_URL}/api/clients/next-id`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate client ID');
  }
  return data.next_id;
}
