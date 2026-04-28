import { TaskStatus } from '@prisma/client';

import { reportsRepository } from './reports.repository.js';
import type {
  CategoryDistributionItem,
  ReportsOverviewResponse,
  ReportsQuery,
  ResolutionTrendItem,
  SlaPerformance,
  StatusDistributionItem,
} from './reports.types.js';

const buildPeriod = (query: ReportsQuery): { startAt: Date; endAt: Date } => {
  const startAt = new Date(query.year, query.month - 1, 1, 0, 0, 0, 0);
  const endAt = new Date(query.year, query.month, 1, 0, 0, 0, 0);

  return { startAt, endAt };
};

const toIsoDate = (value: Date): string => {
  return value.toISOString().slice(0, 10);
};

const calculateAverageResolutionHours = (
  records: Array<{
    createdAt: Date;
    resolvedAt: Date | null;
  }>,
): number | null => {
  const resolved = records.filter((item) => item.resolvedAt);
  if (!resolved.length) {
    return null;
  }

  const totalHours = resolved.reduce((sum, item) => {
    const diffMs = item.resolvedAt!.getTime() - item.createdAt.getTime();
    return sum + diffMs / (1000 * 60 * 60);
  }, 0);

  return Number((totalHours / resolved.length).toFixed(2));
};

const calculateResolutionTrend = (
  records: Array<{
    resolvedAt: Date | null;
  }>,
): ResolutionTrendItem[] => {
  const grouped = new Map<string, number>();

  for (const record of records) {
    if (!record.resolvedAt) {
      continue;
    }

    const key = toIsoDate(record.resolvedAt);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, resolvedCount]) => ({ date, resolvedCount }));
};

const calculateSlaPerformance = (
  now: Date,
  records: Array<{
    status: TaskStatus;
    createdAt: Date;
    resolvedAt: Date | null;
    closedAt: Date | null;
    category: {
      slaHours: number;
    };
  }>,
): SlaPerformance => {
  const considered = records.filter((item) => item.status !== TaskStatus.CANCELLED);
  if (!considered.length) {
    return {
      totalConsidered: 0,
      onTime: 0,
      overdue: 0,
      onTimeRate: 0,
    };
  }

  let onTime = 0;

  for (const item of considered) {
    const deadlineAt = new Date(item.createdAt.getTime() + item.category.slaHours * 60 * 60 * 1000);
    const finishedAt = item.resolvedAt ?? item.closedAt;
    const compareDate = finishedAt ?? now;

    if (compareDate.getTime() <= deadlineAt.getTime()) {
      onTime += 1;
    }
  }

  const overdue = considered.length - onTime;
  const onTimeRate = Number(((onTime / considered.length) * 100).toFixed(2));

  return {
    totalConsidered: considered.length,
    onTime,
    overdue,
    onTimeRate,
  };
};

export const reportsService = {
  async getOverview(query: ReportsQuery): Promise<ReportsOverviewResponse> {
    const period = buildPeriod(query);

    const [categoryRows, statusRows, tasks] = await Promise.all([
      reportsRepository.getCategoryDistribution(period),
      reportsRepository.getStatusDistribution(period),
      reportsRepository.getTasksForMetrics(period),
    ]);

    const categories = await reportsRepository.getCategoriesByIds(
      categoryRows.map((row) => row.categoryId),
    );
    const categoryMap = new Map(categories.map((item) => [item.id, item.name]));

    const categoryDistribution: CategoryDistributionItem[] = categoryRows
      .map((row) => ({
        categoryId: row.categoryId,
        categoryName: categoryMap.get(row.categoryId) ?? 'Unknown',
        taskCount: row._count._all,
      }))
      .sort((a, b) => b.taskCount - a.taskCount);

    const statusDistribution: StatusDistributionItem[] = statusRows
      .map((row) => ({
        status: row.status,
        taskCount: row._count._all,
      }))
      .sort((a, b) => b.taskCount - a.taskCount);

    const averageResolutionHours = calculateAverageResolutionHours(tasks);
    const resolvedCount = tasks.filter((item) => item.resolvedAt).length;
    const resolutionTrend = calculateResolutionTrend(tasks);
    const slaPerformance = calculateSlaPerformance(new Date(), tasks);

    return {
      period: {
        month: query.month,
        year: query.year,
        startAt: period.startAt.toISOString(),
        endAt: period.endAt.toISOString(),
      },
      categoryDistribution,
      statusDistribution,
      averageResolutionHours,
      resolvedCount,
      resolutionTrend,
      slaPerformance,
    };
  },
};
