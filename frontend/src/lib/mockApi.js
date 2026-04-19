const STORAGE_KEY = 'relaxafter_mock_db_v1';

function nowDate(offsetDays = 0, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedDb() {
  const company = { id: 1, name: 'Acme Cleaning Co.', subscriptionPlan: 'Demo' };
  const users = [
    { id: 1, name: 'Alex Admin', email: 'admin@demo.com', password: 'demo1234', role: 'Admin', companyId: 1, createdAt: nowDate(-30) },
    { id: 2, name: 'Maya Manager', email: 'manager@demo.com', password: 'demo1234', role: 'Manager', companyId: 1, createdAt: nowDate(-25) },
    { id: 3, name: 'Sam Staff', email: 'staff@demo.com', password: 'demo1234', role: 'Staff', companyId: 1, createdAt: nowDate(-20) },
    { id: 4, name: 'Jordan Lee', email: 'jordan@demo.com', password: 'demo1234', role: 'Staff', companyId: 1, createdAt: nowDate(-15) },
    { id: 5, name: 'Priya Patel', email: 'priya@demo.com', password: 'demo1234', role: 'Staff', companyId: 1, createdAt: nowDate(-10) }
  ];
  const sites = [
    { id: 1, name: 'Downtown Office Tower', address: '120 Market St, Floor 3', notes: 'Use service entrance after 6pm.', color: '#2563eb', companyId: 1 },
    { id: 2, name: 'Harbor View Hotel', address: '500 Coastal Rd', notes: 'Lobby + 2nd floor only.', color: '#10b981', companyId: 1 },
    { id: 3, name: 'Riverside Clinic', address: '88 River Ln', notes: 'Hospital-grade disinfectant required.', color: '#f59e0b', companyId: 1 },
    { id: 4, name: 'Northgate Mall', address: '900 North Plaza', notes: null, color: '#8b5cf6', companyId: 1 }
  ];
  const shifts = [
    { id: 1, userId: 3, siteId: 1, companyId: 1, startTime: nowDate(0, 8), endTime: nowDate(0, 12), notes: 'Weekly deep clean' },
    { id: 2, userId: 4, siteId: 2, companyId: 1, startTime: nowDate(0, 13), endTime: nowDate(0, 17), notes: null },
    { id: 3, userId: 5, siteId: 3, companyId: 1, startTime: nowDate(1, 9), endTime: nowDate(1, 13), notes: 'Restock supplies' },
    { id: 4, userId: 3, siteId: 4, companyId: 1, startTime: nowDate(2, 14), endTime: nowDate(2, 18), notes: null },
    { id: 5, userId: 4, siteId: 1, companyId: 1, startTime: nowDate(3, 8), endTime: nowDate(3, 11), notes: null },
    { id: 6, userId: 5, siteId: 2, companyId: 1, startTime: nowDate(4, 10), endTime: nowDate(4, 15), notes: 'Event setup' },
    { id: 7, userId: 3, siteId: 3, companyId: 1, startTime: nowDate(7, 9), endTime: nowDate(7, 13), notes: null },
    { id: 8, userId: 4, siteId: 4, companyId: 1, startTime: nowDate(8, 12), endTime: nowDate(8, 16), notes: null }
  ];
  return {
    companies: [company],
    users,
    sites,
    shifts,
    sessions: {},
    counters: { company: 2, user: 6, site: 5, shift: 9 }
  };
}

function loadDb() {
  if (typeof window === 'undefined') return seedDb();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = seedDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try { return JSON.parse(raw); }
  catch {
    const fresh = seedDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveDb(db) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDemoData() {
  if (typeof window === 'undefined') return;
  const fresh = seedDb();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
}

function makeToken(userId) {
  return `mock_${userId}_${Math.random().toString(36).slice(2, 10)}`;
}

function userToDto(user, companyName) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    companyName
  };
}

function authResponse(db, user) {
  const company = db.companies.find((c) => c.id === user.companyId);
  const accessToken = makeToken(user.id);
  const refreshToken = makeToken(user.id);
  db.sessions[refreshToken] = user.id;
  db.sessions[accessToken] = user.id;
  saveDb(db);
  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: userToDto(user, company?.name || '')
  };
}

