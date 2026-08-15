import { describe, it, expect } from 'vitest';
import { buildApp } from '../app.js';

describe('GET /health', () => {
  it('should return status ok', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    await app.close();
  });
});
