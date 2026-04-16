const API_BASE = '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export const authApi = {
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (username, email, password) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }).then(handleResponse),
};

export const musicApi = {
  getAll: () =>
    fetch(`${API_BASE}/music`, { headers: getHeaders() }).then(handleResponse),

  getByCategory: (category) =>
    fetch(`${API_BASE}/music/${category}`, { headers: getHeaders() }).then(handleResponse),
};

export const moodApi = {
  save: (mood, note) =>
    fetch(`${API_BASE}/mood`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mood, note }),
    }).then(handleResponse),

  getHistory: () =>
    fetch(`${API_BASE}/mood/history`, { headers: getHeaders() }).then(handleResponse),
};
