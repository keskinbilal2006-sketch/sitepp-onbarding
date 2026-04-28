import { Router } from 'express';

import { upload } from '../../lib/storage.js';
import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { attachmentsController } from './attachments.controller.js';
import { commentIdParamsSchema, taskIdParamsSchema } from './attachments.schema.js';

export const attachmentsRouter = Router();

attachmentsRouter.use(authenticate, requireAuth);

attachmentsRouter.get(
  '/task/:taskId',
  validate({ params: taskIdParamsSchema }),
  attachmentsController.listByTask,
);
attachmentsRouter.post(
  '/task/:taskId',
  validate({ params: taskIdParamsSchema }),
  upload.array('files', 3),
  attachmentsController.uploadToTask,
);
attachmentsRouter.post(
  '/comment/:commentId',
  validate({ params: commentIdParamsSchema }),
  upload.array('files', 3),
  attachmentsController.uploadToComment,
);
