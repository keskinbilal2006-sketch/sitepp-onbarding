                                                                                                                                                  import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

// HTTP server burada baslar; app.ts sadece Express uygulamasini tanimlar.
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API server is listening');
});

const shutdown = (signal: NodeJS.Signals): void => {
  logger.info({ signal }, 'Shutdown signal received');

  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'Error while closing HTTP server');
      process.exit(1);
    }

    logger.info('HTTP server closed gracefully');
    process.exit(0);
  });

  // Uygulama kapanmazsa sonsuza kadar asili kalmasin diye zaman asimi koyuyoruz.
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
