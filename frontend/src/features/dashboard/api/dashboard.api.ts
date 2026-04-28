import { apiClient } from '../../../lib/api-client';
import type { TaskPriority, TaskStatus } from '../../tasks/api/tasks.api';
import type { UserRole } from '../../../types';

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

export interface DashboardOverview {
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

export const dashboardApi = {
  async overview(): Promise<DashboardOverview> {
    const { data } = await apiClient.get<DashboardOverview>('/dashboard/overview');
    return data;
  },
};
