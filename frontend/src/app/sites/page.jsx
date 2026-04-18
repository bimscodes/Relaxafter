'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f472b6'];

export default function SitesPage() {
  const { isAdmin, isManagerOrAdmin } = useAuth();
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try { setSites(await api.listSites()); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this site?')) return;
    try {
      await api.deleteSite(id);
      load();
    } catch (err) { alert(err.message); }
  }

  return (
    <AppShell requireRole={['Admin', 'Manager']}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sites</h1>
          <p className="text-sm text-slate-500">Cleaning locations you manage.</p>
        </div>
        {isManagerOrAdmin && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            New site
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((s) => (
          <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color }} />
                <div>
                  <div className="font-medium text-slate-900">{s.name}</div>
                  <div className="text-sm text-slate-500">{s.address || '—'}</div>
                </div>
              </div>
            </div>
            {s.notes && <p className="mt-3 text-sm text-slate-600">{s.notes}</p>}
            {isManagerOrAdmin && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { setEditing(s); setShowForm(true); }}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                >Edit</button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >Delete</button>
                )}
              </div>
            )}
          </div>
        ))}
        {sites.length === 0 && (
          <div className="col-span-full rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No sites yet. Create your first one.
          </div>
        )}
      </div>

      {showForm && (
        <SiteForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </AppShell>
  );
}

function SiteForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    address: initial?.address || '',
    notes: initial?.notes || '',
    color: initial?.color || DEFAULT_COLORS[0]
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(k, v) { setForm((s) => ({ ...s, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (initial) await api.updateSite(initial.id, form);
      else await api.createSite(form);
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? 'Edit site' : 'New site'}
      footer={
        <>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-1.5 text-sm">Cancel</button>
          <button
            form="site-form"
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >{saving ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <form id="site-form" onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Address</span>
          <input value={form.address} onChange={(e) => update('address', e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <div>
          <span className="text-sm font-medium text-slate-700">Color</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('color', c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full border-2 ${form.color === c ? 'border-slate-900' : 'border-transparent'}`}
                aria-label={`Pick ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </form>
    </Modal>
  );
}
