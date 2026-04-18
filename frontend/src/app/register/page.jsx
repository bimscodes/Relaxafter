'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(k, v) { setForm((s) => ({ ...s, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create your company</h1>
        <p className="mt-1 text-sm text-slate-500">You'll be the admin for this workspace.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Company name" value={form.companyName} onChange={(v) => update('companyName', v)} required />
          <Field label="Your name" value={form.name} onChange={(v) => update('name', v)} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
          <Field label="Password" type="password" value={form.password} onChange={(v) => update('password', v)} required minLength={8} />

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
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
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        {...rest}
      />
    </label>
  );
}
