import { PrismaClient } from '@prisma/client';

import { env } from '../config/env.js';

declare global {
  // Development ortaminda hot reload yuzunden her degisiklikte yeni client acilmasin.
  var __prismaClient: PrismaClient | undefined;
}

const prismaClient =
  globalThis.__prismaClient ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prismaClient;
}

export const prisma = prismaClient;
