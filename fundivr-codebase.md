# Codebase Export - FundiVR

## Árvore de Diretórios

```
fundivr-training-simulator/
├── .dockerignore
├── .editorconfig
├── .eslintrc.cjs
├── .gitignore
├── .prettierignore
├── .prettierrc
├── apps
│   ├── api
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   │   ├── 20260815061221_init
│   │   │   │   │   └── migration.sql
│   │   │   │   └── migration_lock.toml
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src
│   │   │   ├── app.ts
│   │   │   ├── config
│   │   │   │   └── env.ts
│   │   │   ├── database
│   │   │   │   └── prisma.ts
│   │   │   ├── middlewares
│   │   │   │   └── .gitkeep
│   │   │   ├── modules
│   │   │   │   ├── .gitkeep
│   │   │   │   └── scoring
│   │   │   │       └── rules.ts
│   │   │   ├── routes
│   │   │   │   ├── health.ts
│   │   │   │   └── v1
│   │   │   │       ├── events.ts
│   │   │   │       ├── occurrences.ts
│   │   │   │       ├── sessions.ts
│   │   │   │       └── students.ts
│   │   │   ├── schemas
│   │   │   │   └── .gitkeep
│   │   │   ├── server.ts
│   │   │   ├── services
│   │   │   │   └── .gitkeep
│   │   │   ├── tests
│   │   │   │   ├── health.test.ts
│   │   │   │   └── integration.test.ts
│   │   │   ├── utils
│   │   │   │   └── .gitkeep
│   │   │   └── websocket
│   │   │       └── telemetry.ts
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── web
│       ├── Dockerfile
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── public
│       │   └── vite.svg
│       ├── src
│       │   ├── App.tsx
│       │   ├── assets
│       │   │   └── .gitkeep
│       │   ├── components
│       │   │   └── .gitkeep
│       │   ├── features
│       │   │   └── .gitkeep
│       │   ├── hooks
│       │   │   └── .gitkeep
│       │   ├── index.css
│       │   ├── layouts
│       │   │   └── MainLayout.tsx
│       │   ├── main.tsx
│       │   ├── pages
│       │   │   └── Home.tsx
│       │   ├── routes
│       │   │   └── index.tsx
│       │   ├── schemas
│       │   │   └── .gitkeep
│       │   ├── services
│       │   │   └── api.ts
│       │   ├── stores
│       │   │   └── appStore.ts
│       │   ├── types
│       │   │   └── .gitkeep
│       │   └── vite-env.d.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── tsconfig.node.tsbuildinfo
│       ├── tsconfig.tsbuildinfo
│       ├── vite.config.d.ts
│       ├── vite.config.d.ts.map
│       ├── vite.config.js
│       └── vite.config.ts
├── docker
│   └── .env.example
├── docker-compose.yml
├── docs
│   ├── .gitkeep
│   └── architecture.md
├── package.json
├── packages
│   ├── config
│   │   ├── package.json
│   │   ├── src
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── shared-schemas
│   │   ├── package.json
│   │   ├── src
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   └── shared-types
│       ├── package.json
│       ├── src
│       │   └── index.ts
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── PROJECT_HANDOVER_PM.md
├── README.md
└── tsconfig.base.json
```

## Arquivos

### apps/api/prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Student ─────────────────────────────────────────────────────────────────

model Student {
  id              String            @id @default(uuid())
  name            String
  registration    String            @unique
  experienceLevel String            @default("beginner") @map("experience_level")
  createdAt       DateTime          @default(now()) @map("created_at")
  sessions        TrainingSession[]

  @@map("students")
}

// ─── Training Session ────────────────────────────────────────────────────────

model TrainingSession {
  id          String       @id @default(uuid())
  studentId   String       @map("student_id")
  student     Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  status      String       @default("pending")
  startedAt   DateTime     @default(now()) @map("started_at")
  finishedAt  DateTime?    @map("finished_at")
  score       Float?
  events      Event[]
  occurrences Occurrence[]

  @@index([studentId])
  @@index([status])
  @@map("training_sessions")
}

