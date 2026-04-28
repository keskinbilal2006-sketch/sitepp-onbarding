'use client';

import { useQuery } from '@tanstack/react-query';

import { usersApi, type UserListQuery } from '../api/users.api';

export function useUsersQuery(query: UserListQuery, enabled = true) {
  return useQuery({
    queryKey: ['users', 'list', query],
    queryFn: () => usersApi.list(query),
    enabled,
    staleTime: 60 * 1000,
  });
}
