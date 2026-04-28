import { z } from 'zod';

export const reportsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).default(new Date().getMonth() + 1),
  year: z.coerce.number().int().min(2020).max(2100).default(new Date().getFullYear()),
});
