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
