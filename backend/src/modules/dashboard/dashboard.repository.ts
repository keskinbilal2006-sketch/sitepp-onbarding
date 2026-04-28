import type { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

export const dashboardRepository = {
  findTasks(where: Prisma.TaskWhereInput) {
    return prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        category: {
          select: {
            name: true,
            slaHours: true,
          },
        },
      },
    });
  },
};
