'use client';

import { useState } from 'react';

import { useUsersQuery } from '../../../features/users/hooks/use-users-query';
import { getApiErrorMessage } from '../../../lib/api-client';

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const usersQuery = useUsersQuery({
    role: 'STAFF',
    search: search.trim() || undefined,
    page: 1,
    pageSize: 50,
  });

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Gorevli Yonetimi</h1>
        <p className="mt-1 text-sm text-slate-600">Aktif gorev yukunu takip et ve talep atamalarinda kullan.</p>
      </div>

      <label className="block max-w-md">
        <span className="mb-1 block text-sm text-slate-700">Gorevli ara</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ad, e-posta, telefon"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
        />
      </label>

      {usersQuery.isLoading ? <p className="text-sm text-slate-500">Gorevliler yukleniyor...</p> : null}

      {usersQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(usersQuery.error)}
        </div>
      ) : null}

      {usersQuery.data ? (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Ad Soyad</th>
                <th className="px-3 py-2 font-medium">E-posta</th>
                <th className="px-3 py-2 font-medium">Telefon</th>
                <th className="px-3 py-2 font-medium">Aktif Is</th>
                <th className="px-3 py-2 font-medium">Kullanici ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {usersQuery.data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    Gorevli bulunamadi.
                  </td>
                </tr>
              ) : (
                usersQuery.data.items.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">{staff.name}</td>
                    <td className="px-3 py-2 text-slate-700">{staff.email}</td>
                    <td className="px-3 py-2 text-slate-700">{staff.phone ?? '-'}</td>
                    <td className="px-3 py-2 text-slate-700">{staff.activeAssignedTaskCount}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{staff.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
