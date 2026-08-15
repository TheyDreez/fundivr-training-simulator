import type { FastifyInstance } from 'fastify';
import type { HealthCheckResponse } from '@fundivr/shared-types';

export async function healthRoutes(app: FastifyInstance) {
  app.get<{ Reply: HealthCheckResponse }>('/health', async (_request, _reply) => {
    return { status: 'ok' };
  });
}
