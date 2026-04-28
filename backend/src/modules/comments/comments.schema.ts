import { z } from 'zod';

export const createCommentBodySchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().min(2).max(2000),
});

export const taskIdParamsSchema = z.object({
  taskId: z.string().uuid(),
});
