import { TaskStatus } from '@prisma/client';

import type { AuthUser } from '../../middleware/auth.middleware.js';
import { dashboardRepository } from './dashboard.repository.js';
import type { DashboardOverviewResponse, DashboardTaskItem } from './dashboard.types.js';

const activeStatuses = new Set<TaskStatus>([
  TaskStatus.OPEN,
  TaskStatus.IN_REVIEW,
  TaskStatus.ASSIGNED,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REOPENED,
]);

const terminalStatuses = new Set<TaskStatus>([
  TaskStatus.RESOLVED,
  TaskStatus.CLOSED,
  TaskStatus.CANCELLED,
]);

const buildScopedWhere = (user: AuthUser) => {
  if (user.role === 'RESIDENT') {
    return { residentId: user.id };
  }

  if (user.role === 'STAFF') {
    return { assignedStaffId: user.id };
  }

  return {};
};

const toDashboardTask = (
  task: Awaited<ReturnType<typeof dashboardRepository.findTasks>>[number],
): DashboardTaskItem => {
  const deadline = new Date(task.createdAt.getTime() + task.category.slaHours * 60 * 60 * 1000);
  const isOverdue = !terminalStatuses.has(task.status) && Date.now() > deadline.getTime();

  return {
    id: task.id,
    description: task.description,
    status: task.status,
    priority: task.priority,
    categoryName: task.category.name,
    apartmentNo: task.apartmentNo,
    createdAt: task.createdAt.toISOString(),
    deadlineAt: deadline.toISOString(),
    isOverdue,
  };
};

const calculateSlaOnTimeRate = (tasks: DashboardTaskItem[]): number | null => {
  const considered = tasks.filter((task) => task.status !== TaskStatus.CANCELLED);

  if (!considered.length) {
    return null;
  }

  const onTime = considered.filter((task) => !task.isOverdue).length;
  return Number(((onTime / considered.length) * 100).toFixed(2));
};

export const dashboardService = {
  async getOverview(user: AuthUser): Promise<DashboardOverviewResponse> {
    const tasks = (await dashboardRepository.findTasks(buildScopedWhere(user))).map(toDashboardTask);

    const activeTasks = tasks.filter((task) => activeStatuses.has(task.status));
    const overdueTasks = tasks.filter((task) => task.isOverdue);
    const resolvedOrClosedTasks = tasks.filter(
      (task) => task.status === TaskStatus.RESOLVED || task.status === TaskStatus.CLOSED,
    );
    const highPriorityTasks = tasks.filter(
      (task) => task.priority === 'HIGH' || task.priority === 'URGENT',
    );

    return {
      role: user.role,
      summary: {
        activeTasks: activeTasks.length,
        overdueTasks: overdueTasks.length,
        resolvedOrClosedTasks: resolvedOrClosedTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        slaOnTimeRate: calculateSlaOnTimeRate(tasks),
      },
      recentTasks: tasks.slice(0, 5),
      overdueTasks: overdueTasks.slice(0, 5),
    };
  },
};
