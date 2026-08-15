import axios from 'axios';
import type { TrainingSession, Student, Occurrence } from '@fundivr/shared-types';
import type { EventResponse } from '@fundivr/shared-schemas';

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
  const response = await api.post<Student>('/alunos', data);
  return response.data;
}

export async function getStudentProfile(registration: string): Promise<Student> {
  const response = await api.get<Student>(`/alunos/${registration}/perfil`);
  return response.data;
}

export async function createSession(studentId: string): Promise<TrainingSession> {
  const response = await api.post<TrainingSession>('/sessoes', { studentId });
  return response.data;
}

export async function postEvent(
  sessionId: string,
  payload: { type: string; stage: string; payload: any },
): Promise<EventResponse> {
  const response = await api.post<EventResponse>(`/sessoes/${sessionId}/eventos`, payload);
  return response.data;
}

export async function finishSession(sessionId: string): Promise<TrainingSession> {
  const response = await api.post<TrainingSession>(`/sessoes/${sessionId}/finalizar`);
  return response.data;
}

export async function getSession(sessionId: string): Promise<SessionWithOccurrences> {
  const response = await api.get<SessionWithOccurrences>(`/sessoes/${sessionId}`);
  return response.data;
}
