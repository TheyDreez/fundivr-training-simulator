import axios from 'axios';
import type { TrainingSession, Student, Occurrence } from '@fundivr/shared-types';
import type { EventResponse } from '@fundivr/shared-schemas';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const demoDelay = () => new Promise((res) => setTimeout(res, 400));

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
});

// Respostas expandidas que combinam os tipos base
export type SessionWithOccurrences = TrainingSession & {
  occurrences: Occurrence[];
  events: any[];
};

export async function createStudent(data: {
  registration: string;
  name?: string;
  experienceLevel?: string;
}): Promise<Student> {
  if (DEMO_MODE) {
    await demoDelay();
    return {
      id: 'demo-student-id',
      registration: data.registration,
      name: data.name || 'Operador Demo',
      experienceLevel: (data.experienceLevel as any) || 'beginner',
      createdAt: new Date().toISOString(),
    };
  }
  const response = await api.post<Student>('/alunos', data);
  return response.data;
}

export async function getStudentProfile(registration: string): Promise<Student> {
  if (DEMO_MODE) {
    await demoDelay();
    return {
      id: 'demo-student-id',
      registration,
      name: 'Operador Demo',
      experienceLevel: 'beginner',
      createdAt: new Date().toISOString(),
    };
  }
  const response = await api.get<Student>(`/alunos/${registration}/perfil`);
  return response.data;
}

export async function createSession(studentId: string): Promise<TrainingSession> {
  if (DEMO_MODE) {
    await demoDelay();
    return {
      id: 'demo-session-id',
      studentId,
      status: 'running',
      score: null,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
  }
  const response = await api.post<TrainingSession>('/sessoes', { studentId });
  return response.data;
}

export async function postEvent(
  sessionId: string,
  payload: { type: string; stage: string; payload: any },
): Promise<EventResponse> {
  if (DEMO_MODE) {
    await demoDelay();
    switch (payload.stage) {
      case 'vestiario':
        if (payload.payload.isComplete) {
          return { score: 100, status: 'approved', feedback: 'EPI validado. Acesso liberado.' };
        }
        return { score: 0, status: 'reproved', feedback: 'EPI incompleto. Risco de acidente.' };

      case 'carregamento':
        if (payload.payload.isWet && payload.payload.userAccepted) {
          return {
            score: 0,
            status: 'reproved',
            feedback: 'Erro Crítico: Carga úmida aceita. Risco de explosão.',
          };
        }
        if (payload.payload.isWet && !payload.payload.userAccepted) {
          return {
            score: 100,
            status: 'approved',
            feedback: 'Correto: Carga úmida rejeitada corretamente.',
          };
        }
        return { score: 100, status: 'approved', feedback: 'Carga inspecionada e aceita.' };

      case 'fusao': {
        const temp = payload.payload.temperature;
        if (temp >= 720 && temp <= 740) {
          return { score: 100, status: 'approved', feedback: 'Temperatura ideal atingida.' };
        } else if (temp > 740) {
          return {
            score: 50,
            status: 'approved_with_warning',
            feedback: 'Atenção: Temperatura acima do alvo. Desperdício de energia.',
          };
        }
        return {
          score: 50,
          status: 'approved_with_warning',
          feedback: 'Atenção: Temperatura abaixo do ideal. Risco operacional.',
        };
      }

      case 'escumacao':
        if (payload.payload.coveragePercent >= 80) {
          return { score: 100, status: 'approved', feedback: 'Escumação e termopar validados.' };
        }
        return {
          score: 50,
          status: 'approved_with_warning',
          feedback: 'Limpeza parcial do banho metálico.',
        };

      case 'vazamento':
        if (payload.payload.reactionTime <= 10) {
          return {
            score: 100,
            status: 'approved',
            feedback: `Emergência controlada rapidamente (${payload.payload.reactionTime}s).`,
          };
        }
        return {
          score: 30,
          status: 'reproved',
          feedback: `Reação muito lenta (${payload.payload.reactionTime}s). Risco alto.`,
        };

      default:
        return { score: 100, status: 'approved', feedback: 'Ação validada.' };
    }
  }
  const response = await api.post<EventResponse>(`/sessoes/${sessionId}/eventos`, payload);
  return response.data;
}

export async function finishSession(sessionId: string): Promise<TrainingSession> {
  if (DEMO_MODE) {
    await demoDelay();
    return {
      id: sessionId,
      studentId: 'demo-student-id',
      status: 'completed',
      score: 88,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      finishedAt: new Date().toISOString(),
    };
  }
  const response = await api.post<TrainingSession>(`/sessoes/${sessionId}/finalizar`);
  return response.data;
}

export async function getSession(sessionId: string): Promise<SessionWithOccurrences> {
  if (DEMO_MODE) {
    await demoDelay();
    return {
      id: sessionId,
      studentId: 'demo-student-id',
      status: 'completed',
      score: 88,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      finishedAt: new Date().toISOString(),
      occurrences: [
        {
          id: '1',
          sessionId,
          severity: 'warning',
          message: 'Carga com umidade detectada.',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          sessionId,
          severity: 'critical',
          message: 'Pico de temperatura excedeu limite seguro.',
          createdAt: new Date().toISOString(),
        },
      ],
      events: [],
    };
  }
  const response = await api.get<SessionWithOccurrences>(`/sessoes/${sessionId}`);
  return response.data;
}
