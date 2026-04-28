import type { NextFunction, Request, Response } from 'express';

import { attachmentsService } from './attachments.service.js';

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  const raw = req.files;
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : [];
};

export const attachmentsController = {
  uploadToTask: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = getUploadedFiles(req);
      const result = await attachmentsService.uploadToTask(req.user!, req.params.taskId, files);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  uploadToComment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = getUploadedFiles(req);
      const result = await attachmentsService.uploadToComment(
        req.user!,
        req.params.commentId,
        files,
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  listByTask: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await attachmentsService.listByTask(req.user!, req.params.taskId);
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  },
};
