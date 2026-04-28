import type { UserRole } from '../../../types';
import type { TaskDetail, TaskStatus } from '../api/tasks.api';

interface TransitionContext {
  role: UserRole;
  userId: string;
  task: TaskDetail;
}

/**
 * Frontend'de kullaniciya gosterilecek muhtemel durum degisikliklerini hesaplar.
 * Son karar yine backend state machine tarafindadir.
 */
export function getAllowedNextStatuses(context: TransitionContext): TaskStatus[] {
  const { role, userId, task } = context;
  const current = task.status;

  if (role === 'ADMIN') {
    const adminGraph: Record<TaskStatus, TaskStatus[]> = {
      OPEN: ['IN_REVIEW', 'CANCELLED'],
      IN_REVIEW: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
      RESOLVED: ['CLOSED', 'REOPENED'],
      CLOSED: ['REOPENED'],
      CANCELLED: [],
      REOPENED: ['IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
    };
    return adminGraph[current];
  }

  if (role === 'STAFF') {
    // Staff sadece kendisine atanmis task'ta aksiyon alabilir.
    if (!task.assignedStaff || task.assignedStaff.id !== userId) {
      return [];
    }

    if (current === 'ASSIGNED' || current === 'REOPENED') {
      return ['IN_PROGRESS'];
    }

    if (current === 'IN_PROGRESS') {
      return ['RESOLVED'];
    }

    return [];
  }

  // Resident sadece kendi task'inda aksiyon alabilir.
  if (task.resident.id !== userId) {
    return [];
  }

  if (current === 'OPEN' || current === 'IN_REVIEW') {
    return ['CANCELLED'];
  }

  if (current === 'RESOLVED') {
    return ['CLOSED', 'REOPENED'];
  }

  if (current === 'CLOSED') {
    return ['REOPENED'];
  }

  return [];
}
