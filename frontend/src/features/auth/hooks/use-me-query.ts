'use client';

import { useQuery } from '@tanstack/react-query';

import { authApi } from '../api/auth.api';
import { getAccessToken } from '../../../lib/auth-session';

/**
 * Giris yapan kullanici bilgisini ceker.
 */
export function useMeQuery() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: Boolean(getAccessToken()),
    staleTime: 30_000,
  });
}
