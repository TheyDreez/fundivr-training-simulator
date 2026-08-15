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

export const TRAINING_STAGES = {
  PPE: 'vestiario',
  CHARGE: 'carregamento',
  THERMAL: 'fusao',
  SKIMMING: 'escumacao',
  EMERGENCY: 'vazamento',
} as const;

export type TrainingStage = (typeof TRAINING_STAGES)[keyof typeof TRAINING_STAGES];

export const EVENT_TYPES = {
  PPE_CHECK: 'ppe_check_completed',
  CHARGE_INSPECTED: 'charge_inspected',
  WET_CHARGE_DETECTED: 'wet_charge_detected',
  THERMAL_CONTROL: 'thermal_control_completed',
  SKIMMING_COMPLETED: 'skimming_completed',
  EMERGENCY_TRIGGERED: 'emergency_triggered',
} as const;

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
