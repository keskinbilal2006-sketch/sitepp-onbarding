import { createHash } from 'node:crypto';

import bcrypt from 'bcrypt';

import { env } from '../../config/env.js';
import {
  getRefreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../lib/jwt.js';
import { AppError } from '../../middleware/error.middleware.js';
import { authRepository } from './auth.repository.js';
import type { AuthResponse, LoginInput, PublicUser, RefreshInput, RegisterInput } from './auth.types.js';

const hashToken = (token: string): string => {
  // Refresh token'i plaintext saklamiyoruz; DB'ye hash'i yaziyoruz.
  return createHash('sha256').update(token).digest('hex');
};

const toPublicUser = (user: {
  id: string;
  email: string;
  name: string;
  role: 'RESIDENT' | 'STAFF' | 'ADMIN';
  apartmentNo: string | null;
  phone: string | null;
  createdAt: Date;
}): PublicUser => {
  // API cevabinda passwordHash gibi alanlar kesinlikle donmemeli.
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    apartmentNo: user.apartmentNo,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
  };
};

const issueTokensForUser = async (user: {
  id: string;
  email: string;
  role: 'RESIDENT' | 'STAFF' | 'ADMIN';
}) => {
  // Login ve register ayni token uretim mantigini kullansin diye ayri helper yaptik.
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({ userId: user.id });

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiryDate(),
  });

  return { accessToken, refreshToken };
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, 'Conflict', 'This e-mail address is already registered.');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      name: input.name,
      role: 'RESIDENT',
      apartmentNo: input.apartmentNo,
      phone: input.phone,
    });

    const tokens = await issueTokensForUser(user);

    return {
      user: toPublicUser(user),
      tokens,
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError(401, 'Unauthorized', 'Invalid e-mail or password.');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, 'Unauthorized', 'Invalid e-mail or password.');
    }

    const tokens = await issueTokensForUser(user);

    return {
      user: toPublicUser(user),
      tokens,
    };
  },

  async refresh(input: RefreshInput): Promise<AuthResponse> {
    // Gelen refresh token hem imza olarak hem de DB kaydi olarak dogrulaniyor.
    const payload = verifyRefreshToken(input.refreshToken);
    const currentTokenHash = hashToken(input.refreshToken);

    const refreshTokenRecord = await authRepository.findRefreshTokenByHash(currentTokenHash);

    if (!refreshTokenRecord) {
      throw new AppError(401, 'Unauthorized', 'Refresh token not found.');
    }

    if (refreshTokenRecord.revokedAt) {
      throw new AppError(401, 'Unauthorized', 'Refresh token is revoked.');
    }

    if (refreshTokenRecord.expiresAt.getTime() < Date.now()) {
      throw new AppError(401, 'Unauthorized', 'Refresh token is expired.');
    }

    if (refreshTokenRecord.userId !== payload.sub) {
      throw new AppError(401, 'Unauthorized', 'Refresh token subject mismatch.');
    }

    const accessToken = signAccessToken({
      userId: refreshTokenRecord.user.id,
      email: refreshTokenRecord.user.email,
      role: refreshTokenRecord.user.role,
    });

    const nextRefreshToken = signRefreshToken({ userId: refreshTokenRecord.user.id });
    const nextRefreshTokenHash = hashToken(nextRefreshToken);

    await authRepository.rotateRefreshToken({
      currentTokenHash,
      newTokenHash: nextRefreshTokenHash,
      userId: refreshTokenRecord.user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    });

    return {
      user: toPublicUser(refreshTokenRecord.user),
      tokens: {
        accessToken,
        refreshToken: nextRefreshToken,
      },
    };
  },

  async logout(input: RefreshInput): Promise<{ success: true }> {
    // Logout token'i silmez, revoke eder; audit icin kayit kalsin isteriz.
    const tokenHash = hashToken(input.refreshToken);

    await authRepository.revokeRefreshTokenByHash(tokenHash);

    return { success: true };
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, 'NotFound', 'User not found.');
    }

    return toPublicUser(user);
  },
};
