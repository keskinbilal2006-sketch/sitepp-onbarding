'use client';

import { useQuery } from '@tanstack/react-query';

import { categoriesApi } from '../api/categories.api';

/**
 * Task formu ve filtreler icin kategori listesini ceker.
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories', 'list'],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}
