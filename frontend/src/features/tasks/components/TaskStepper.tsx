import { formatDateTime } from '../../../lib/format';
import type { TaskDetail, TaskStatus } from '../api/tasks.api';

type StepKey = 'received' | 'review' | 'assigned' | 'inProgress' | 'completed';

const steps: Array<{ key: StepKey; label: string }> = [
  { key: 'received', label: '1. Alindi' },
  { key: 'review', label: '2. Inceleniyor' },
  { key: 'assigned', label: '3. Atandi' },
  { key: 'inProgress', label: '4. Cozum surecinde' },
  { key: 'completed', label: '5. Tamamlandi' },
];

const stepStatusMap: Record<StepKey, TaskStatus[]> = {
  received: ['OPEN'],
  review: ['IN_REVIEW'],
  assigned: ['ASSIGNED'],
  inProgress: ['IN_PROGRESS', 'REOPENED'],
  completed: ['RESOLVED', 'CLOSED'],
};

function getActiveStepIndex(status: TaskStatus): number {
  if (status === 'OPEN') return 0;
  if (status === 'IN_REVIEW') return 1;
  if (status === 'ASSIGNED') return 2;
  if (status === 'IN_PROGRESS' || status === 'REOPENED') return 3;
  if (status === 'RESOLVED' || status === 'CLOSED' || status === 'CANCELLED') return 4;
  return 0;
}

interface StepMeta {
  changedByName?: string;
  changedAt?: string;
}

interface TaskStepperProps {
  status: TaskStatus;
  statusHistory: TaskDetail['statusHistory'];
}

/**
 * Backend'deki 8 status'u UI'da 5 adimli stepper olarak gosterir.
 */
export function TaskStepper({ status, statusHistory }: TaskStepperProps) {
  const activeStepIndex = getActiveStepIndex(status);

  const stepMeta = steps.reduce<Record<StepKey, StepMeta>>((acc, step) => {
    const matchedHistory = statusHistory.find((item) => stepStatusMap[step.key].includes(item.toStatus));
    acc[step.key] = matchedHistory
      ? {
          changedByName: matchedHistory.changedBy.name,
          changedAt: matchedHistory.changedAt,
        }
      : {};
    return acc;
  }, {} as Record<StepKey, StepMeta>);

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Aktif Status: {status}</span>
        {status === 'CANCELLED' ? (
          <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">Iptal Edildi</span>
        ) : null}
        {status === 'REOPENED' ? (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Tekrar Acildi</span>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const isDone = index < activeStepIndex;
          const isCurrent = index === activeStepIndex;
          const meta = stepMeta[step.key];

          return (
            <div key={step.key} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </span>
                <span className="text-sm font-medium text-slate-800">{step.label}</span>
              </div>

              {meta.changedAt ? (
                <p className="mt-2 text-xs text-slate-600">
                  {meta.changedByName} - {formatDateTime(meta.changedAt)}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Henuz yok</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
