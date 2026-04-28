import type { NextFunction, Request, Response } from 'express';

import { tasksService } from './tasks.service.js';

export const tasksController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await tasksService.create(req.user!, req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await tasksService.list(req.user!, req.query as never);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await tasksService.getById(req.user!, req.params.id);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await tasksService.updateStatus(req.user!, req.params.id, req.body);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },
};