// ─── Event ───────────────────────────────────────────────────────────────────

model Event {
  id        String          @id @default(uuid())
  sessionId String          @map("session_id")
  session   TrainingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  type      String
  stage     String
  payload   Json            @default("{}")
  createdAt DateTime        @default(now()) @map("created_at")

  @@index([sessionId])
  @@index([type])
  @@map("events")
}

// ─── Occurrence ──────────────────────────────────────────────────────────────

model Occurrence {
  id        String          @id @default(uuid())
  sessionId String          @map("session_id")
  session   TrainingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  severity  String
  message   String
  createdAt DateTime        @default(now()) @map("created_at")

  @@index([sessionId])
  @@index([severity])
  @@map("occurrences")
}

```

### apps/api/prisma/seed.ts

```typescript
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
```

### apps/api/src/app.ts

```typescript
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
```

### apps/api/src/server.ts

```typescript
import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    console.info(`🚀 FundiVR API running on http://${env.API_HOST}:${env.API_PORT}`);
    console.info(`📡 WebSocket available at ws://${env.API_HOST}:${env.API_PORT}/ws/telemetry`);
    console.info(`🏥 Health check: http://${env.API_HOST}:${env.API_PORT}/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // ─── Graceful Shutdown ─────────────────────────────────────────────────
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.info(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  }
}

start();
```

### apps/api/src/config/env.ts

```typescript
import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

### apps/api/src/database/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### apps/api/src/modules/scoring/rules.ts

```typescript
/**
 * SISTEMA DE SCORING - FUNDIVR
 *
 * A nota final da sessão é composta por uma média ponderada das etapas do processo de fusão.
 * Cada etapa avaliada retorna um score de 0 a 100.
 *
 * Pesos definidos para a agregação (Soma = 1):
 * - Controle Térmico (THERMAL_CONTROL_WEIGHT): 0.40 (40%)
 *   A temperatura é o fator mais crítico de segurança e qualidade do metal.
 *
 * - Carga Úmida (WET_CHARGE_WEIGHT): 0.30 (30%)
 *   Falha ao identificar carga úmida pode causar explosões.
 *
 * - Escumação / Skimming (SKIMMING_WEIGHT): 0.30 (30%)
 *   Garante a pureza do banho metálico.
 *
 * Fórmula:
 * Final Score = (ThermalScore * 0.4) + (WetChargeScore * 0.3) + (SkimmingScore * 0.3)
 */

export const SCORING_WEIGHTS = {
  THERMAL_CONTROL: 0.4,
  WET_CHARGE: 0.3,
  SKIMMING: 0.3,
};

export const TEMPERATURE_THRESHOLDS = {
  IDEAL_MIN: 715, // 730 - 15
  IDEAL_MAX: 745, // 730 + 15
  CRITICAL_PEAK: 800,
};

export const SKIMMING_THRESHOLDS = {
  MIN_IMMERSION_TIME_S: 8,
  IDEAL_COVERAGE_PERCENT: 90,
};

export interface ScoringResult {
  score: number;
  status: 'approved' | 'approved_with_warning' | 'reproved';
  feedback: string;
  isCritical?: boolean;
}

export function evaluateThermalControl(payload: any): ScoringResult {
  const temperature = Number(payload?.temperature);

  if (isNaN(temperature)) {
    return {
      score: 0,
      status: 'reproved',
      feedback: 'Dados de temperatura ausentes ou inválidos.',
    };
  }

  if (temperature > TEMPERATURE_THRESHOLDS.CRITICAL_PEAK) {
    return {
      score: 10,
      status: 'reproved',
      feedback: `Pico crítico de ${temperature}°C atingido. Risco de dano ao refratário e oxidação do banho.`,
      isCritical: true,
    };
  }

  if (
    temperature >= TEMPERATURE_THRESHOLDS.IDEAL_MIN &&
    temperature <= TEMPERATURE_THRESHOLDS.IDEAL_MAX
  ) {
    return {
      score: 100,
      status: 'approved',
      feedback: `Excelente controle térmico. Temperatura mantida em ${temperature}°C, dentro da faixa ideal.`,
    };
  }

  // Penalização proporcional baseada na distância do alvo (730)
  const target = 730;
  const diff = Math.abs(temperature - target);
  const score = Math.max(0, 100 - diff * 2); // Perde 2 pontos por grau de desvio

  if (score >= 70) {
    return {
      score,
      status: 'approved_with_warning',
      feedback: `Temperatura de ${temperature}°C está aceitável, mas fora da faixa ideal de 715-745°C. Ajuste a potência do maçarico.`,
    };
  }

  return {
    score,
    status: 'reproved',
    feedback: `Temperatura de ${temperature}°C está muito fora da faixa de operação. Risco à qualidade da liga.`,
  };
}

export function evaluateWetCharge(payload: any): ScoringResult {
  const isWet = Boolean(payload?.isWet);
  const userAccepted = Boolean(payload?.userAccepted);

  if (isWet && userAccepted) {
    return {
      score: 0,
      status: 'reproved',
      feedback: 'FALHA GRAVE: Carga úmida inserida no forno. Risco altíssimo de explosão de vapor!',
      isCritical: true,
    };
  }

  if (isWet && !userAccepted) {
    return {
      score: 100,
      status: 'approved',
      feedback: 'Excelente. Você identificou e rejeitou a sucata úmida corretamente.',
    };
  }

  if (!isWet && !userAccepted) {
    return {
      score: 40,
      status: 'approved_with_warning',
      feedback:
        'Você rejeitou uma carga seca e limpa. Isso atrasa o processo produtivo desnecessariamente.',
    };
  }

  return {
    score: 100,
    status: 'approved',
    feedback: 'Carga seca inserida com sucesso.',
  };
}

export function evaluateSkimming(payload: any): ScoringResult {
  const immersionTime = Number(payload?.immersionTime) || 0;
  const coveragePercent = Number(payload?.coveragePercent) || 0;

  if (immersionTime < SKIMMING_THRESHOLDS.MIN_IMMERSION_TIME_S) {
    return {
      score: 30,
      status: 'reproved',
      feedback: `Tempo de imersão do termopar insuficiente (${immersionTime}s). O mínimo é ${SKIMMING_THRESHOLDS.MIN_IMMERSION_TIME_S}s para leitura confiável.`,
    };
  }

  if (coveragePercent < 50) {
    return {
      score: 40,
      status: 'reproved',
      feedback: `Escumação muito fraca (Cobertura: ${coveragePercent}%). O banho permanece contaminado com escória.`,
    };
  }

  if (coveragePercent >= SKIMMING_THRESHOLDS.IDEAL_COVERAGE_PERCENT) {
    return {
      score: 100,
      status: 'approved',
      feedback: `Escumação excelente! Área limpa (${coveragePercent}%) e tempo de imersão adequado (${immersionTime}s).`,
    };
  }

  // Proporcional entre 50 e 90
  const score = Math.round(50 + (coveragePercent - 50) * 1.25);

  return {
    score,
    status: 'approved_with_warning',
    feedback: `Escumação razoável (${coveragePercent}%), mas pode melhorar para atingir o ideal de >90%.`,
  };
}

export function aggregateSessionScore(events: any[]): number {
  if (!events || events.length === 0) return 0;

  // Extrair o último score de cada etapa (caso o usuário tente várias vezes, pegamos o resultado final ou a média, aqui vamos pegar a média dos eventos daquela etapa ou o último. Pela regra simples, podemos pegar todos avaliados e fazer a média ponderada)

  let thermalScores: number[] = [];
  let wetChargeScores: number[] = [];
  let skimmingScores: number[] = [];

  for (const event of events) {
    if (event.type === 'thermal_control_completed') {
      const res = evaluateThermalControl(event.payload);
      thermalScores.push(res.score);
    }
    if (event.type === 'wet_charge_detected' || event.type === 'charge_inspected') {
      const res = evaluateWetCharge(event.payload);
      wetChargeScores.push(res.score);
    }
    if (event.type === 'skimming_completed') {
      const res = evaluateSkimming(event.payload);
      skimmingScores.push(res.score);
    }
  }

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const finalThermal = avg(thermalScores);
  const finalWet = avg(wetChargeScores);
  const finalSkim = avg(skimmingScores);

  // Se a sessão ainda não teve eventos para aquela etapa, aquele peso é desconsiderado ou zera?
  // O mais justo é calcular o peso com base no que foi feito.
  // Mas para o score agregado final assumimos a fórmula da documentação:
  let totalScore = 0;
  let totalWeight = 0;

  if (thermalScores.length > 0) {
    totalScore += finalThermal * SCORING_WEIGHTS.THERMAL_CONTROL;
    totalWeight += SCORING_WEIGHTS.THERMAL_CONTROL;
  }
  if (wetChargeScores.length > 0) {
    totalScore += finalWet * SCORING_WEIGHTS.WET_CHARGE;
    totalWeight += SCORING_WEIGHTS.WET_CHARGE;
  }
  if (skimmingScores.length > 0) {
    totalScore += finalSkim * SCORING_WEIGHTS.SKIMMING;
    totalWeight += SCORING_WEIGHTS.SKIMMING;
  }

  if (totalWeight === 0) return 0;

  // Normaliza o score para caso nem todas as etapas tenham sido feitas
  return Math.round(totalScore / totalWeight);
}
```

### apps/api/src/routes/v1/students.ts

```typescript
import { FastifyInstance } from 'fastify';
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
```

### apps/api/src/routes/v1/sessions.ts

```typescript
import { FastifyInstance } from 'fastify';
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
```

### apps/api/src/routes/v1/events.ts

```typescript
import { FastifyInstance } from 'fastify';
import { prisma } from '../../database/prisma.js';
import { createTrainingEventSchema, EventResponse } from '@fundivr/shared-schemas';
import {
  evaluateThermalControl,
  evaluateWetCharge,
  evaluateSkimming,
  ScoringResult,
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
      // emergency_triggered or ppe_check_completed might not have pure scoring logic yet
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
    } else if (
      scoringResult.status === 'reproved' ||
      scoringResult.status === 'approved_with_warning'
    ) {
      await prisma.occurrence.create({
        data: {
          sessionId,
          severity: scoringResult.status === 'reproved' ? 'warning' : 'info',
          message: scoringResult.feedback,
        },
      });
    }

    // Retorna
    const response: EventResponse = {
      score: scoringResult.score,
      status: scoringResult.status,
      feedback: scoringResult.feedback,
      nextMission: {
        id: 'next_mission_placeholder',
        difficulty: 'medium',
        params: {},
      },
    };

    return reply.send(response);
  });
}
```

### apps/api/src/routes/v1/occurrences.ts

```typescript
import { FastifyInstance } from 'fastify';
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
```

### apps/api/src/websocket/telemetry.ts

```typescript
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
```

### apps/api/src/tests/integration.test.ts

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../app.js';
import { prisma } from '../database/prisma.js';
import { FastifyInstance } from 'fastify';

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

  it('5. POST evento de carga úmida com erro e prova Occurrence', async () => {
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

  it('6. POST finalizar a sessão e validar o score agregado', async () => {
    const res = await server.post(`/api/v1/sessoes/${sessionId}/finalizar`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.finishedAt).not.toBeNull();

    // Thermal = 100 * 0.4 = 40
    // Wet = 0 * 0.3 = 0
    // Total = 40 / 0.7 = 57.14 -> 57 (arredondado)
    expect(res.body.score).toBe(57);
  });
});
```

