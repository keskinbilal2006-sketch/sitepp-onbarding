import { Router } from 'express';

export const usersRouter = Router();

usersRouter.get('/', (_req, res) => {
  res.status(501).json({
    error: 'NotImplemented',
    message: 'Users module endpoints are not implemented yet.',
    statusCode: 501,
  });
});