'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const ROLES = ['Admin', 'Manager', 'Staff'];

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      setUsers(await api.listUsers());
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      load();
    } catch (err) { alert(err.message); }
  }

  return (
    <AppShell requireRole={['Admin', 'Manager']}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Manage staff, managers, and admins.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            New user
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditing(u); setShowForm(true); }}
                      className="mr-3 text-brand-600 hover:underline"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline"
                    >Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </AppShell>
  );
}

function RoleBadge({ role }) {
  const map = {
    Admin: 'bg-purple-100 text-purple-700',
    Manager: 'bg-blue-100 text-blue-700',
    Staff: 'bg-slate-100 text-slate-700'
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[role] || map.Staff}`}>{role}</span>;
}

function UserForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    role: initial?.role || 'Staff'
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(k, v) { setForm((s) => ({ ...s, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (initial) {
        const payload = { ...form, password: form.password || null };
        await api.updateUser(initial.id, payload);
      } else {
        await api.createUser(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? 'Edit user' : 'New user'}
      footer={
        <>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-1.5 text-sm">Cancel</button>
          <button
            form="user-form"
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >{saving ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="space-y-3">
        <Field label="Name" value={form.name} onChange={(v) => update('name', v)} required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
        <Field
          label={initial ? 'New password (leave blank to keep)' : 'Password'}
          type="password"
          value={form.password}
          onChange={(v) => update('password', v)}
          required={!initial}
          minLength={initial ? 0 : 8}
        />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </form>
    </Modal>
  );
}

function Field({ label, type = 'text', value, onChange, ...rest }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        {...rest}
      />
    </label>
  );
}
