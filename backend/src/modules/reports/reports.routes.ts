import { Router } from 'express';

import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { reportsController } from './reports.controller.js';
import { reportsQuerySchema } from './reports.schema.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate, requireAuth, requireRole('ADMIN'));

reportsRouter.get('/overview', validate({ query: reportsQuerySchema }), reportsController.overview);
