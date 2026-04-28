import type { Category } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

// Repository katmani sadece kategori tablosuna erisir.
export const categoriesRepository = {
  findMany(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },
};
