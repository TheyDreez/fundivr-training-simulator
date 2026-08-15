import type { FastifyInstance } from 'fastify';
import { prisma } from '../../database/prisma.js';
import { createTrainingSessionSchema } from '@fundivr/shared-schemas';
import { aggregateSessionScore } from '../../modules/scoring/rules.js';

export async function sessionRoutes(app: FastifyInstance) {
  // POST /api/v1/sessoes
  app.post('/sessoes', async (request, reply) => {
    const parsed = createTrainingSessionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
    }

    const { studentId } = parsed.data;

    // Cria sessão vinculada ao aluno, status running ('running')
    const session = await prisma.trainingSession.create({
      data: {
        studentId,
        status: 'running', // Note: schema enum allows 'running'
      },
    });

    return reply.send(session);
  });

  // POST /api/v1/sessoes/:id/finalizar
  app.post<{ Params: { id: string } }>('/sessoes/:id/finalizar', async (request, reply) => {
    const { id } = request.params;

    const session = await prisma.trainingSession.findUnique({
      where: { id },
      include: { events: true },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Sessão não encontrada' });
    }

    // Finaliza agrega o score via eventos
    const finalScore = aggregateSessionScore(session.events);

    const updatedSession = await prisma.trainingSession.update({
      where: { id },
      data: {
        status: 'completed',
        finishedAt: new Date(),
        score: finalScore,
      },
    });

    return reply.send(updatedSession);
  });

  // GET /api/v1/sessoes/:id
  app.get<{ Params: { id: string } }>('/sessoes/:id', async (request, reply) => {
    const { id } = request.params;

    const session = await prisma.trainingSession.findUnique({
      where: { id },
      include: {
        events: true,
        occurrences: true,
      },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Sessão não encontrada' });
    }

    return reply.send(session);
  });
}
