'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useCategoriesQuery } from '../../../features/categories/hooks/use-categories-query';
import { type TaskListQuery, type TaskPriority, type TaskStatus } from '../../../features/tasks/api/tasks.api';
import { useTasksQuery } from '../../../features/tasks/hooks/use-tasks-query';
import { getApiErrorMessage } from '../../../lib/api-client';
import { formatDateTime, priorityLabel, statusLabel } from '../../../lib/format';

const pageSize = 10;

const statusOptions: Array<{ value: ''; label: string } | { value: TaskStatus; label: string }> = [
  { value: '', label: 'Tum durumlar' },
  { value: 'OPEN', label: 'Acik' },
  { value: 'IN_REVIEW', label: 'Inceleniyor' },
  { value: 'ASSIGNED', label: 'Atandi' },
  { value: 'IN_PROGRESS', label: 'Isleniyor' },
  { value: 'RESOLVED', label: 'Cozuldu' },
  { value: 'CLOSED', label: 'Kapandi' },
  { value: 'CANCELLED', label: 'Iptal' },
  { value: 'REOPENED', label: 'Tekrar Acildi' },
];

const priorityOptions: Array<{ value: ''; label: string } | { value: TaskPriority; label: string }> = [
  { value: '', label: 'Tum oncelikler' },
  { value: 'LOW', label: 'Dusuk' },
  { value: 'MEDIUM', label: 'Orta' },
  { value: 'HIGH', label: 'Yuksek' },
  { value: 'URGENT', label: 'Acil' },
];

interface FilterState {
  search: string;
  status: '' | TaskStatus;
  priority: '' | TaskPriority;
  categoryId: string;
}

function buildTaskQuery(filters: FilterState, page: number): TaskListQuery {
  return {
    page,
    pageSize,
    search: filters.search || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    categoryId: filters.categoryId || undefined,
  };
}

/**
 * Task listesi: filtreleme + arama + sayfalama.
 */
export default function TasksPage() {
  const categoriesQuery = useCategoriesQuery();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    categoryId: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);
  const [page, setPage] = useState(1);

  const query = useMemo(() => buildTaskQuery(appliedFilters, page), [appliedFilters, page]);
  const tasksQuery = useTasksQuery(query);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const canGoPrev = page > 1;
  const totalPages = tasksQuery.data?.meta.totalPages ?? 1;
  const canGoNext = page < totalPages;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Talepler</h1>
          <p className="mt-1 text-sm text-slate-600">Role gore scoped listeleme backend tarafinda yapilir.</p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Yeni Talep
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-5">
        <input
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          placeholder="Arama..."
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
        />

        <select
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as FilterState['status'] }))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
        >
          {statusOptions.map((option) => (
            <option key={option.value || 'all-status'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, priority: event.target.value as FilterState['priority'] }))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
        >
          {priorityOptions.map((option) => (
            <option key={option.value || 'all-priority'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.categoryId}
          onChange={(event) => setFilters((prev) => ({ ...prev, categoryId: event.target.value }))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
        >
          <option value="">Tum kategoriler</option>
          {categoriesQuery.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleApplyFilters}
          className="rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Filtrele
        </button>
      </div>

      {tasksQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(tasksQuery.error)}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-100">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2">Talep</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Durum</th>
              <th className="px-3 py-2">Oncelik</th>
              <th className="px-3 py-2">Olusturma</th>
              <th className="px-3 py-2">SLA</th>
            </tr>
          </thead>
          <tbody>
            {tasksQuery.isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-sm text-slate-500">
                  Yukleniyor...
                </td>
              </tr>
            ) : tasksQuery.data?.items.length ? (
              tasksQuery.data.items.map((task) => (
                <tr key={task.id} className="border-t border-slate-200 text-sm">
                  <td className="px-3 py-2">
                    <Link href={`/tasks/${task.id}`} className="font-medium text-brand-700 hover:underline">
                      {task.description.slice(0, 70)}
                    </Link>
                    <div className="mt-1 text-xs text-slate-500">Daire: {task.apartmentNo}</div>
                  </td>
                  <td className="px-3 py-2">{task.category.name}</td>
                  <td className="px-3 py-2">{statusLabel(task.status)}</td>
                  <td className="px-3 py-2">{priorityLabel(task.priority)}</td>
                  <td className="px-3 py-2">{formatDateTime(task.createdAt)}</td>
                  <td className="px-3 py-2">
                    <span className={task.isOverdue ? 'font-semibold text-red-600' : 'text-slate-700'}>
                      {formatDateTime(task.deadlineAt)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-sm text-slate-500">
                  Kayit bulunamadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Toplam: <span className="font-semibold">{tasksQuery.data?.meta.total ?? 0}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
          >
            Onceki
          </button>
          <span className="text-sm text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </section>
  );
}
