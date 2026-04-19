import { mockApi, resetDemoData } from './mockApi';

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

const tok = () => tokenStore.getAccess();

export const api = {
  login: (body) => mockApi.login(body),
  register: (body) => mockApi.register(body),
  logout: () => mockApi.logout(tok()),
  me: () => mockApi.me(tok()),

  dashboard: () => mockApi.dashboard(tok()),

  listUsers: () => mockApi.listUsers(tok()),
  createUser: (body) => mockApi.createUser(tok(), body),
  updateUser: (id, body) => mockApi.updateUser(tok(), id, body),
  deleteUser: (id) => mockApi.deleteUser(tok(), id),

  listSites: () => mockApi.listSites(tok()),
  createSite: (body) => mockApi.createSite(tok(), body),
  updateSite: (id, body) => mockApi.updateSite(tok(), id, body),
  deleteSite: (id) => mockApi.deleteSite(tok(), id),

  listShifts: (params = {}) => mockApi.listShifts(tok(), params),
  createShift: (body) => mockApi.createShift(tok(), body),
  updateShift: (id, body) => mockApi.updateShift(tok(), id, body),
  deleteShift: (id) => mockApi.deleteShift(tok(), id),

  resetDemo: () => {
    resetDemoData();
    tokenStore.clear();
  }
};
