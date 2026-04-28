import { apiClient } from '../../../lib/api-client';
import type { UserRole } from '../../../types';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  apartmentNo: string | null;
  phone: string | null;
  createdAt: string;
  activeAssignedTaskCount: number;
}

export interface UserListQuery {
  role?: UserRole;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListResponse {
  items: UserListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  async list(query: UserListQuery): Promise<UserListResponse> {
    const { data } = await apiClient.get<UserListResponse>('/users', { params: query });
    return data;
  },
};
