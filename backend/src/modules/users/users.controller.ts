import type { NextFunction, Request, Response } from 'express';

import { usersService } from './users.service.js';

export const usersController = {
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await usersService.list(req.query as never);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
};
