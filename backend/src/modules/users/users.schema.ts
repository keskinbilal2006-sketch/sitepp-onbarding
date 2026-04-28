import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const userListQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
