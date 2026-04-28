'use client';

import { useQuery } from '@tanstack/react-query';

import { tasksApi, type TaskListQuery } from '../api/tasks.api';

/**
 * Task listesi query parametreleri ile cekilir.
 */
export function useTasksQuery(query: TaskListQuery) {
  return useQuery({
    queryKey: ['tasks', 'list', query],
    queryFn: () => tasksApi.list(query),
    placeholderData: (previousData) => previousData,
  });
}
