import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { healthRoutes } from './routes/health.js';
import { telemetryWebSocket } from './websocket/telemetry.js';

import { studentRoutes } from './routes/v1/students.js';
import { sessionRoutes } from './routes/v1/sessions.js';
import { eventRoutes } from './routes/v1/events.js';
import { occurrenceRoutes } from './routes/v1/occurrences.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  // ─── Plugins ─────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  await app.register(websocket);

  // ─── Routes ──────────────────────────────────────────────────────────────
  await app.register(healthRoutes);
  await app.register(telemetryWebSocket);

  // ─── V1 API Routes ───────────────────────────────────────────────────────
  await app.register(
    async (api) => {
      await api.register(studentRoutes);
      await api.register(sessionRoutes);
      await api.register(eventRoutes);
      await api.register(occurrenceRoutes);
    },
    { prefix: '/api/v1' },
  );

  return app;
}
