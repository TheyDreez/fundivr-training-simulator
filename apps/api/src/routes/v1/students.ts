import type { FastifyInstance } from 'fastify';
import { prisma } from '../../database/prisma.js';
import { createStudentSchema } from '@fundivr/shared-schemas';

export async function studentRoutes(app: FastifyInstance) {
  // GET /api/v1/alunos/:registration/perfil
  app.get<{ Params: { registration: string } }>(
    '/alunos/:registration/perfil',
    async (request, reply) => {
      const { registration } = request.params;

      let student = await prisma.student.findUnique({
        where: { registration },
        include: {
          sessions: {
            orderBy: { startedAt: 'desc' },
          },
        },
      });

      // GET busca perfil por matrícula; se não existir, cria perfil "beginner" e retorna
      if (!student) {
        student = await prisma.student.create({
          data: {
            registration,
            name: `Aluno ${registration}`, // Auto-generated default name
            experienceLevel: 'beginner',
          },
          include: {
            sessions: true,
          },
        });
      }

      return reply.send(student);
    },
  );

  // POST /api/v1/alunos
  app.post('/alunos', async (request, reply) => {
    const parsed = createStudentSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
    }

    const { registration, name, experienceLevel } = parsed.data;

    // POST cria ou retorna aluno existente pela matrícula
    let student = await prisma.student.findUnique({
      where: { registration },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          registration,
          name: name || `Aluno ${registration}`,
          experienceLevel: experienceLevel || 'beginner',
        },
      });
    }

    return reply.send(student);
  });
}