### apps/api/src/tests/health.test.ts

```typescript
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
```

### packages/shared-schemas/src/index.ts

```typescript
import { z } from 'zod';

// ─── Experience Level ────────────────────────────────────────────────────────

export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

// ─── Session Status ──────────────────────────────────────────────────────────

export const sessionStatusSchema = z.enum(['pending', 'running', 'completed', 'cancelled']);

// ─── Occurrence Severity ─────────────────────────────────────────────────────

export const occurrenceSeveritySchema = z.enum(['info', 'warning', 'critical']);

// ─── Student ─────────────────────────────────────────────────────────────────

export const studentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  registration: z.string().min(1),
  experienceLevel: experienceLevelSchema,
  createdAt: z.string().datetime(),
});

export const createStudentSchema = z.object({
  name: z.string().optional(),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  experienceLevel: experienceLevelSchema.default('beginner'),
});

// ─── Training Session ────────────────────────────────────────────────────────

export const trainingSessionSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  status: sessionStatusSchema,
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  score: z.number().min(0).max(100).nullable(),
});

export const createTrainingSessionSchema = z.object({
  studentId: z.string().uuid('ID do aluno inválido'),
});

// ─── Training Event ──────────────────────────────────────────────────────────

export const trainingEventSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.string().min(1),
  stage: z.string().min(1),
  payload: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});

export const createTrainingEventSchema = z.object({
  sessionId: z.string().uuid('ID da sessão inválido'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  stage: z.string().min(1, 'Estágio é obrigatório'),
  payload: z.record(z.unknown()).default({}),
});

export const eventPayloadSchema = z.record(z.unknown());

export const eventResponseSchema = z.object({
  score: z.number(),
  status: z.string(),
  feedback: z.string(),
  nextMission: z
    .object({
      id: z.string(),
      difficulty: z.string(),
      params: z.record(z.unknown()).optional(),
    })
    .optional(),
});

// ─── Occurrence ──────────────────────────────────────────────────────────────

export const occurrenceSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  severity: occurrenceSeveritySchema,
  message: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const createOccurrenceSchema = z.object({
  sessionId: z.string().uuid('ID da sessão inválido'),
  severity: occurrenceSeveritySchema,
  message: z.string().min(1, 'Mensagem é obrigatória'),
});

// ─── WebSocket Telemetry ─────────────────────────────────────────────────────

export const wsTelemetryMessageSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.unknown()),
  timestamp: z.string().datetime(),
});

// ─── Health Check ────────────────────────────────────────────────────────────

export const healthCheckResponseSchema = z.object({
  status: z.literal('ok'),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionSchema>;
export type CreateTrainingEventInput = z.infer<typeof createTrainingEventSchema>;
export type CreateOccurrenceInput = z.infer<typeof createOccurrenceSchema>;
export type WsTelemetryMessageInput = z.infer<typeof wsTelemetryMessageSchema>;
export type EventPayload = z.infer<typeof eventPayloadSchema>;
export type EventResponse = z.infer<typeof eventResponseSchema>;
```

