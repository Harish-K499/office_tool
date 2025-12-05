// Global API configuration for frontend
// Production: point to Render backend
export const API_BASE_URL = 'https://vtab-office-tool.onrender.com';
export const apiBase = API_BASE_URL.replace(/\/$/, '');
export const apiUrl = (path = '/') => {
  const p = String(path || '/');
  return apiBase + (p.startsWith('/') ? p : `/${p}`);
};
