import { randomUUID } from 'node:crypto';

import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import type { UserRole } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

interface BasePayload extends JwtPayload {
  sub: string;
  tokenType: 'access' | 'refresh';
}

export interface AccessTokenPayload extends BasePayload {
  tokenType: 'access';
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends BasePayload {
  tokenType: 'refresh';
}

// jsonwebtoken expiresIn tipi string olsa da TS bazen daraltilmis tip ister.
const asSignOptions = (expiresIn: string): SignOptions => ({ expiresIn } as SignOptions);

export const signAccessToken = (payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string => {
  // Access token kullanici kimligini ve rolunu tasir; API isteklerinde kullanilir.
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      tokenType: 'access',
    },
    env.JWT_ACCESS_SECRET,
    asSignOptions(env.JWT_ACCESS_EXPIRES_IN),
  );
};

export const signRefreshToken = (payload: { userId: string }): string => {
  // Refresh token daha az veri tasir; amaci yeni access token almaktir.
  return jwt.sign(
    {
      sub: payload.userId,
      tokenType: 'refresh',
      jti: randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    asSignOptions(env.JWT_REFRESH_EXPIRES_IN),
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    if (decoded.tokenType !== 'access') {
      throw new AppError(401, 'Unauthorized', 'Invalid access token type.');
    }

    return decoded;
  } catch {
    throw new AppError(401, 'Unauthorized', 'Invalid or expired access token.');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;

    if (decoded.tokenType !== 'refresh') {
      throw new AppError(401, 'Unauthorized', 'Invalid refresh token type.');
    }

    return decoded;
  } catch {
    throw new AppError(401, 'Unauthorized', 'Invalid or expired refresh token.');
  }
};

export const getRefreshTokenExpiryDate = (): Date => {
  const raw = env.JWT_REFRESH_EXPIRES_IN.trim();
  const match = raw.match(/^(\d+)([smhd])$/i);

  // Format bekledigimiz gibi degilse guvenli bir varsayilan kullaniyoruz.
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
};
