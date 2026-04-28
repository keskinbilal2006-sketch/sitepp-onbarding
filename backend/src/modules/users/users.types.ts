import type { UserRole } from '@prisma/client';

export interface UserListQuery {
  role?: UserRole;
  search?: string;
  page: number;
  pageSize: number;
}

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

export interface UserListResponse {
  items: UserListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
