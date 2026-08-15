import type { FastifyInstance } from 'fastify';
import { WS_TELEMETRY_PATH } from '@fundivr/config';

export async function telemetryWebSocket(app: FastifyInstance) {
  app.get(WS_TELEMETRY_PATH, { websocket: true }, (socket, _request) => {
    console.info('[WebSocket] Client connected to telemetry');

    socket.on('message', (message: Buffer) => {
      const data = message.toString();
      console.info(`[WebSocket] Received: ${data}`);

      // Echo back for now — business logic will be added in Sprint 2
      socket.send(JSON.stringify({ received: true, echo: data }));
    });

    socket.on('close', () => {
      console.info('[WebSocket] Client disconnected from telemetry');
    });

    socket.on('error', (error: Error) => {
      console.error('[WebSocket] Error:', error.message);
    });
  });
}
