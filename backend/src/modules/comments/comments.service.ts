import { can } from '../../lib/permissions.js';
import type { AuthUser } from '../../middleware/auth.middleware.js';
import { AppError } from '../../middleware/error.middleware.js';
import { commentsRepository } from './comments.repository.js';
import type { CommentView, CreateCommentInput } from './comments.types.js';

const toView = (comment: {
  id: string;
  taskId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    email: string;
    name: string;
    role: 'RESIDENT' | 'STAFF' | 'ADMIN';
  };
}): CommentView => {
  return {
    id: comment.id,
    taskId: comment.taskId,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  };
};

export const commentsService = {
  async create(user: AuthUser, input: CreateCommentInput): Promise<CommentView> {
    const task = await commentsRepository.findTaskAccessMeta(input.taskId);
    if (!task) {
      throw new AppError(404, 'NotFound', 'Task not found.');
    }

    if (
      !can(user, 'create', 'comment', {
        ownerId: task.residentId,
        assigneeId: task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to comment on this task.');
    }

    const comment = await commentsRepository.createComment({
      taskId: input.taskId,
      body: input.body,
      authorId: user.id,
    });

    return toView(comment);
  },

  async listByTask(user: AuthUser, taskId: string): Promise<CommentView[]> {
    const task = await commentsRepository.findTaskAccessMeta(taskId);
    if (!task) {
      throw new AppError(404, 'NotFound', 'Task not found.');
    }

    if (
      !can(user, 'read', 'comment', {
        ownerId: task.residentId,
        assigneeId: task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to view comments.');
    }

    const comments = await commentsRepository.listByTask(taskId);
    return comments.map((comment) => toView(comment));
  },
};
