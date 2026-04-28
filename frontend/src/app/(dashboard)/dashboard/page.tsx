'use client';

import Link from 'next/link';

import { useMeQuery } from '../../../features/auth/hooks/use-me-query';
import { useReportsOverviewQuery } from '../../../features/reports/hooks/use-reports-overview-query';
import type { TaskPriority, TaskStatus } from '../../../features/tasks/api/tasks.api';
import { useTasksQuery } from '../../../features/tasks/hooks/use-tasks-query';
import { getApiErrorMessage } from '../../../lib/api-client';
import { formatDateTime, priorityLabel, statusLabel } from '../../../lib/format';

const now = new Date();
const currentPeriod = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
};

export default function DashboardPage() {
  const meQuery = useMeQuery();
  const tasksQuery = useTasksQuery({ page: 1, pageSize: 50 });
  const reportsQuery = useReportsOverviewQuery(currentPeriod, meQuery.data?.role === 'ADMIN');

  const tasks = tasksQuery.data?.items ?? [];
  const activeTasks = tasks.filter((task) => !['CLOSED', 'CANCELLED'].includes(task.status));
  const overdueTasks = tasks.filter((task) => task.isOverdue);
  const resolvedTasks = tasks.filter((task) => task.status === 'RESOLVED' || task.status === 'CLOSED');
  const urgentTasks = tasks.filter((task) => task.priority === 'URGENT' || task.priority === 'HIGH');
  const role = meQuery.data?.role;

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

      {tasksQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(tasksQuery.error)}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <MetricCard label="Aktif Talep" value={activeTasks.length} />
        <MetricCard label="Geciken" value={overdueTasks.length} tone={overdueTasks.length ? 'danger' : 'normal'} />
        <MetricCard label="Cozulen/Kapanan" value={resolvedTasks.length} />
        <MetricCard label="Yuksek Oncelik" value={urgentTasks.length} tone={urgentTasks.length ? 'warning' : 'normal'} />
      </div>

      {role === 'ADMIN' && reportsQuery.data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard
            label="SLA Basari"
            value={`%${reportsQuery.data.slaPerformance.onTimeRate}`}
            tone={reportsQuery.data.slaPerformance.overdue ? 'warning' : 'normal'}
          />
          <MetricCard label="Aylik Cozulen" value={reportsQuery.data.resolvedCount} />
          <MetricCard
            label="Ortalama Cozum"
            value={
              reportsQuery.data.averageResolutionHours === null
                ? '-'
                : `${reportsQuery.data.averageResolutionHours} saat`
            }
          />
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
            {tasksQuery.isLoading ? <p className="text-sm text-slate-500">Talepler yukleniyor...</p> : null}
            {!tasksQuery.isLoading && overdueTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Geciken talep yok.</p>
            ) : null}
            {overdueTasks.slice(0, 5).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <h2 className="text-base font-semibold text-slate-900">Son Talepler</h2>
          <div className="mt-3 space-y-2">
            {tasksQuery.isLoading ? <p className="text-sm text-slate-500">Talepler yukleniyor...</p> : null}
            {!tasksQuery.isLoading && tasks.length === 0 ? (
              <p className="text-sm text-slate-500">Henuz talep yok.</p>
            ) : null}
            {tasks.slice(0, 5).map((task) => (
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

function TaskRow({
  task,
}: {
  task: {
    id: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    deadlineAt: string;
  };
}) {
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
