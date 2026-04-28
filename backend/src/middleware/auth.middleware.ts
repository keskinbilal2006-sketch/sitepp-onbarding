import type { RequestHandler } from 'express';

import { verifyAccessToken } from '../lib/jwt.js';
import { AppError } from './error.middleware.js';

export type UserRole = 'RESIDENT' | 'STAFF' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

// req.user alanini TypeScript'e tanitiyoruz.
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const authenticate: RequestHandler = (req, _res, next) => {
  // Authorization: Bearer <token> basligini okuyup kullaniciyi req.user'a koyuyoruz.
  const token = getBearerToken(req.header('authorization'));

  if (!token) {
    return next(new AppError(401, 'Unauthorized', 'Missing bearer token.'));
  }

  const payload = verifyAccessToken(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };

  return next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError(401, 'Unauthorized', 'Authentication is required.'));
  }

  return next();
};
 