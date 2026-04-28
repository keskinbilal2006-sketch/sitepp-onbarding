import type {
  Attachment,
  Category,
  Comment,
  Task,
  TaskPriority,
  TaskStatus,
  TaskStatusHistory,
  User,
} from '@prisma/client';

export interface CreateTaskInput {
  categoryId: string;
  priority: TaskPriority;
  description: string;
  apartmentNo?: string;
  residentId?: string;
}

export interface TaskListQuery {
  status?: TaskStatus;
  categoryId?: string;
  priority?: TaskPriority;
  search?: string;
  page: number;
  pageSize: number;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
  note?: string;
  assignedStaffId?: string;
}

export interface TaskRecord extends Task {
  category: Category;
  resident: Pick<User, 'id' | 'email' | 'name' | 'apartmentNo' | 'role'>;
  assignedStaff: Pick<User, 'id' | 'email' | 'name' | 'role'> | null;
}

export interface TaskDetailRecord extends TaskRecord {
  statusHistory: Array<
    TaskStatusHistory & {
      changedBy: Pick<User, 'id' | 'email' | 'name' | 'role'>;
    }
  >;
  comments: Array<
    Comment & {
      author: Pick<User, 'id' | 'email' | 'name' | 'role'>;
      attachments: Attachment[];
    }
  >;
  attachments: Attachment[];
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

export interface TaskView {
  id: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  apartmentNo: string;
  resident: Pick<User, 'id' | 'email' | 'name' | 'apartmentNo' | 'role'>;
  assignedStaff: Pick<User, 'id' | 'email' | 'name' | 'role'> | null;
  category: Category;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  deadlineAt: string;
  isOverdue: boolean;
}

export interface TaskDetailResponse extends TaskView {
  statusHistory: Array<{
    id: string;
    fromStatus: TaskStatus | null;
    toStatus: TaskStatus;
    changedAt: string;
    note: string | null;
    changedBy: Pick<User, 'id' | 'email' | 'name' | 'role'>;
  }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: Pick<User, 'id' | 'email' | 'name' | 'role'>;
    attachments: Attachment[];
  }>;
  attachments: Attachment[];
}
