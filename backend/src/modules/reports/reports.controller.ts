import type { NextFunction, Request, Response } from 'express';

import { reportsService } from './reports.service.js';
import type { ReportsQuery } from './reports.types.js';

export const reportsController = {
  overview: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await reportsService.getOverview(req.query as unknown as ReportsQuery);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};
