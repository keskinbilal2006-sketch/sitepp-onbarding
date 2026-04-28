import type { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { TaskStatus as PrismaTaskStatus } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

const taskInclude = {
  category: true,
  resident: {
    select: {
      id: true,
      email: true,
      name: true,
      apartmentNo: true,
      role: true,
    },
  },
  assignedStaff: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
} satisfies Prisma.TaskInclude;

const detailTaskInclude = {
  ...taskInclude,
  statusHistory: {
    include: {
      changedBy: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: { changedAt: 'asc' },
  },
  comments: {
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      attachments: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
  attachments: {
    where: { commentId: null },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.TaskInclude;

export const tasksRepository = {
  findCategoryById(categoryId: string) {
    return prisma.category.findUnique({ where: { id: categoryId } });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },

  createTaskWithInitialHistory(input: {
    description: string;
    priority: TaskPriority;
    apartmentNo: string;
    categoryId: string;
    residentId: string;
    createdById: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          description: input.description,
          priority: input.priority,
          apartmentNo: input.apartmentNo,
          categoryId: input.categoryId,
          residentId: input.residentId,
          status: PrismaTaskStatus.OPEN,
        },
        include: taskInclude,
      });

      await tx.taskStatusHistory.create({
        data: {
          taskId: task.id,
          fromStatus: null,
          toStatus: PrismaTaskStatus.OPEN,
          changedById: input.createdById,
          note: 'Task created',
        },
      });

      return task;
    });
  },

  findTaskById(taskId: string) {
    return prisma.task.findUnique({
      where: { id: taskId },
      include: detailTaskInclude,
    });
  },

  findTaskAccessMeta(taskId: string) {
    return prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        residentId: true,
        assignedStaffId: true,
      },
    });
  },

  findTasks(input: {
    where: Prisma.TaskWhereInput;
    page: number;
    pageSize: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const [total, items] = await Promise.all([
        tx.task.count({ where: input.where }),
        tx.task.findMany({
          where: input.where,
          include: taskInclude,
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
      ]);

      return { total, items };
    });
  },

  updateTaskStatusWithHistory(input: {
    taskId: string;
    currentStatus: TaskStatus;
    nextStatus: TaskStatus;
    note?: string;
    changedById: string;
    assignedStaffId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id: input.taskId },
        data: {
          status: input.nextStatus,
          assignedStaffId: input.assignedStaffId,
          resolvedAt: input.nextStatus === PrismaTaskStatus.RESOLVED ? new Date() : undefined,
          closedAt: input.nextStatus === PrismaTaskStatus.CLOSED ? new Date() : undefined,
          cancelledAt: input.nextStatus === PrismaTaskStatus.CANCELLED ? new Date() : undefined,
        },
        include: taskInclude,
      });

      await tx.taskStatusHistory.create({
        data: {
          taskId: input.taskId,
          fromStatus: input.currentStatus,
          toStatus: input.nextStatus,
          changedById: input.changedById,
          note: input.note,
        },
      });

      return task;
    });
  },
};
