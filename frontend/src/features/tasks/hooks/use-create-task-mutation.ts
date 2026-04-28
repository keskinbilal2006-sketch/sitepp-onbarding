'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tasksApi, type CreateTaskPayload } from '../api/tasks.api';

/**
 * Task olusturma sonrasi task listesi cache'i yenilenir.
 */
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
    },
  });
}
