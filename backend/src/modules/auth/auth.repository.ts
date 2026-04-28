import type { Prisma, User } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

// Repository katmani sadece veritabani okuma/yazma yapar; is kurali burada tutulmaz.
export const authRepository = {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  createRefreshToken(data: CreateRefreshTokenInput) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  revokeRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  rotateRefreshToken(input: {
    currentTokenHash: string;
    newTokenHash: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      // Eski token revoke edilmeden yenisi yazilmasin diye transaction kullaniyoruz.
      await tx.refreshToken.updateMany({
        where: {
          tokenHash: input.currentTokenHash,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      return tx.refreshToken.create({
        data: {
          userId: input.userId,
          tokenHash: input.newTokenHash,
          expiresAt: input.expiresAt,
        },
      });
    });
  },
};
