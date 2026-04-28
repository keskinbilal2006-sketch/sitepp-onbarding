import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { can } from '../../src/lib/permissions.js';
import type { AuthUser } from '../../src/middleware/auth.middleware.js';

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

describe('permissions.can', () => {
  it('allows admins to perform every checked action', () => {
    assert.equal(can(admin, 'delete', 'task'), true);
    assert.equal(can(admin, 'read', 'report'), true);
    assert.equal(can(admin, 'update', 'category'), true);
  });

  it('limits residents to their own resources except task creation and category read', () => {
    assert.equal(can(resident, 'create', 'task'), true);
    assert.equal(can(resident, 'read', 'category'), true);
    assert.equal(can(resident, 'read', 'task', { ownerId: resident.id }), true);
    assert.equal(can(resident, 'read', 'task', { ownerId: 'resident-2' }), false);
    assert.equal(can(resident, 'read', 'report'), false);
  });

  it('limits staff task access to assigned tasks', () => {
    assert.equal(can(staff, 'read', 'task', { assigneeId: staff.id }), true);
    assert.equal(can(staff, 'transition', 'task', { assigneeId: staff.id }), true);
    assert.equal(can(staff, 'read', 'task', { assigneeId: 'staff-2' }), false);
    assert.equal(can(staff, 'create', 'task'), false);
  });
});
