import { apiClient } from '../../../lib/api-client';
import type { PublicUser } from '../../../types';
import type { AttachmentItem } from '../../attachments/api/attachments.api';
import type { Category } from '../../categories/api/categories.api';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REOPENED';

export interface TaskView {
  id: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  apartmentNo: string;
  resident: Pick<PublicUser, 'id' | 'email' | 'name' | 'role' | 'apartmentNo'>;
  assignedStaff: Pick<PublicUser, 'id' | 'email' | 'name' | 'role'> | null;
  category: Category;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  deadlineAt: string;
  isOverdue: boolean;
}

export interface TaskDetail extends TaskView {
  statusHistory: Array<{
    id: string;
    fromStatus: TaskStatus | null;
    toStatus: TaskStatus;
    changedAt: string;
    note: string | null;
    changedBy: Pick<PublicUser, 'id' | 'email' | 'name' | 'role'>;
  }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: Pick<PublicUser, 'id' | 'email' | 'name' | 'role'>;
    attachments: AttachmentItem[];
  }>;
  attachments: AttachmentItem[];
}

export interface TaskListResponse {
  items: TaskView[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
}

export interface CreateTaskPayload {
  categoryId: string;
  priority: TaskPriority;
  description: string;
  apartmentNo?: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
  note?: string;
  assignedStaffId?: string;
}

export const tasksApi = {
  async list(query: TaskListQuery): Promise<TaskListResponse> {
    const { data } = await apiClient.get<TaskListResponse>('/tasks', { params: query });
    return data;
  },

  async getById(id: string): Promise<TaskDetail> {
    const { data } = await apiClient.get<TaskDetail>(`/tasks/${id}`);
    return data;
  },

  async create(payload: CreateTaskPayload): Promise<TaskView> {
    const { data } = await apiClient.post<TaskView>('/tasks', payload);
    return data;
  },

  async updateStatus(taskId: string, payload: UpdateTaskStatusPayload): Promise<TaskView> {
    const { data } = await apiClient.patch<TaskView>(`/tasks/${taskId}/status`, payload);
    return data;
  },
};
