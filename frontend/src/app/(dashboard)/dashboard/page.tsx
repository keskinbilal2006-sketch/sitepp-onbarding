'use client';

import Link from 'next/link';

import type { DashboardTaskItem } from '../../../features/dashboard/api/dashboard.api';
import { useDashboardOverviewQuery } from '../../../features/dashboard/hooks/use-dashboard-overview-query';
import { getApiErrorMessage } from '../../../lib/api-client';
import { formatDateTime, priorityLabel, statusLabel } from '../../../lib/format';

export default function DashboardPage() {
  const dashboardQuery = useDashboardOverviewQuery();
  const overview = dashboardQuery.data;
  const role = overview?.role;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          {role === 'ADMIN'
            ? 'Tum talepler, SLA durumu ve aylik performans ozeti.'
            : role === 'STAFF'
              ? 'Sana atanmis islerin ve kritik durumlarin ozeti.'
              : 'Kendi taleplerinin guncel durumu.'}
        </p>
      </div>

      {dashboardQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(dashboardQuery.error)}
        </div>
      ) : null}

      {dashboardQuery.isLoading ? <p className="text-sm text-slate-500">Dashboard yukleniyor...</p> : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <MetricCard label="Aktif Talep" value={overview?.summary.activeTasks ?? 0} />
        <MetricCard
          label="Geciken"
          value={overview?.summary.overdueTasks ?? 0}
          tone={overview?.summary.overdueTasks ? 'danger' : 'normal'}
        />
        <MetricCard label="Cozulen/Kapanan" value={overview?.summary.resolvedOrClosedTasks ?? 0} />
        <MetricCard
          label="Yuksek Oncelik"
          value={overview?.summary.highPriorityTasks ?? 0}
          tone={overview?.summary.highPriorityTasks ? 'warning' : 'normal'}
        />
      </div>

      {role === 'ADMIN' && overview ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard
            label="SLA Basari"
            value={overview.summary.slaOnTimeRate === null ? '-' : `%${overview.summary.slaOnTimeRate}`}
            tone={overview.summary.overdueTasks ? 'warning' : 'normal'}
          />
          <MetricCard label="Son Talep" value={overview.recentTasks.length} />
          <MetricCard label="Geciken Liste" value={overview.overdueTasks.length} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Geciken Talepler</h2>
            <Link href="/tasks" className="text-sm font-medium text-brand-700 hover:underline">
              Tumunu gor
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {!dashboardQuery.isLoading && overview?.overdueTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Geciken talep yok.</p>
            ) : null}
            {overview?.overdueTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <h2 className="text-base font-semibold text-slate-900">Son Talepler</h2>
          <div className="mt-3 space-y-2">
            {!dashboardQuery.isLoading && overview?.recentTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Henuz talep yok.</p>
            ) : null}
            {overview?.recentTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  tone = 'normal',
}: {
  label: string;
  value: number | string;
  tone?: 'normal' | 'warning' | 'danger';
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-slate-200 bg-white text-slate-900';

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <p className="text-sm text-slate-600"> {label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TaskRow({ task }: { task: DashboardTaskItem }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-md border border-slate-200 bg-slate-50 p-2 hover:border-brand-300"
    >
      <p className="line-clamp-1 text-sm font-medium text-slate-900">{task.description}</p>
      <p className="mt-1 text-xs text-slate-600">
        {statusLabel(task.status)} - {priorityLabel(task.priority)} - SLA {formatDateTime(task.deadlineAt)}
      </p>
    </Link>
  );
}
