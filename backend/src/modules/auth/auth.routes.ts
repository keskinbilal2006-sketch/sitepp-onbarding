import { Router } from 'express';

import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authController } from './auth.controller.js';
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from './auth.schema.js';

export const authRouter = Router();

// Her endpoint kendi validation zinciriyle birlikte tanimlaniyor.
authRouter.post('/register', validate({ body: registerBodySchema }), authController.register);
authRouter.post('/login', validate({ body: loginBodySchema }), authController.login);
authRouter.post('/refresh', validate({ body: refreshBodySchema }), authController.refresh);
authRouter.post('/logout', validate({ body: logoutBodySchema }), authController.logout);
authRouter.get('/me', authenticate, requireAuth, authController.me);
