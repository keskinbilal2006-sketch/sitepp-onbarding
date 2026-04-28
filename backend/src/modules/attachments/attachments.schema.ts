import { z } from 'zod';

export const taskIdParamsSchema = z.object({
  taskId: z.string().uuid(),
});

export const commentIdParamsSchema = z.object({
  commentId: z.string().uuid(),
});
