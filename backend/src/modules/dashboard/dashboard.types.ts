import type { TaskPriority, TaskStatus, UserRole } from '@prisma/client';

export interface DashboardTaskItem {
  id: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryName: string;
  apartmentNo: string;
  createdAt: string;
  deadlineAt: string;
  isOverdue: boolean;
}

export interface DashboardOverviewResponse {
  role: UserRole;
  summary: {
    activeTasks: number;
    overdueTasks: number;
    resolvedOrClosedTasks: number;
    highPriorityTasks: number;
    slaOnTimeRate: number | null;
  };
  recentTasks: DashboardTaskItem[];
  overdueTasks: DashboardTaskItem[];
}
