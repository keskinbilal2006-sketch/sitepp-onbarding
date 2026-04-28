import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { logger } from '../lib/logger.js';

// Uygulama icinde beklenen is kurali hatalarini bu sinifla firlatiriz.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NotFound', `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    // Validation hatalarini frontend'in rahat tuketebilecegi sabit formatta donuyoruz.
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Request validation failed.',
      statusCode: 400,
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
    });
  }

  logger.error(
    {
      err,
      method: req.method,
      path: req.originalUrl,
    },
    'Unhandled error',
  );

  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong.',
    statusCode: 500,
  });
};
