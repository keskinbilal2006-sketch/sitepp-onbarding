import type { Comment, User } from '@prisma/client';

export interface CreateCommentInput {
  taskId: string;
  body: string;
}

export interface CommentView {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}

export interface CommentRecord extends Comment {
  author: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}
