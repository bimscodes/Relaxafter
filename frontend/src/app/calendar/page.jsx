'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CalendarView = dynamic(() => import('@/components/CalendarView'), { ssr: false });

function toLocalInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CalendarPage() {
  const { isManagerOrAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [slot, setSlot] = useState(null);

  async function loadShifts() {
    try {
      const params = { userId: filterUser || undefined, siteId: filterSite || undefined };
      const shifts = await api.listShifts(params);
      setEvents(shifts.map((s) => ({
        id: s.id,
        title: `${s.userName} — ${s.siteName}`,
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        color: s.siteColor,
        resource: s
      })));
    } catch (err) { setError(err.message); }
  }

  useEffect(() => {
    api.listSites().then(setSites).catch(() => {});
    if (isManagerOrAdmin) api.listUsers().then(setUsers).catch(() => {});
  }, [isManagerOrAdmin]);

  useEffect(() => { loadShifts(); /* eslint-disable-next-line */ }, [filterUser, filterSite]);

  const handleSelectSlot = useCallback((slotInfo) => {
    if (!isManagerOrAdmin) return;
    setEditingShift(null);
    setSlot({ start: slotInfo.start, end: slotInfo.end });
    setModalOpen(true);
  }, [isManagerOrAdmin]);

  const handleSelectEvent = useCallback((event) => {
    setEditingShift(event.resource);
    setSlot(null);
    setModalOpen(true);
  }, []);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500">
            {isManagerOrAdmin ? 'Click a date to schedule a shift.' : 'Your schedule at a glance.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManagerOrAdmin && (
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">All staff</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">All sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="h-[calc(100vh-12rem)] rounded-xl bg-white p-2 shadow-sm">
        <CalendarView
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
        />
      </div>

      {modalOpen && (
        <ShiftModal
          initial={editingShift}
          slot={slot}
          users={users}
          sites={sites}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); loadShifts(); }}
          isManagerOrAdmin={isManagerOrAdmin}
        />
      )}
    </AppShell>
  );
}

function ShiftModal({ initial, slot, users, sites, onClose, onSaved, isManagerOrAdmin }) {
  const defaultStart = initial?.startTime || slot?.start || new Date();
  const defaultEnd = initial?.endTime || slot?.end || new Date(new Date(defaultStart).getTime() + 2 * 60 * 60 * 1000);

  const [form, setForm] = useState({
    userId: initial?.userId || (users[0]?.id ?? ''),
    siteId: initial?.siteId || (sites[0]?.id ?? ''),
    start: toLocalInput(defaultStart),
    end: toLocalInput(defaultEnd),
    notes: initial?.notes || ''
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const canEdit = isManagerOrAdmin;

  function update(k, v) { setForm((s) => ({ ...s, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        userId: Number(form.userId),
        siteId: Number(form.siteId),
        startTime: new Date(form.start).toISOString(),
        endTime: new Date(form.end).toISOString(),
        notes: form.notes || null
      };
      if (initial) await api.updateShift(initial.id, payload);
      else await api.createShift(payload);
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!initial || !confirm('Delete this shift?')) return;
    try {
      await api.deleteShift(initial.id);
      onSaved();
    } catch (err) { setError(err.message); }
  }

  const headerTitle = initial ? 'Shift details' : 'New shift';

  return (
    <Modal
      open
      onClose={onClose}
      title={headerTitle}
      footer={
        <>
          {canEdit && initial && (
            <button
              onClick={handleDelete}
              className="mr-auto rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >Delete</button>
          )}
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-1.5 text-sm">
            {canEdit ? 'Cancel' : 'Close'}
          </button>
          {canEdit && (
            <button
              form="shift-form"
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >{saving ? 'Saving…' : 'Save'}</button>
          )}
        </>
      }
    >
      <form id="shift-form" onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Staff</span>
          <select
            value={form.userId}
            onChange={(e) => update('userId', e.target.value)}
            required
            disabled={!canEdit}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-50"
          >
            <option value="">Select a staff member</option>
            {(canEdit ? users : initial ? [{ id: initial.userId, name: initial.userName }] : []).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Site</span>
          <select
            value={form.siteId}
            onChange={(e) => update('siteId', e.target.value)}
            required
            disabled={!canEdit}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-50"
          >
            <option value="">Select a site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Start</span>
            <input
              type="datetime-local"
              value={form.start}
              onChange={(e) => update('start', e.target.value)}
              required
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">End</span>
            <input
              type="datetime-local"
              value={form.end}
              onChange={(e) => update('end', e.target.value)}
              required
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-50"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            disabled={!canEdit}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-50"
          />
        </label>
        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      </form>
    </Modal>
  );
}
