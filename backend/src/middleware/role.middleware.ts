import type { RequestHandler } from 'express';

import type { UserRole } from './auth.middleware.js';
import { AppError } from './error.middleware.js';

// Belirli rollerin erisebildigi endpoint'lerde kullanilir.
export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized', 'Authentication is required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden', 'You do not have permission for this action.'));
    }

    return next();
  };
};

export const requireAnyRole = (roles: UserRole[]): RequestHandler => requireRole(...roles);
