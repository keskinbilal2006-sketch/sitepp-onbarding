import { TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const createTaskBodySchema = z.object({
  categoryId: z.string().uuid(),
  priority: z.nativeEnum(TaskPriority),
  description: z.string().min(10).max(2000),
  apartmentNo: z.string().max(30).optional(),
  residentId: z.string().uuid().optional(),
});

export const taskListQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  categoryId: z.string().uuid().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  search: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const taskIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateTaskStatusBodySchema = z.object({
  status: z.nativeEnum(TaskStatus),
  note: z.string().max(500).optional(),
  assignedStaffId: z.string().uuid().optional(),
});
