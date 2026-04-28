import { apiClient } from '../../../lib/api-client';
import type { TaskStatus } from '../../tasks/api/tasks.api';

export interface ReportsOverviewQuery {
  month: number;
  year: number;
}

export interface ReportsOverview {
  period: {
    month: number;
    year: number;
    startAt: string;
    endAt: string;
  };
  categoryDistribution: Array<{
    categoryId: string;
    categoryName: string;
    taskCount: number;
  }>;
  statusDistribution: Array<{
    status: TaskStatus;
    taskCount: number;
  }>;
  averageResolutionHours: number | null;
  resolvedCount: number;
  resolutionTrend: Array<{
    date: string;
    resolvedCount: number;
  }>;
  slaPerformance: {
    totalConsidered: number;
    onTime: number;
    overdue: number;
    onTimeRate: number;
  };
}

export const reportsApi = {
  async overview(query: ReportsOverviewQuery): Promise<ReportsOverview> {
    const { data } = await apiClient.get<ReportsOverview>('/reports/overview', { params: query });
    return data;
  },
};
