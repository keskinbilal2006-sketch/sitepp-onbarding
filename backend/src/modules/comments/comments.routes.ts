import { Router } from 'express';

import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { commentsController } from './comments.controller.js';
import { createCommentBodySchema, taskIdParamsSchema } from './comments.schema.js';

export const commentsRouter = Router();

commentsRouter.use(authenticate, requireAuth);

commentsRouter.post('/', validate({ body: createCommentBodySchema }), commentsController.create);
commentsRouter.get(
  '/task/:taskId',
  validate({ params: taskIdParamsSchema }),
  commentsController.listByTask,
);
