'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { commentsApi, type CreateCommentPayload } from '../api/comments.api';

/**
 * Yeni yorum eklendikten sonra task detay verisi yenilenir.
 */
export function useCreateCommentMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentsApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', taskId] });
    },
  });
}
