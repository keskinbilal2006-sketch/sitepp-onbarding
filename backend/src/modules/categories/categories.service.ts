import type { Category } from '@prisma/client';

import { categoriesRepository } from './categories.repository.js';

export const categoriesService = {
  list(): Promise<Category[]> {
    return categoriesRepository.findMany();
  },
};
