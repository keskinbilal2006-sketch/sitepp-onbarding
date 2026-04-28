import type { AuthUser } from '../middleware/auth.middleware.js';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'transition' | 'assign';
export type PermissionResource =
  | 'task'
  | 'comment'
  | 'attachment'
  | 'category'
  | 'report'
  | 'user';

export interface PermissionInstance {
  ownerId?: string;
  assigneeId?: string;
}

// RBAC + ownership kontrolunu tek yerde topluyoruz.
export const can = (
  user: AuthUser,
  action: PermissionAction,
  resource: PermissionResource,
  instance?: PermissionInstance,
): boolean => {
  // Admin her seyi gorebilir/yapabilir.
  if (user.role === 'ADMIN') {
    return true;
  }

  if (resource === 'report' || (resource === 'category' && action !== 'read')) {
    return false;
  }

  if (user.role === 'STAFF') {
    if (resource === 'task') {
      // Staff yalnizca kendisine atanmis task'larda islem yapabilir.
      if (action === 'read' || action === 'transition') {
        return instance?.assigneeId === user.id;
      }
      return false;
    }

    if (resource === 'comment' || resource === 'attachment') {
      return instance?.assigneeId === user.id || instance?.ownerId === user.id;
    }

    return false;
  }

  // RESIDENT
  if (resource === 'task') {
    if (action === 'create') {
      // Resident yeni task acabilir, ama mevcut task'ta ownership gerekir.
      return true;
    }

    return instance?.ownerId === user.id;
  }

  if (resource === 'comment' || resource === 'attachment' || resource === 'user') {
    return instance?.ownerId === user.id;
  }

  if (resource === 'category' && action === 'read') {
    return true;
  }

  return false;
};
