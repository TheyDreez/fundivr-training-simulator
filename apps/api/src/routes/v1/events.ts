import type { FastifyInstance } from 'fastify';
import { prisma } from '../../database/prisma.js';
import { createTrainingEventSchema, EventResponse } from '@fundivr/shared-schemas';
import type { ScoringResult } from '../../modules/scoring/rules.js';
import {
  evaluateThermalControl,
  evaluateWetCharge,
  evaluateSkimming,
  evaluatePpeCheck,
  evaluateEmergency,
} from '../../modules/scoring/rules.js';

export async function eventRoutes(app: FastifyInstance) {
  // POST /api/v1/sessoes/:id/eventos
  app.post<{ Params: { id: string } }>('/sessoes/:id/eventos', async (request, reply) => {
    const { id: sessionId } = request.params;

    const payloadWithSession = {
      ...(request.body as object),
      sessionId,
    };

    const parsed = createTrainingEventSchema.safeParse(payloadWithSession);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
    }

    const { type, stage, payload } = parsed.data;

    const session = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return reply.status(404).send({ error: 'Sessão não encontrada' });
    }

    // Persiste o evento vinculado à sessão
    const event = await prisma.event.create({
      data: {
        sessionId,
        type,
        stage,
        payload: payload as any,
      },
    });

    // Roda a função de scoring conforme o type
    let scoringResult: ScoringResult | null = null;

    switch (type) {
      case 'thermal_control_completed':
        scoringResult = evaluateThermalControl(payload);
        break;
      case 'wet_charge_detected':
      case 'charge_inspected':
        scoringResult = evaluateWetCharge(payload);
        break;
      case 'skimming_completed':
        scoringResult = evaluateSkimming(payload);
        break;
      case 'ppe_check_completed':
        scoringResult = evaluatePpeCheck(payload);
        break;
      case 'emergency_triggered':
        scoringResult = evaluateEmergency(payload);
        break;
      default:
        scoringResult = {
          score: 100,
          status: 'approved',
          feedback: 'Evento registrado com sucesso.',
        };
        break;
    }

    // Se as regras exigirem, grava automaticamente uma Occurrence vinculada à mesma sessão
    if (scoringResult.isCritical) {
      await prisma.occurrence.create({
        data: {
          sessionId,
          severity: 'critical',
          message: scoringResult.feedback,
        },
      });
    } else if (scoringResult.status === 'reproved') {
      await prisma.occurrence.create({
        data: {
          sessionId,
          severity: 'warning',
          message: scoringResult.feedback,
        },
      });
    }

    // Retorna
    const response = {
      score: scoringResult.score,
      status: scoringResult.status,
      feedback: scoringResult.feedback,
    };

    return reply.send(response);
  });
}
