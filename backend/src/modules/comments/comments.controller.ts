import type { NextFunction, Request, Response } from 'express';

import { commentsService } from './comments.service.js';

export const commentsController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await commentsService.create(req.user!, req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  listByTask: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await commentsService.listByTask(req.user!, req.params.taskId);
      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  },
};
