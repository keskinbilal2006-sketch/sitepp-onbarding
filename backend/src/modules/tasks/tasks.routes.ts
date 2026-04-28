import { Router } from 'express';

import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { tasksController } from './tasks.controller.js';
import {
  createTaskBodySchema,
  taskIdParamsSchema,
  taskListQuerySchema,
  updateTaskStatusBodySchema,
} from './tasks.schema.js';

export const tasksRouter = Router();

tasksRouter.use(authenticate, requireAuth);

tasksRouter.post('/', validate({ body: createTaskBodySchema }), tasksController.create);
tasksRouter.get('/', validate({ query: taskListQuerySchema }), tasksController.list);
tasksRouter.get('/:id', validate({ params: taskIdParamsSchema }), tasksController.getById);
tasksRouter.patch(
  '/:id/status',
  validate({ params: taskIdParamsSchema, body: updateTaskStatusBodySchema }),
  tasksController.updateStatus,
);
