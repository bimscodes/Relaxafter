const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080';

const ACCESS_KEY = 'relaxafter_access';
const REFRESH_KEY = 'relaxafter_refresh';
const USER_KEY = 'relaxafter_user';

export const tokenStore = {
  getAccess: () => typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null,
  getRefresh: () => typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null,
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (auth) => {
    localStorage.setItem(ACCESS_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    tokenStore.clear();
    throw new Error('Refresh failed');
  }
  const data = await res.json();
  tokenStore.set(data);
  return data.accessToken;
}

export async function apiFetch(path, options = {}, retry = true) {
  const token = tokenStore.getAccess();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && tokenStore.getRefresh()) {
    try {
      await refreshAccessToken();
      return apiFetch(path, options, false);
    } catch {
      tokenStore.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Unauthorized');
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.errors) message = Object.values(body.errors).flat().join(', ');
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (body) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }, false),
  register: (body) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/api/auth/me'),

  dashboard: () => apiFetch('/api/dashboard'),

  listUsers: () => apiFetch('/api/users'),
  createUser: (body) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id, body) => apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (id) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),

  listSites: () => apiFetch('/api/sites'),
  createSite: (body) => apiFetch('/api/sites', { method: 'POST', body: JSON.stringify(body) }),
  updateSite: (id, body) => apiFetch(`/api/sites/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSite: (id) => apiFetch(`/api/sites/${id}`, { method: 'DELETE' }),

  listShifts: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const q = qs.toString();
    return apiFetch(`/api/shifts${q ? `?${q}` : ''}`);
  },
  createShift: (body) => apiFetch('/api/shifts', { method: 'POST', body: JSON.stringify(body) }),
  updateShift: (id, body) => apiFetch(`/api/shifts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteShift: (id) => apiFetch(`/api/shifts/${id}`, { method: 'DELETE' })
};
