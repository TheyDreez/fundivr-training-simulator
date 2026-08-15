import type { FastifyInstance } from 'fastify';
import { prisma } from '../../database/prisma.js';
import { createOccurrenceSchema } from '@fundivr/shared-schemas';

export async function occurrenceRoutes(app: FastifyInstance) {
  // POST /api/v1/ocorrencias
  app.post('/ocorrencias', async (request, reply) => {
    const parsed = createOccurrenceSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
    }

    const { sessionId, severity, message } = parsed.data;

    const occurrence = await prisma.occurrence.create({
      data: {
        sessionId,
        severity,
        message,
      },
    });

    // Microlição educativa relacionada ao erro
    let microLesson = '';
    if (message.toLowerCase().includes('úmida')) {
      microLesson =
        'Lembre-se: Inserir carga úmida no banho metálico gera vapor aprisionado e causa explosões severas. Sempre inspecione a carga.';
    } else if (message.toLowerCase().includes('temperatura')) {
      microLesson =
        'Controle térmico: A temperatura fora da faixa afeta a eficiência energética e a solubilidade de gases na liga.';
    } else {
      microLesson =
        'Revise os manuais operacionais. Cada erro no simulador reflete um risco real no chão de fábrica.';
    }

    return reply.send({
      occurrence,
      microLesson,
    });
  });
}
