import { prisma } from '../../lib/prisma.js';

export const commentsRepository = {
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

  createComment(input: {
    taskId: string;
    body: string;
    authorId: string;
  }) {
    return prisma.comment.create({
      data: input,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  },

  listByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};
