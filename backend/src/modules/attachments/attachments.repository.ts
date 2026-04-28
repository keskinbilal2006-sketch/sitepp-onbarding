import { prisma } from '../../lib/prisma.js';

export const attachmentsRepository = {
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

  findCommentAccessMeta(commentId: string) {
    return prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        taskId: true,
        task: {
          select: {
            residentId: true,
            assignedStaffId: true,
          },
        },
      },
    });
  },

  createTaskAttachments(input: {
    taskId: string;
    uploadedById: string;
    files: Array<{
      originalName: string;
      fileName: string;
      mimeType: string;
      size: number;
      path: string;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const created = [];
      for (const file of input.files) {
        const item = await tx.attachment.create({
          data: {
            taskId: input.taskId,
            uploadedById: input.uploadedById,
            originalName: file.originalName,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.size,
            path: file.path,
          },
        });
        created.push(item);
      }
      return created;
    });
  },

  createCommentAttachments(input: {
    taskId: string;
    commentId: string;
    uploadedById: string;
    files: Array<{
      originalName: string;
      fileName: string;
      mimeType: string;
      size: number;
      path: string;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const created = [];
      for (const file of input.files) {
        const item = await tx.attachment.create({
          data: {
            taskId: input.taskId,
            commentId: input.commentId,
            uploadedById: input.uploadedById,
            originalName: file.originalName,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.size,
            path: file.path,
          },
        });
        created.push(item);
      }
      return created;
    });
  },

  listByTask(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  },
};
