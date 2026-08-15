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

export type SessionStatus = 'pending' | 'running' | 'completed' | 'cancelled';

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
