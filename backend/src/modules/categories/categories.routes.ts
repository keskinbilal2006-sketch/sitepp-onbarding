import { Router } from 'express';

import { authenticate, requireAuth } from '../../middleware/auth.middleware.js';
import { categoriesController } from './categories.controller.js';

export const categoriesRouter = Router();

// Kategori listesi task acma ekraninda ve filtrelerde kullanilacak.
categoriesRouter.get('/', authenticate, requireAuth, categoriesController.list);
