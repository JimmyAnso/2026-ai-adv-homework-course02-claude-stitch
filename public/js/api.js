async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...Auth.getAuthHeaders(),
    ...options.headers
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem(Auth.TOKEN_KEY);
    localStorage.removeItem(Auth.USER_KEY);
    window.location.href = '/login';
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data;
}

// SQLite datetime('now') 存的是不帶時區的 UTC 字串（YYYY-MM-DD HH:MM:SS），需補上 Z 再解析
function parseDbTime(value) {
  if (!value) return null;
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : value.replace(' ', 'T') + 'Z');
}

function formatDate(value) {
  const d = parseDbTime(value);
  return d ? d.toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' }) : '';
}

function formatDateTime(value) {
  const d = parseDbTime(value);
  return d ? d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short' }) : '';
}
