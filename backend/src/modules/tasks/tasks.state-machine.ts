import { TaskStatus } from '@prisma/client';

import type { AuthUser } from '../../middleware/auth.middleware.js';
import { AppError } from '../../middleware/error.middleware.js';

interface TransitionContext {
  user: AuthUser;
  currentStatus: TaskStatus;
  nextStatus: TaskStatus;
  ownerId: string;
  assigneeId: string | null;
  nextAssigneeId?: string;
}

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  OPEN: [TaskStatus.IN_REVIEW, TaskStatus.CANCELLED],
  IN_REVIEW: [TaskStatus.ASSIGNED, TaskStatus.CANCELLED],
  ASSIGNED: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  IN_PROGRESS: [TaskStatus.RESOLVED, TaskStatus.CANCELLED],
  RESOLVED: [TaskStatus.CLOSED, TaskStatus.REOPENED],
  CLOSED: [TaskStatus.REOPENED],
  CANCELLED: [],
  REOPENED: [TaskStatus.IN_REVIEW, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
};

const assertTransitionAllowedByGraph = (
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
): void => {
  if (currentStatus === nextStatus) {
    throw new AppError(400, 'InvalidTransition', 'Task is already in this status.');
  }

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new AppError(
      400,
      'InvalidTransition',
      `Transition ${currentStatus} -> ${nextStatus} is not allowed.`,
    );
  }
};

// Tum durum degisiklikleri buradan gecsin ki kurallar tek yerde yasasin.
export const assertTaskTransitionAllowed = (context: TransitionContext): void => {
  assertTransitionAllowedByGraph(context.currentStatus, context.nextStatus);

  if (context.user.role === 'ADMIN') {
    if (context.nextStatus === TaskStatus.ASSIGNED && !context.nextAssigneeId) {
      throw new AppError(400, 'ValidationError', 'assignedStaffId is required for ASSIGNED.');
    }
    return;
  }

  if (context.user.role === 'STAFF') {
    if (context.assigneeId !== context.user.id) {
      throw new AppError(403, 'Forbidden', 'You can only change tasks assigned to you.');
    }

    const staffAllowed =
      (context.currentStatus === TaskStatus.ASSIGNED ||
        context.currentStatus === TaskStatus.REOPENED) &&
      context.nextStatus === TaskStatus.IN_PROGRESS;
    const resolveAllowed =
      context.currentStatus === TaskStatus.IN_PROGRESS && context.nextStatus === TaskStatus.RESOLVED;

    if (!staffAllowed && !resolveAllowed) {
      throw new AppError(403, 'Forbidden', 'This status change is not allowed for staff.');
    }

    return;
  }

  if (context.ownerId !== context.user.id) {
    throw new AppError(403, 'Forbidden', 'You can only change your own tasks.');
  }

  const residentAllowed =
    (context.currentStatus === TaskStatus.OPEN || context.currentStatus === TaskStatus.IN_REVIEW) &&
    context.nextStatus === TaskStatus.CANCELLED;
  const closeAllowed =
    context.currentStatus === TaskStatus.RESOLVED && context.nextStatus === TaskStatus.CLOSED;
  const reopenAllowed =
    (context.currentStatus === TaskStatus.RESOLVED || context.currentStatus === TaskStatus.CLOSED) &&
    context.nextStatus === TaskStatus.REOPENED;

  if (!residentAllowed && !closeAllowed && !reopenAllowed) {
    throw new AppError(403, 'Forbidden', 'This status change is not allowed for residents.');
  }
};
