import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TaskStatus } from '@prisma/client';

import { AppError } from '../../src/middleware/error.middleware.js';
import type { AuthUser } from '../../src/middleware/auth.middleware.js';
import { assertTaskTransitionAllowed } from '../../src/modules/tasks/tasks.state-machine.js';

const resident: AuthUser = {
  id: 'resident-1',
  email: 'resident@example.com',
  role: 'RESIDENT',
};

const staff: AuthUser = {
  id: 'staff-1',
  email: 'staff@example.com',
  role: 'STAFF',
};

const admin: AuthUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'ADMIN',
};

describe('assertTaskTransitionAllowed', () => {
  it('allows admins to review and assign tasks when assignee is provided', () => {
    assert.doesNotThrow(() => {
      assertTaskTransitionAllowed({
        user: admin,
        currentStatus: TaskStatus.OPEN,
        nextStatus: TaskStatus.IN_REVIEW,
        ownerId: resident.id,
        assigneeId: null,
      });
    });

    assert.doesNotThrow(() => {
      assertTaskTransitionAllowed({
        user: admin,
        currentStatus: TaskStatus.IN_REVIEW,
        nextStatus: TaskStatus.ASSIGNED,
        ownerId: resident.id,
        assigneeId: null,
        nextAssigneeId: staff.id,
      });
    });
  });

  it('rejects invalid graph transitions before role rules', () => {
    assert.throws(
      () => {
        assertTaskTransitionAllowed({
          user: admin,
          currentStatus: TaskStatus.OPEN,
          nextStatus: TaskStatus.RESOLVED,
          ownerId: resident.id,
          assigneeId: null,
        });
      },
      (error) => error instanceof AppError && error.statusCode === 400,
    );
  });

  it('allows assigned staff to move assigned work forward only', () => {
    assert.doesNotThrow(() => {
      assertTaskTransitionAllowed({
        user: staff,
        currentStatus: TaskStatus.ASSIGNED,
        nextStatus: TaskStatus.IN_PROGRESS,
        ownerId: resident.id,
        assigneeId: staff.id,
      });
    });

    assert.throws(
      () => {
        assertTaskTransitionAllowed({
          user: staff,
          currentStatus: TaskStatus.ASSIGNED,
          nextStatus: TaskStatus.CANCELLED,
          ownerId: resident.id,
          assigneeId: staff.id,
        });
      },
      (error) => error instanceof AppError && error.statusCode === 403,
    );
  });

  it('allows residents to close or reopen their own resolved tasks', () => {
    assert.doesNotThrow(() => {
      assertTaskTransitionAllowed({
        user: resident,
        currentStatus: TaskStatus.RESOLVED,
        nextStatus: TaskStatus.CLOSED,
        ownerId: resident.id,
        assigneeId: staff.id,
      });
    });

    assert.doesNotThrow(() => {
      assertTaskTransitionAllowed({
        user: resident,
        currentStatus: TaskStatus.CLOSED,
        nextStatus: TaskStatus.REOPENED,
        ownerId: resident.id,
        assigneeId: staff.id,
      });
    });
  });

  it('rejects resident changes on another resident task', () => {
    assert.throws(
      () => {
        assertTaskTransitionAllowed({
          user: resident,
          currentStatus: TaskStatus.RESOLVED,
          nextStatus: TaskStatus.CLOSED,
          ownerId: 'resident-2',
          assigneeId: staff.id,
        });
      },
      (error) => error instanceof AppError && error.statusCode === 403,
    );
  });
});
