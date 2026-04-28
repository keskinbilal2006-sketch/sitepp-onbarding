import pino from 'pino';
import { pinoHttp } from 'pino-http';

import { env } from '../config/env.js';

// Uygulama ici loglar icin ana logger.
export const logger = pino({
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Her HTTP istegini otomatik loglamak icin Express middleware logger'i.
export const requestLogger = pinoHttp({ logger });
