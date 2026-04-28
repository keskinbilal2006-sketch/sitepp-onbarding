import { TaskStatus, type Prisma, type UserRole } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

const activeTaskStatuses: TaskStatus[] = [
  TaskStatus.OPEN,
  TaskStatus.IN_REVIEW,
  TaskStatus.ASSIGNED,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REOPENED,
];

export const usersRepository = {
  async findUsers(input: {
    role?: UserRole;
    search?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.UserWhereInput = {};

    if (input.role) {
      where.role = input.role;
    }

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: 'insensitive' } },
        { email: { contains: input.search, mode: 'insensitive' } },
        { apartmentNo: { contains: input.search, mode: 'insensitive' } },
        { phone: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          apartmentNo: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              assignedTasks: {
                where: {
                  status: {
                    in: activeTaskStatuses,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },
};
