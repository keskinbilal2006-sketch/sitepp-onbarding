'use client';

import { useQuery } from '@tanstack/react-query';

import { tasksApi } from '../api/tasks.api';

/**
 * Tekil task detayini ceker.
 */
export function useTaskDetailQuery(taskId: string) {
  return useQuery({
    queryKey: ['tasks', 'detail', taskId],
    queryFn: () => tasksApi.getById(taskId),
    enabled: Boolean(taskId),
  });
}
