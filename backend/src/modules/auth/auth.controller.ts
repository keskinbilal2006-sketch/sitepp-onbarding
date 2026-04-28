import type { NextFunction, Request, Response } from 'express';

import { authService } from './auth.service.js';

// Controller katmani ince tutulur: request alir, service cagirir, cevabi dondurur.
export const authController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.register(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.login(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.refresh(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.logout(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await authService.me(req.user!.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};
