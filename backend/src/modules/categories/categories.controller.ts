import type { NextFunction, Request, Response } from 'express';

import { categoriesService } from './categories.service.js';

export const categoriesController = {
  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await categoriesService.list();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },
};
