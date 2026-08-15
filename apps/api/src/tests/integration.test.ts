import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../app.js';
import { prisma } from '../database/prisma.js';
import type { FastifyInstance } from 'fastify';

describe('Integration: Training Session & Events Flow', () => {
  let app: FastifyInstance;
  let server: any;
  let studentId: string;
  let sessionId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    server = supertest(app.server);

    // Limpa a base antes dos testes
    await prisma.occurrence.deleteMany();
    await prisma.event.deleteMany();
    await prisma.trainingSession.deleteMany();
    await prisma.student.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. POST /api/v1/alunos - Cria aluno', async () => {
    const res = await server.post('/api/v1/alunos').send({
      registration: 'INT-999',
      name: 'Integration Test User',
      experienceLevel: 'intermediate',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.registration).toBe('INT-999');

    studentId = res.body.id;
  });

  it('2. GET /api/v1/alunos/:registration/perfil - Busca aluno', async () => {
    const res = await server.get('/api/v1/alunos/INT-999/perfil');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(studentId);
  });

  it('3. POST /api/v1/sessoes - Inicia uma sessão', async () => {
    const res = await server.post('/api/v1/sessoes').send({ studentId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('running');

    sessionId = res.body.id;
  });

  it('4. POST evento de controle térmico e valida score', async () => {
    const res = await server.post(`/api/v1/sessoes/${sessionId}/eventos`).send({
      type: 'thermal_control_completed',
      stage: 'fusao',
      payload: {
        temperature: 740,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(100);
    expect(res.body.status).toBe('approved');
    expect(res.body.feedback).toContain('Excelente controle térmico');
  });

  it('5. POST evento térmico na zona amarela (warning)', async () => {
    const res = await server.post(`/api/v1/sessoes/${sessionId}/eventos`).send({
      type: 'thermal_control_completed',
      stage: 'fusao',
      payload: {
        temperature: 755,
      },
    });

    expect(res.status).toBe(200);
    // 755 => diff = 25. Score = round(85 - (10 * 25/15)) = round(85 - 16.66) = 68
    expect(res.body.score).toBe(68);
    expect(res.body.status).toBe('approved_with_warning');
    expect(res.body.feedback).toContain('fora da faixa ideal');

    // Valida Occurrence NÃO criada para warning (conforme nova regra)
    const occurrences = await prisma.occurrence.findMany({
      where: { sessionId, severity: 'info' },
    });
    expect(occurrences.length).toBe(0);
  });

  it('6. POST evento de carga úmida com erro e prova Occurrence', async () => {
    const res = await server.post(`/api/v1/sessoes/${sessionId}/eventos`).send({
      type: 'wet_charge_detected',
      stage: 'carregamento',
      payload: {
        isWet: true,
        userAccepted: true,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(0);
    expect(res.body.status).toBe('reproved');
    expect(res.body.feedback).toContain('FALHA GRAVE');

    // Valida Occurrence criada
    const occurrences = await prisma.occurrence.findMany({
      where: { sessionId },
    });

    expect(occurrences.length).toBe(1);
    expect(occurrences[0].severity).toBe('critical');
    expect(occurrences[0].message).toContain('FALHA GRAVE');
  });

  it('7. POST finalizar a sessão e validar o score agregado', async () => {
    const res = await server.post(`/api/v1/sessoes/${sessionId}/finalizar`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.finishedAt).not.toBeNull();

    // Thermal = média entre 100 e 68 = 84.  84 * 0.4 = 33.6
    // Wet = 0 * 0.3 = 0
    // Total = 33.6 / 0.7 = 48
    expect(res.body.score).toBe(48);
  });
});
