'use client';

import { useQuery } from '@tanstack/react-query';

import { reportsApi, type ReportsOverviewQuery } from '../api/reports.api';

export function useReportsOverviewQuery(query: ReportsOverviewQuery, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'overview', query],
    queryFn: () => reportsApi.overview(query),
    enabled,
    staleTime: 60 * 1000,
  });
}
