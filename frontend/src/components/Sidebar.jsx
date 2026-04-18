'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '◼' },
  { href: '/calendar', label: 'Calendar', icon: '▤' },
  { href: '/users', label: 'Users', icon: '●', managerOnly: true },
  { href: '/sites', label: 'Sites', icon: '◆', managerOnly: true }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isManagerOrAdmin, logout } = useAuth();

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-brand-500"></div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Relaxafter</div>
            <div className="text-xs text-slate-500">{user?.companyName}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {NAV.filter((n) => !n.managerOnly || isManagerOrAdmin).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                active ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="text-sm font-medium text-slate-800">{user?.name}</div>
        <div className="text-xs text-slate-500">{user?.role}</div>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
