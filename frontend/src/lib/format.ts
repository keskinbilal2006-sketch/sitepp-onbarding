import type { TaskPriority, TaskStatus } from '../features/tasks/api/tasks.api';

/**
 * UI'da tekrar eden metin donusumleri bu dosyada tutulur.
 */
export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    OPEN: 'Acik',
    IN_REVIEW: 'Inceleniyor',
    ASSIGNED: 'Atandi',
    IN_PROGRESS: 'Isleniyor',
    RESOLVED: 'Cozuldu',
    CLOSED: 'Kapandi',
    CANCELLED: 'Iptal',
    REOPENED: 'Tekrar Acildi',
  };

  return map[status];
}

export function priorityLabel(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    LOW: 'Dusuk',
    MEDIUM: 'Orta',
    HIGH: 'Yuksek',
    URGENT: 'Acil',
  };

  return map[priority];
}
