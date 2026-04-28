import { resolve } from 'node:path';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './config/env.js';
import { requestLogger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { moduleRouters } from './modules/index.js';

const parseCorsOrigins = (originValue: string): string | string[] => {
  // Env'den gelen virgullu listeyi gercek origin dizisine ceviriyoruz.
  const origins = originValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    return '*';
  }

  return origins;
};

export const app = express();

app.disable('x-powered-by');

// Genel middleware sirasi burada kurulur. Once log, sonra guvenlik, sonra body parse.
app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: parseCorsOrigins(env.CORS_ORIGIN),
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Yuklenen dosyalari tarayicidan erisilebilir hale getiriyoruz.
app.use('/uploads', express.static(resolve(process.cwd(), env.UPLOAD_DIR)));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'sitepp-backend',
    uptimeSeconds: Number(process.uptime().toFixed(0)),
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      service: 'sitepp-backend',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Her modul kendi route grubunu yonetir; app.ts sadece ana baglanti noktasidir.
app.use('/api/auth', moduleRouters.auth);
app.use('/api/users', moduleRouters.users);
app.use('/api/categories', moduleRouters.categories);
app.use('/api/tasks', moduleRouters.tasks);
app.use('/api/comments', moduleRouters.comments);
app.use('/api/attachments', moduleRouters.attachments);
app.use('/api/reports', moduleRouters.reports);

// Route bulunamazsa 404, diger tum hatalarda ortak error handler devreye girer.
app.use(notFoundHandler);
app.use(errorHandler);
