import type { TaskStatus } from '@prisma/client';

export interface ReportsQuery {
  month: number;
  year: number;
}

export interface CategoryDistributionItem {
  categoryId: string;
  categoryName: string;
  taskCount: number;
}

export interface StatusDistributionItem {
  status: TaskStatus;
  taskCount: number;
}

export interface ResolutionTrendItem {
  date: string;
  resolvedCount: number;
}

export interface SlaPerformance {
  totalConsidered: number;
  onTime: number;
  overdue: number;
  onTimeRate: number;
}

export interface ReportsOverviewResponse {
  period: {
    month: number;
    year: number;
    startAt: string;
    endAt: string;
  };
  categoryDistribution: CategoryDistributionItem[];
  statusDistribution: StatusDistributionItem[];
  averageResolutionHours: number | null;
  resolvedCount: number;
  resolutionTrend: ResolutionTrendItem[];
  slaPerformance: SlaPerformance;
}
