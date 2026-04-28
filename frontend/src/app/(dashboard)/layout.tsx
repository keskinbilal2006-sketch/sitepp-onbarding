'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { authApi } from '../../features/auth/api/auth.api';
import { useMeQuery } from '../../features/auth/hooks/use-me-query';
import { clearAuthSession, getRefreshToken, getStoredRole, getStoredUserName } from '../../lib/auth-session';
import { canAccessRoute } from '../../lib/permissions';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Talepler' },
  { href: '/tasks/new', label: 'Yeni Talep' },
  { href: '/staff', label: 'Gorevliler' },
  { href: '/reports', label: 'Raporlar' },
];

/**
 * Dashboard grubu ortak layout:
 * - Sol menu
 * - Kullanici bilgisi
 * - Cikis butonu
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const meQuery = useMeQuery();
  const fallbackRole = getStoredRole();
  const fallbackName = getStoredUserName();
  const effectiveRole = meQuery.data?.role ?? fallbackRole;
  const effectiveName = meQuery.data?.name ?? fallbackName ?? 'Kullanici';

  const allowedItems = navItems.filter((item) => canAccessRoute(effectiveRole, item.href));

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      clearAuthSession();
      router.replace('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-slate-900">SITEPP Panel</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {effectiveRole ? `${effectiveName} (${effectiveRole})` : effectiveName}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              onClick={handleLogout}
            >
              Cikis
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <nav className="space-y-1">
            {allowedItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-xl border border-slate-200 bg-white p-4">{children}</main>
      </div>
    </div>
  );
}