### packages/shared-types/src/index.ts

```typescript
// ─── Student ─────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  registration: string;
  experienceLevel: ExperienceLevel;
  createdAt: string;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// ─── Training Session ────────────────────────────────────────────────────────

export interface TrainingSession {
  id: string;
  studentId: string;
  status: SessionStatus;
  startedAt: string;
  finishedAt: string | null;
  score: number | null;
}

export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// ─── Training Event ──────────────────────────────────────────────────────────

export interface TrainingEvent {
  id: string;
  sessionId: string;
  type: string;
  stage: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

// ─── Occurrence ──────────────────────────────────────────────────────────────

export interface Occurrence {
  id: string;
  sessionId: string;
  severity: OccurrenceSeverity;
  message: string;
  createdAt: string;
}

export type OccurrenceSeverity = 'info' | 'warning' | 'critical';

// ─── API Responses ───────────────────────────────────────────────────────────

export interface HealthCheckResponse {
  status: 'ok';
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export interface WsTelemetryMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
```

### packages/config/src/index.ts

```typescript
// ─── Application Constants ───────────────────────────────────────────────────

export const APP_NAME = 'FundiVR Training Simulator';
export const APP_VERSION = '0.1.0';

// ─── Default Ports ───────────────────────────────────────────────────────────

export const DEFAULT_API_PORT = 3001;
export const DEFAULT_WEB_PORT = 5173;
export const DEFAULT_DB_PORT = 5432;

// ─── Default URLs ────────────────────────────────────────────────────────────

export const DEFAULT_API_URL = `http://localhost:${DEFAULT_API_PORT}`;
export const DEFAULT_WS_URL = `ws://localhost:${DEFAULT_API_PORT}/ws/telemetry`;
export const DEFAULT_DATABASE_URL =
  'postgresql://fundivr:fundivr123@localhost:5432/fundivr_db?schema=public';

