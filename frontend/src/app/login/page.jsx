'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { role: 'Admin',   email: 'admin@demo.com',   password: 'demo1234' },
  { role: 'Manager', email: 'manager@demo.com', password: 'demo1234' },
  { role: 'Staff',   email: 'staff@demo.com',   password: 'demo1234' }
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  function quickLogin(acct) {
    setEmail(acct.email);
    setPassword(acct.password);
  }

  function handleReset() {
    if (!confirm('Reset all demo data to its initial state?')) return;
    api.resetDemo();
    setEmail('');
    setPassword('');
    setError(null);
    alert('Demo data has been reset.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="mb-1 font-semibold">Demo mode</div>
          <p className="mb-2">All data lives in your browser (localStorage). Try a pre-seeded account:</p>
          <div className="space-y-1">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => quickLogin(a)}
                className="block w-full rounded border border-amber-300 bg-white px-2 py-1 text-left font-mono text-[11px] hover:bg-amber-100"
              >
                <span className="font-sans font-semibold">{a.role}:</span> {a.email} / {a.password}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 text-[11px] font-medium text-amber-900 underline hover:no-underline"
          >Reset demo data</button>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage your roster.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="you@company.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to Relaxafter?{' '}
          <Link href="/register" className="text-brand-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
