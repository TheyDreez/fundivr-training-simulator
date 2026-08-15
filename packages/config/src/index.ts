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
