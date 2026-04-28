import { TaskStatus, type Prisma } from '@prisma/client';

import { can } from '../../lib/permissions.js';
import type { AuthUser } from '../../middleware/auth.middleware.js';
import { AppError } from '../../middleware/error.middleware.js';
import { assertTaskTransitionAllowed } from './tasks.state-machine.js';
import { tasksRepository } from './tasks.repository.js';
import type {
  CreateTaskInput,
  TaskDetailResponse,
  TaskDetailRecord,
  TaskListQuery,
  TaskListResponse,
  TaskRecord,
  TaskView,
  UpdateTaskStatusInput,
} from './tasks.types.js';

const terminalStatuses = new Set<TaskStatus>([
  TaskStatus.RESOLVED,
  TaskStatus.CLOSED,
  TaskStatus.CANCELLED,
]);

const toTaskView = (task: TaskRecord | TaskDetailRecord): TaskView => {
  const deadline = new Date(task.createdAt.getTime() + task.category.slaHours * 60 * 60 * 1000);
  const isOverdue = !terminalStatuses.has(task.status) && Date.now() > deadline.getTime();

  return {
    id: task.id,
    description: task.description,
    priority: task.priority,
    status: task.status,
    apartmentNo: task.apartmentNo,
    resident: task.resident,
    assignedStaff: task.assignedStaff,
    category: task.category,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    resolvedAt: task.resolvedAt?.toISOString() ?? null,
    closedAt: task.closedAt?.toISOString() ?? null,
    cancelledAt: task.cancelledAt?.toISOString() ?? null,
    deadlineAt: deadline.toISOString(),
    isOverdue,
  };
};

const buildScopedWhere = (user: AuthUser, query: TaskListQuery): Prisma.TaskWhereInput => {
  const where: Prisma.TaskWhereInput = {};

  if (user.role === 'RESIDENT') {
    where.residentId = user.id;
  } else if (user.role === 'STAFF') {
    where.assignedStaffId = user.id;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: 'insensitive' } },
      { apartmentNo: { contains: query.search, mode: 'insensitive' } },
      { category: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  return where;
};

export const tasksService = {
  async create(user: AuthUser, input: CreateTaskInput): Promise<TaskView> {
    if (!can(user, 'create', 'task')) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to create a task.');
    }

    const category = await tasksRepository.findCategoryById(input.categoryId);
    if (!category) {
      throw new AppError(404, 'NotFound', 'Category not found.');
    }

    const residentId =
      user.role === 'ADMIN' && input.residentId ? input.residentId : user.id;

    const resident = await tasksRepository.findUserById(residentId);
    if (!resident) {
      throw new AppError(404, 'NotFound', 'Resident user not found.');
    }

    const apartmentNo = input.apartmentNo ?? resident.apartmentNo ?? 'Unknown';

    const task = await tasksRepository.createTaskWithInitialHistory({
      description: input.description,
      priority: input.priority,
      apartmentNo,
      categoryId: input.categoryId,
      residentId,
      createdById: user.id,
    });

    return toTaskView(task);
  },

  async list(user: AuthUser, query: TaskListQuery): Promise<TaskListResponse> {
    const where = buildScopedWhere(user, query);
    const result = await tasksRepository.findTasks({
      where,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: result.items.map((item) => toTaskView(item)),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / query.pageSize)),
      },
    };
  },

  async getById(user: AuthUser, taskId: string) {
    const task = await tasksRepository.findTaskById(taskId);

    if (!task) {
      throw new AppError(404, 'NotFound', 'Task not found.');
    }

    if (
      !can(user, 'read', 'task', {
        ownerId: task.residentId,
        assigneeId: task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to view this task.');
    }

    const response: TaskDetailResponse = {
      ...toTaskView(task),
      statusHistory: task.statusHistory.map((item) => ({
        id: item.id,
        fromStatus: item.fromStatus,
        toStatus: item.toStatus,
        changedAt: item.changedAt.toISOString(),
        note: item.note,
        changedBy: item.changedBy,
      })),
      comments: task.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        author: comment.author,
        attachments: comment.attachments,
      })),
      attachments: task.attachments,
    };

    return response;
  },

  async updateStatus(user: AuthUser, taskId: string, input: UpdateTaskStatusInput): Promise<TaskView> {
    const task = await tasksRepository.findTaskById(taskId);

    if (!task) {
      throw new AppError(404, 'NotFound', 'Task not found.');
    }

    if (
      !can(user, 'transition', 'task', {
        ownerId: task.residentId,
        assigneeId: task.assignedStaffId ?? undefined,
      })
    ) {
      throw new AppError(403, 'Forbidden', 'You do not have permission to change this task.');
    }

    if (input.assignedStaffId) {
      const assignee = await tasksRepository.findUserById(input.assignedStaffId);
      if (!assignee || assignee.role !== 'STAFF') {
        throw new AppError(400, 'ValidationError', 'assignedStaffId must belong to a staff user.');
      }
    }

    assertTaskTransitionAllowed({
      user,
      currentStatus: task.status,
      nextStatus: input.status,
      ownerId: task.residentId,
      assigneeId: task.assignedStaffId,
      nextAssigneeId: input.assignedStaffId,
    });

    const updatedTask = await tasksRepository.updateTaskStatusWithHistory({
      taskId,
      currentStatus: task.status,
      nextStatus: input.status,
      note: input.note,
      changedById: user.id,
      assignedStaffId: input.assignedStaffId ?? task.assignedStaffId ?? undefined,
    });

    return toTaskView(updatedTask);
  },
};
