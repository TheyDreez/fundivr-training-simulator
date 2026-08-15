import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    console.info(`🚀 FundiVR API running on http://${env.API_HOST}:${env.API_PORT}`);
    console.info(`📡 WebSocket available at ws://${env.API_HOST}:${env.API_PORT}/ws/telemetry`);
    console.info(`🏥 Health check: http://${env.API_HOST}:${env.API_PORT}/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // ─── Graceful Shutdown ─────────────────────────────────────────────────
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.info(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  }
}

start();
