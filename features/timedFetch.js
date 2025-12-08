// Lightweight fetch wrapper to log duration and status for diagnostics
export async function timedFetch(url, options = {}, label = '') {
  const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const res = await fetch(url, options);
  const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const ms = Math.round(end - start);
  const tag = label || url;
  try {
    console.log(`⏱️ ${tag} -> ${res.status} (${ms}ms)`);
  } catch {
    // ignore logging errors
  }
  return res;
}
