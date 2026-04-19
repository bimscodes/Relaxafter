'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${accent ?? 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your team and roster.</p>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total staff" value={data?.totalStaff ?? '—'} />
        <StatCard label="Active sites" value={data?.activeSites ?? '—'} />
        <StatCard label="Total shifts" value={data?.totalShifts ?? '—'} />
        <StatCard label="Upcoming shifts" value={data?.upcomingShifts ?? '—'} accent="text-brand-600" />
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Quick start</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Create your cleaning sites on the Sites page.</li>
          <li>Invite staff members on the Users page.</li>
          <li>Open the Calendar and click a date to schedule a shift.</li>
        </ol>
      </div>
    </AppShell>
  );
}
