import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpa o banco antes
  await prisma.occurrence.deleteMany();
  await prisma.event.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.student.deleteMany();

  // 1. Cria 3 alunos
  const student1 = await prisma.student.create({
    data: {
      registration: 'MAT-1001',
      name: 'João Iniciante',
      experienceLevel: 'beginner',
    },
  });

  const student2 = await prisma.student.create({
    data: {
      registration: 'MAT-2002',
      name: 'Maria Intermediária',
      experienceLevel: 'intermediate',
    },
  });

  const student3 = await prisma.student.create({
    data: {
      registration: 'MAT-3003',
      name: 'Carlos Avançado',
      experienceLevel: 'advanced',
    },
  });

  console.log(`✅ 3 Alunos criados`);

  // 2. Cria 1 sessão "completa" com eventos e ocorrências para o student2
  const session = await prisma.trainingSession.create({
    data: {
      studentId: student2.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      finishedAt: new Date(),
      score: 85,
    },
  });

  // Evento 1: Temperatura
  await prisma.event.create({
    data: {
      sessionId: session.id,
      type: 'thermal_control_completed',
      stage: 'fusao',
      payload: { temperature: 735 }, // Quase perfeito
    },
  });

  // Evento 2: Carga
  await prisma.event.create({
    data: {
      sessionId: session.id,
      type: 'charge_inspected',
      stage: 'carregamento',
      payload: { isWet: false, userAccepted: true }, // Seco e aceito
    },
  });

  // Evento 3: Escumação
  await prisma.event.create({
    data: {
      sessionId: session.id,
      type: 'skimming_completed',
      stage: 'escumacao',
      payload: { immersionTime: 9, coveragePercent: 80 }, // Tempo bom, cobertura media
    },
  });

  // Evento 4: Falha (Carga úmida)
  await prisma.event.create({
    data: {
      sessionId: session.id,
      type: 'wet_charge_detected',
      stage: 'carregamento',
      payload: { isWet: true, userAccepted: true }, // Errou aqui
    },
  });

  // Ocorrência
  await prisma.occurrence.create({
    data: {
      sessionId: session.id,
      severity: 'critical',
      message: 'FALHA GRAVE: Carga úmida inserida no forno. Risco altíssimo de explosão de vapor!',
    },
  });

  console.log(`✅ Sessão rica criada com eventos e ocorrências`);
  console.log('🌱 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
