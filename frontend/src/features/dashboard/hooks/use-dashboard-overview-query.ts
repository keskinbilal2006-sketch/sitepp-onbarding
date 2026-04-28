'use client';

import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../api/dashboard.api';

export function useDashboardOverviewQuery() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardApi.overview,
    staleTime: 30 * 1000,
  });
}