function err(message) { return Promise.reject(new Error(message)); }

function delay(ms = 80) { return new Promise((r) => setTimeout(r, ms)); }

function getSessionUser(db, token) {
  if (!token) return null;
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) || null;
}

export const mockApi = {
  async login({ email, password }) {
    await delay();
    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!user || user.password !== password) return err('Invalid credentials.');
    return authResponse(db, user);
  },

  async register({ companyName, name, email, password }) {
    await delay();
    const db = loadDb();
    const emailLower = String(email).trim().toLowerCase();
    if (db.users.some((u) => u.email === emailLower)) return err('Email already registered.');
    const company = { id: db.counters.company++, name: companyName.trim(), subscriptionPlan: 'Free' };
    db.companies.push(company);
    const user = {
      id: db.counters.user++,
      name: name.trim(),
      email: emailLower,
      password,
      role: 'Admin',
      companyId: company.id,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    return authResponse(db, user);
  },

  async refresh({ refreshToken }) {
    await delay();
    const db = loadDb();
    const userId = db.sessions[refreshToken];
    if (!userId) return err('Invalid refresh token.');
    const user = db.users.find((u) => u.id === userId);
    if (!user) return err('Invalid refresh token.');
    return authResponse(db, user);
  },

  async logout(token) {
    await delay();
    const db = loadDb();
    Object.keys(db.sessions).forEach((k) => {
      if (db.sessions[k] === db.sessions[token]) delete db.sessions[k];
    });
    saveDb(db);
    return null;
  },

  async me(token) {
    await delay();
    const db = loadDb();
    const user = getSessionUser(db, token);
    if (!user) return err('Unauthorized');
    const company = db.companies.find((c) => c.id === user.companyId);
    return userToDto(user, company?.name || '');
  },

  async dashboard(token) {
    await delay();
    const db = loadDb();
    const user = getSessionUser(db, token);
    if (!user) return err('Unauthorized');
    const now = Date.now();
    const inCompany = (x) => x.companyId === user.companyId;
    return {
      totalStaff: db.users.filter(inCompany).length,
      activeSites: db.sites.filter(inCompany).length,
      totalShifts: db.shifts.filter(inCompany).length,
      upcomingShifts: db.shifts.filter((s) => inCompany(s) && new Date(s.startTime).getTime() >= now).length
    };
  },

  async listUsers(token) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role === 'Staff') return err('Forbidden');
    return db.users
      .filter((u) => u.companyId === me.companyId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
  },

  async createUser(token, body) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role !== 'Admin') return err('Forbidden');
    const emailLower = String(body.email).trim().toLowerCase();
    if (db.users.some((u) => u.email === emailLower)) return err('Email already in use.');
    const user = {
      id: db.counters.user++,
      name: body.name.trim(),
      email: emailLower,
      password: body.password,
      role: body.role,
      companyId: me.companyId,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDb(db);
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  },

  async updateUser(token, id, body) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role !== 'Admin') return err('Forbidden');
    const user = db.users.find((u) => u.id === id && u.companyId === me.companyId);
    if (!user) return err('User not found.');
    const emailLower = String(body.email).trim().toLowerCase();
    if (emailLower !== user.email && db.users.some((u) => u.email === emailLower)) return err('Email already in use.');
    user.name = body.name.trim();
    user.email = emailLower;
    user.role = body.role;
    if (body.password) user.password = body.password;
    saveDb(db);
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  },

  async deleteUser(token, id) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role !== 'Admin') return err('Forbidden');
    if (id === me.id) return err('You cannot delete yourself.');
    if (db.shifts.some((s) => s.userId === id)) return err('Cannot delete a user with shifts. Reassign or delete the shifts first.');
    db.users = db.users.filter((u) => !(u.id === id && u.companyId === me.companyId));
    saveDb(db);
    return null;
  },

  async listSites(token) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    return db.sites
      .filter((s) => s.companyId === me.companyId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ id: s.id, name: s.name, address: s.address, notes: s.notes, color: s.color }));
  },

  async createSite(token, body) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role === 'Staff') return err('Forbidden');
    const site = {
      id: db.counters.site++,
      name: body.name.trim(),
      address: (body.address || '').trim(),
      notes: body.notes?.trim() || null,
      color: body.color || '#2563eb',
      companyId: me.companyId
    };
    db.sites.push(site);
    saveDb(db);
    return { id: site.id, name: site.name, address: site.address, notes: site.notes, color: site.color };
  },

  async updateSite(token, id, body) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role === 'Staff') return err('Forbidden');
    const site = db.sites.find((s) => s.id === id && s.companyId === me.companyId);
    if (!site) return err('Site not found.');
    site.name = body.name.trim();
    site.address = (body.address || '').trim();
    site.notes = body.notes?.trim() || null;
    if (body.color) site.color = body.color;
    saveDb(db);
    return { id: site.id, name: site.name, address: site.address, notes: site.notes, color: site.color };
  },

  async deleteSite(token, id) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role !== 'Admin') return err('Forbidden');
    if (db.shifts.some((s) => s.siteId === id)) return err('Cannot delete a site with shifts. Remove or reassign the shifts first.');
    db.sites = db.sites.filter((s) => !(s.id === id && s.companyId === me.companyId));
    saveDb(db);
    return null;
  },

  async listShifts(token, params = {}) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    let rows = db.shifts.filter((s) => s.companyId === me.companyId);
    if (me.role === 'Staff') rows = rows.filter((s) => s.userId === me.id);
    else if (params.userId) rows = rows.filter((s) => s.userId === Number(params.userId));
    if (params.siteId) rows = rows.filter((s) => s.siteId === Number(params.siteId));
    if (params.from) rows = rows.filter((s) => new Date(s.endTime) >= new Date(params.from));
    if (params.to) rows = rows.filter((s) => new Date(s.startTime) <= new Date(params.to));
    rows.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return rows.map((s) => {
      const user = db.users.find((u) => u.id === s.userId);
      const site = db.sites.find((x) => x.id === s.siteId);
      return {
        id: s.id,
        userId: s.userId,
        userName: user?.name || '?',
        siteId: s.siteId,
        siteName: site?.name || '?',
        siteColor: site?.color || '#2563eb',
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.notes
      };
    });
  },

  async createShift(token, body) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role === 'Staff') return err('Forbidden');
    if (new Date(body.endTime) <= new Date(body.startTime)) return err('EndTime must be after StartTime.');
    if (!db.users.some((u) => u.id === body.userId && u.companyId === me.companyId)) return err('User not found in your company.');
    if (!db.sites.some((s) => s.id === body.siteId && s.companyId === me.companyId)) return err('Site not found in your company.');
    const shift = {
      id: db.counters.shift++,
      userId: body.userId,
      siteId: body.siteId,
      companyId: me.companyId,
      startTime: new Date(body.startTime).toISOString(),
      endTime: new Date(body.endTime).toISOString(),
      notes: body.notes?.trim() || null
    };
    db.shifts.push(shift);
    saveDb(db);
    return shift;
  },

  async updateShift(token, id, body) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role === 'Staff') return err('Forbidden');
    if (new Date(body.endTime) <= new Date(body.startTime)) return err('EndTime must be after StartTime.');
    const shift = db.shifts.find((s) => s.id === id && s.companyId === me.companyId);
    if (!shift) return err('Shift not found.');
    if (!db.users.some((u) => u.id === body.userId && u.companyId === me.companyId)) return err('User not found in your company.');
    if (!db.sites.some((s) => s.id === body.siteId && s.companyId === me.companyId)) return err('Site not found in your company.');
    shift.userId = body.userId;
    shift.siteId = body.siteId;
    shift.startTime = new Date(body.startTime).toISOString();
    shift.endTime = new Date(body.endTime).toISOString();
    shift.notes = body.notes?.trim() || null;
    saveDb(db);
    return shift;
  },

  async deleteShift(token, id) {
    await delay();
    const db = loadDb();
    const me = getSessionUser(db, token);
    if (!me) return err('Unauthorized');
    if (me.role === 'Staff') return err('Forbidden');
    db.shifts = db.shifts.filter((s) => !(s.id === id && s.companyId === me.companyId));
    saveDb(db);
    return null;
  }
};
