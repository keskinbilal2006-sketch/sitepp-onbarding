import { usersRepository } from './users.repository.js';
import type { UserListQuery, UserListResponse } from './users.types.js';

export const usersService = {
  async list(query: UserListQuery): Promise<UserListResponse> {
    const result = await usersRepository.findUsers(query);

    return {
      items: result.items.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        apartmentNo: user.apartmentNo,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        activeAssignedTaskCount: user._count.assignedTasks,
      })),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / query.pageSize)),
      },
    };
  },
};
