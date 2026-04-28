'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tasksApi, type UpdateTaskStatusPayload } from '../api/tasks.api';

/**
 * Status degisince hem detay hem liste cache'i yenilenir.
 */
export function useUpdateTaskStatusMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaskStatusPayload) => tasksApi.updateStatus(taskId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', taskId] }),
        queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['users', 'list'] }),
      ]);
    },
  });
}
