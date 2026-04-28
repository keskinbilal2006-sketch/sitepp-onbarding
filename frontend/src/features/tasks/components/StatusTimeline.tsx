import { formatDateTime, statusLabel } from '../../../lib/format';
import type { TaskDetail } from '../api/tasks.api';

interface StatusTimelineProps {
  history: TaskDetail['statusHistory'];
}

/**
 * Status gecislerini kronolojik olarak listeler.
 */
export function StatusTimeline({ history }: StatusTimelineProps) {
  const sorted = [...history].sort((a, b) => +new Date(b.changedAt) - +new Date(a.changedAt));

  return (
    <section className="rounded-lg border border-slate-200 p-3">
      <h2 className="text-base font-semibold text-slate-900">Durum Gecmis</h2>
      <div className="mt-3 space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">Kayit yok.</p>
        ) : (
          sorted.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-2 text-sm">
              <div className="font-medium text-slate-800">
                {item.fromStatus ? statusLabel(item.fromStatus) : 'Baslangic'} {'->'} {statusLabel(item.toStatus)}
              </div>
              <div className="text-xs text-slate-600">
                {item.changedBy.name} - {formatDateTime(item.changedAt)}
              </div>
              {item.note ? <p className="mt-1 text-xs text-slate-700">Not: {item.note}</p> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
