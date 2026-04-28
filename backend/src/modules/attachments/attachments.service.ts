import { can } from '../../lib/permissions.js';
import { storageService } from '../../lib/storage.js';
import type { AuthUser } from '../../middleware/auth.middleware.js';
import { AppError } from '../../middleware/error.middleware.js';
import { attachmentsRepository } from './attachments.repository.js';
import type { AttachmentView, UploadFilesResult } from './attachments.types.js';

const toView = (item: {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  taskId: string | null;
  commentId: string | null;
  uploadedById: string;
  createdAt: Date;
}): AttachmentView => {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
  };
};

const normalizeUploadedFiles = async (
  files: Express.Multer.File[],
): Promise<
  Array<{
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    path: string;
  }>
> => {
  const normalized = [];
  for (const file of files) {
    const stored = await storageService.saveUploadedFile(file);
    normalized.push({
      originalName: stored.originalName,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      size: stored.size,
      path: stored.absolutePath,
    });
  }
  return normalized;
};

export const attachmentsService = {
  async uploadToTask(
    user: AuthUser,
    taskId: string,
    files: Express.Multer.File[],
  ): Promise<UploadFilesResult> {
    if (!files.length) {
      throw new AppError(400, 'ValidationError', 'At least one file is required.');
    }

    const task = await attachmentsRepository.findTaskAccessMeta(taskId);
    if (!task) {
      throw new AppError(404, 'NotFound', 'Task not found.');
    }

    if (
      !can(user, 'create', 'attachment', {
        ownerId: task.residentId,
        assigneeId: task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to upload files.');
    }

    const normalizedFiles = await normalizeUploadedFiles(files);
    const created = await attachmentsRepository.createTaskAttachments({
      taskId,
      uploadedById: user.id,
      files: normalizedFiles,
    });

    return { created: created.map((item) => toView(item)) };
  },

  async uploadToComment(
    user: AuthUser,
    commentId: string,
    files: Express.Multer.File[],
  ): Promise<UploadFilesResult> {
    if (!files.length) {
      throw new AppError(400, 'ValidationError', 'At least one file is required.');
    }

    const comment = await attachmentsRepository.findCommentAccessMeta(commentId);
    if (!comment) {
      throw new AppError(404, 'NotFound', 'Comment not found.');
    }

    if (
      !can(user, 'create', 'attachment', {
        ownerId: comment.task.residentId,
        assigneeId: comment.task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to upload files.');
    }

    const normalizedFiles = await normalizeUploadedFiles(files);
    const created = await attachmentsRepository.createCommentAttachments({
      taskId: comment.taskId,
      commentId,
      uploadedById: user.id,
      files: normalizedFiles,
    });

    return { created: created.map((item) => toView(item)) };
  },

  async listByTask(user: AuthUser, taskId: string): Promise<AttachmentView[]> {
    const task = await attachmentsRepository.findTaskAccessMeta(taskId);
    if (!task) {
      throw new AppError(404, 'NotFound', 'Task not found.');
    }

    if (
      !can(user, 'read', 'attachment', {
        ownerId: task.residentId,
        assigneeId: task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to view files.');
    }

    const items = await attachmentsRepository.listByTask(taskId);
    return items.map((item) => toView(item));
  },
};
