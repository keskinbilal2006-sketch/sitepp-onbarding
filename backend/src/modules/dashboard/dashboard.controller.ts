import type { NextFunction, Request, Response } from 'express';

import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  overview: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dashboardService.getOverview(req.user!);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};
