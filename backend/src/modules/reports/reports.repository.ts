import type { TaskStatus } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

export const reportsRepository = {
  getCategoryDistribution(period: { startAt: Date; endAt: Date }) {
    return prisma.task.groupBy({
      by: ['categoryId'],
      where: {
        createdAt: {
          gte: period.startAt,
          lt: period.endAt,
        },
      },
      _count: {
        _all: true,
      },
    });
  },

  getStatusDistribution(period: { startAt: Date; endAt: Date }) {
    return prisma.task.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: period.startAt,
          lt: period.endAt,
        },
      },
      _count: {
        _all: true,
      },
    });
  },

  getCategoriesByIds(ids: string[]) {
    return prisma.category.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
      },
    });
  },

  // Bu veri seti SLA ve cozum suresi hesaplari icin gereklidir.
  getTasksForMetrics(period: { startAt: Date; endAt: Date }) {
    return prisma.task.findMany({
      where: {
        createdAt: {
          gte: period.startAt,
          lt: period.endAt,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        category: {
          select: {
            id: true,
            slaHours: true,
          },
        },
      },
    });
  },
};

export type CategoryDistributionRecord = Awaited<
  ReturnType<typeof reportsRepository.getCategoryDistribution>
>[number];

export type StatusDistributionRecord = Awaited<
  ReturnType<typeof reportsRepository.getStatusDistribution>
>[number] & {
  status: TaskStatus;
};

export type TaskMetricsRecord = Awaited<ReturnType<typeof reportsRepository.getTasksForMetrics>>[number];