// ─── Session Constraints ─────────────────────────────────────────────────────

export const MAX_SCORE = 100;
export const MIN_SCORE = 0;

// ─── WebSocket ───────────────────────────────────────────────────────────────

export const WS_TELEMETRY_PATH = '/ws/telemetry';
```

### apps/api/package.json

```json
{
  "name": "@fundivr/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@fastify/cors": "^10.0.0",
    "@fastify/websocket": "^11.0.0",
    "@fundivr/config": "workspace:*",
    "@fundivr/shared-schemas": "workspace:*",
    "@fundivr/shared-types": "workspace:*",
    "@prisma/client": "^6.0.0",
    "dotenv": "^16.4.0",
    "fastify": "^5.0.0",
    "pino-pretty": "^13.1.3",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.0",
    "prisma": "^6.0.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^2.1.0"
  }
}
```

### package.json

```json
{
  "name": "fundivr-training-simulator",
  "version": "0.1.0",
  "private": true,
  "description": "Simulador web para treinamento de operadores de fornos de fusão de alumínio",
  "packageManager": "pnpm@9.15.4",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "pnpm --parallel --filter \"./apps/**\" dev",
    "build": "pnpm --filter \"./packages/**\" build && pnpm --filter \"./apps/**\" build",
    "lint": "pnpm --parallel -r lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "test": "pnpm --parallel -r test",
    "clean": "pnpm -r exec -- rm -rf node_modules dist .turbo",
    "db:generate": "pnpm --filter api prisma:generate",
    "db:migrate": "pnpm --filter api prisma:migrate",
    "db:studio": "pnpm --filter api prisma:studio",
    "prepare": "husky"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^8.57.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.3.0",
    "typescript": "^5.5.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### docker-compose.yml

```yaml
services:
  # ─── PostgreSQL ───────────────────────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    container_name: fundivr-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: fundivr
      POSTGRES_PASSWORD: fundivr123
      POSTGRES_DB: fundivr_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U fundivr -d fundivr_db']
      interval: 5s
      timeout: 5s
      retries: 5

  # ─── API (Fastify) ───────────────────────────────────────────────────────
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: fundivr-api
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://fundivr:fundivr123@postgres:5432/fundivr_db?schema=public
      API_PORT: 3001
      API_HOST: '0.0.0.0'
      NODE_ENV: development
      JWT_SECRET: docker-dev-secret
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      postgres:
        condition: service_healthy

  # ─── WEB (React + Vite) ──────────────────────────────────────────────────
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: fundivr-web
    restart: unless-stopped
    ports:
      - '5173:80'
    depends_on:
      - api

volumes:
  postgres_data:
```

## Contratos de resposta

### eventResponseSchema

```typescript
export const eventResponseSchema = z.object({
  score: z.number(),
  status: z.string(),
  feedback: z.string(),
  nextMission: z
    .object({
      id: z.string(),
      difficulty: z.string(),
      params: z.record(z.unknown()).optional(),
    })
    .optional(),
});
```

### Exemplo Real - Evento Térmico (thermal_control_completed)

```json
{
  "score": 0,
  "status": "reproved",
  "feedback": "Temperatura de 795°C está muito fora da faixa de operação. Risco à qualidade da liga.",
  "nextMission": {
    "id": "next_mission_placeholder",
    "difficulty": "medium",
    "params": {}
  }
}
```

### Exemplo Real - Carga Úmida (wet_charge_detected aceita por engano)

```json
{
  "score": 0,
  "status": "reproved",
  "feedback": "FALHA GRAVE: Carga úmida inserida no forno. Risco altíssimo de explosão de vapor!",
  "nextMission": {
    "id": "next_mission_placeholder",
    "difficulty": "medium",
    "params": {}
  }
}
```
