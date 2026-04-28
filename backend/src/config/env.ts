import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Tum ortam degiskenlerini tek yerden dogrulayip type-safe hale getiriyoruz.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://sitepp:sitepp@localhost:5432/sitepp?schema=public'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  UPLOAD_DIR: z.string().default('uploads'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  JWT_ACCESS_SECRET: z.string().min(12).default('change-me-access-secret'),
  JWT_REFRESH_SECRET: z.string().min(12).default('change-me-refresh-secret'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // Hatalari tek satirda birlestirip uygulama baslangicinda fail ediyoruz.
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${message}`);
}

// Prisma runtime dogrudan process.env.DATABASE_URL bekledigi icin parse edilen degeri geri yaziyoruz.
process.env.DATABASE_URL = parsedEnv.data.DATABASE_URL;

export const env = parsedEnv.data;
