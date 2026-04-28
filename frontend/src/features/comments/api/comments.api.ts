import { apiClient } from '../../../lib/api-client';
import type { PublicUser } from '../../../types';

export interface CommentView {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<PublicUser, 'id' | 'email' | 'name' | 'role'>;
}

export interface CreateCommentPayload {
  taskId: string;
  body: string;
}

export const commentsApi = {
  async create(payload: CreateCommentPayload): Promise<CommentView> {
    const { data } = await apiClient.post<CommentView>('/comments', payload);
    return data;
  },
};
