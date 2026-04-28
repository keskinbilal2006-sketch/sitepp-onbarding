import { Router } from 'express';

import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { usersController } from './users.controller.js';
import { userListQuerySchema } from './users.schema.js';

export const usersRouter = Router();

usersRouter.use(authenticate, requireAuth, requireRole('ADMIN'));

usersRouter.get('/', validate({ query: userListQuerySchema }), usersController.list);
