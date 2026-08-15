# Export do Frontend (Sprint 3)

## Estrutura de Diretórios (`apps/web/src`)

```text
├── App.tsx
├── assets
│   └── .gitkeep
├── components
│   ├── .gitkeep
│   ├── layout
│   │   └── SimLayout.tsx
│   └── stages
│       ├── ChargeInspection.tsx
│       ├── Emergency.tsx
│       ├── PpeCheck.tsx
│       ├── Skimming.tsx
│       └── ThermalControl.tsx
├── features
│   └── .gitkeep
├── hooks
│   └── .gitkeep
├── index.css
├── layouts
│   └── MainLayout.tsx
├── main.tsx
├── pages
│   ├── Debrief.tsx
│   ├── Entry.tsx
│   ├── Home.tsx
│   └── Simulator.tsx
├── routes
│   └── index.tsx
├── schemas
│   └── .gitkeep
├── services
│   └── api.ts
├── stores
│   ├── appStore.ts
│   └── useSimulatorStore.ts
├── types
│   └── .gitkeep
└── vite-env.d.ts
```

### apps/web/package.json

```json
{
  "name": "@fundivr/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@fundivr/config": "workspace:*",
    "@fundivr/shared-schemas": "workspace:*",
    "@fundivr/shared-types": "workspace:*",
    "@tanstack/react-query": "^5.60.0",
    "axios": "^1.7.0",
    "framer-motion": "^11.11.0",
    "lucide-react": "^1.31.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.28.0",
    "recharts": "^2.13.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

### apps/web/src/App.tsx

```tsx
import { Routes, Route } from 'react-router-dom';
import { Entry } from './pages/Entry';
import { Simulator } from './pages/Simulator';
import { Debrief } from './pages/Debrief';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route path="/simulador" element={<Simulator />} />
      <Route path="/debrief" element={<Debrief />} />
    </Routes>
  );
}
```

### apps/web/src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

### apps/web/src/services/api.ts

```ts
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
```

### apps/web/src/stores/useSimulatorStore.ts

```ts
import { create } from 'zustand';
import type { Student, TrainingSession, TrainingStage } from '@fundivr/shared-types';
import { TRAINING_STAGES } from '@fundivr/shared-types';

export interface SimulatorState {
  student: Student | null;
  session: TrainingSession | null;
  currentStage: TrainingStage | 'debrief';
  lastFeedback: {
    status: 'approved' | 'approved_with_warning' | 'reproved' | string;
    message: string;
  } | null;
  accumulatedScore: number;
  completedStages: Record<string, boolean>;
  blockedStages: Record<string, boolean>;
  stageScores: Record<string, number>; // Grava os scores retornados pela API

  // Actions
  setStudent: (student: Student) => void;
  setSession: (session: TrainingSession) => void;
  setCurrentStage: (stage: TrainingStage | 'debrief') => void;
  setFeedback: (status: string, message: string) => void;
  setScore: (score: number) => void;
  setStageScore: (stage: string, score: number) => void;
  markStageCompleted: (stage: string) => void;
  markStageBlocked: (stage: string) => void;
  reset: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  student: null,
  session: null,
  currentStage: TRAINING_STAGES.PPE,
  lastFeedback: null,
  accumulatedScore: 0,
  completedStages: {},
  blockedStages: {},
  stageScores: {},

  setStudent: (student) => set({ student }),
  setSession: (session) => set({ session }),
  setCurrentStage: (stage) => set({ currentStage: stage, lastFeedback: null }),
  setFeedback: (status, message) => set({ lastFeedback: { status, message } }),
  setScore: (score) => set({ accumulatedScore: score }),
  setStageScore: (stage, score) =>
    set((state) => ({
      stageScores: { ...state.stageScores, [stage]: score },
    })),
  markStageCompleted: (stage) =>
    set((state) => ({
      completedStages: { ...state.completedStages, [stage]: true },
    })),
  markStageBlocked: (stage) =>
    set((state) => ({
      blockedStages: { ...state.blockedStages, [stage]: true },
    })),
  reset: () =>
    set({
      student: null,
      session: null,
      currentStage: TRAINING_STAGES.PPE,
      lastFeedback: null,
      accumulatedScore: 0,
      completedStages: {},
      blockedStages: {},
      stageScores: {},
    }),
}));
```

### apps/web/src/pages/Entry.tsx

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createStudent, createSession } from '../services/api';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { HardHat, LogIn } from 'lucide-react';

export function Entry() {
  const [registration, setRegistration] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const setStudent = useSimulatorStore((s) => s.setStudent);
  const setSession = useSimulatorStore((s) => s.setSession);
  const resetStore = useSimulatorStore((s) => s.reset);

  const startMutation = useMutation({
    mutationFn: async () => {
      // Cria/recupera aluno
      const student = await createStudent({ registration, name });
      // Inicia sessão
      const session = await createSession(student.id);
      return { student, session };
    },
    onSuccess: (data) => {
      resetStore();
      setStudent(data.student);
      setSession(data.session);
      navigate('/simulador');
    },
    onError: (err) => {
      console.error(err);
      alert('Erro ao iniciar sessão. Verifique os dados e a conexão.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    startMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500/10 p-4 rounded-full mb-4 ring-1 ring-amber-500/30">
            <HardHat className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-wider">FundiVR</h1>
          <p className="text-slate-400 text-sm mt-1">Simulador de Treinamento em Fundição</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Matrícula</label>
            <input
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              placeholder="Ex: MAT-1234"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome (Opcional)</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={startMutation.isPending || !registration}
            className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startMutation.isPending ? (
              <span className="animate-pulse">Conectando...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Treinamento
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### apps/web/src/pages/Simulator.tsx

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { SimLayout } from '../components/layout/SimLayout';
import { TRAINING_STAGES } from '@fundivr/shared-types';

import { PpeCheck } from '../components/stages/PpeCheck';
import { ChargeInspection } from '../components/stages/ChargeInspection';
import { ThermalControl } from '../components/stages/ThermalControl';
import { Skimming } from '../components/stages/Skimming';
import { Emergency } from '../components/stages/Emergency';

export function Simulator() {
  const { session, currentStage } = useSimulatorStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <SimLayout>
      {currentStage === TRAINING_STAGES.PPE && <PpeCheck />}
      {currentStage === TRAINING_STAGES.CHARGE && <ChargeInspection />}
      {currentStage === TRAINING_STAGES.THERMAL && <ThermalControl />}
      {currentStage === TRAINING_STAGES.SKIMMING && <Skimming />}
      {currentStage === TRAINING_STAGES.EMERGENCY && <Emergency />}
    </SimLayout>
  );
}
```

### apps/web/src/pages/Debrief.tsx

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import type { SessionWithOccurrences } from '../services/api';
import { finishSession, getSession } from '../services/api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TRAINING_STAGES } from '@fundivr/shared-types';
import { RotateCcw, AlertOctagon, AlertTriangle } from 'lucide-react';

export function Debrief() {
  const { session, student, accumulatedScore, stageScores, reset } = useSimulatorStore();
  const navigate = useNavigate();

  const [data, setData] = useState<SessionWithOccurrences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    async function loadData() {
      try {
        await finishSession(session!.id);
        const fullSession = await getSession(session!.id);
        setData(fullSession);
      } catch (err) {
        console.error('Erro ao finalizar sessão', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-xl animate-pulse text-amber-500">Compilando Resultados...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-xl text-rose-500">Erro ao carregar os dados.</div>
      </div>
    );
  }

  // Prepara dados para o gráfico de Radar (Competências)
  const chartData = [
    { subject: 'EPI & Seg', A: stageScores[TRAINING_STAGES.PPE] || 0, fullMark: 100 },
    { subject: 'Carga', A: stageScores[TRAINING_STAGES.CHARGE] || 0, fullMark: 100 },
    { subject: 'Térmica', A: stageScores[TRAINING_STAGES.THERMAL] || 0, fullMark: 100 },
    { subject: 'Escumação', A: stageScores[TRAINING_STAGES.SKIMMING] || 0, fullMark: 100 },
    { subject: 'Emergência', A: stageScores[TRAINING_STAGES.EMERGENCY] || 0, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-5xl mx-auto w-full">
        <header className="flex items-end justify-between mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-amber-500">
              Debriefing
            </h1>
            <div className="text-slate-400 mt-2">
              Operador:{' '}
              <span className="text-slate-200">
                {student?.name} ({student?.registration})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 uppercase tracking-widest mb-1">
              Score Global Final
            </div>
            <div className="text-5xl font-mono font-bold text-emerald-400">
              {data.score || accumulatedScore}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Radar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center shadow-xl">
            <h2 className="text-lg font-semibold text-slate-300 mb-6 uppercase tracking-wider">
              Desempenho por Competência
            </h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occurrences */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl flex flex-col">
            <h2 className="text-lg font-semibold text-slate-300 mb-6 uppercase tracking-wider">
              Registro de Ocorrências
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {data.occurrences.length === 0 ? (
                <div className="text-emerald-500 bg-emerald-950/30 p-4 rounded-lg text-sm text-center border border-emerald-500/20">
                  Nenhuma ocorrência registrada. Excelente operação!
                </div>
              ) : (
                data.occurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className={`p-4 rounded-lg border flex gap-3 items-start
                    ${occ.severity === 'critical' ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'}
                  `}
                  >
                    <div className="mt-0.5">
                      {occ.severity === 'critical' ? (
                        <AlertOctagon className="w-5 h-5 text-rose-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold uppercase text-xs opacity-75 mr-2">
                        [{occ.severity}]
                      </span>
                      {occ.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 px-8 rounded-lg transition-colors flex items-center gap-3 border border-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
            Nova Sessão de Treinamento
          </button>
        </div>
      </div>
    </div>
  );
}
```

### apps/web/src/components/layout/SimLayout.tsx

```tsx
import React from 'react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES } from '@fundivr/shared-types';
import {
  Shield,
  Truck,
  Flame,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Lock,
  AlertOctagon,
} from 'lucide-react';

const STEPS = [
  { id: TRAINING_STAGES.PPE, name: 'Vestiário / EPI', icon: Shield },
  { id: TRAINING_STAGES.CHARGE, name: 'Pátio de Carga', icon: Truck },
  { id: TRAINING_STAGES.THERMAL, name: 'Forno / IHM', icon: Flame },
  { id: TRAINING_STAGES.SKIMMING, name: 'Escumação', icon: Droplets },
  { id: TRAINING_STAGES.EMERGENCY, name: 'Emergência', icon: AlertTriangle },
];

export function SimLayout({ children }: { children: React.ReactNode }) {
  const { student, currentStage, accumulatedScore, completedStages, blockedStages, lastFeedback } =
    useSimulatorStore();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar: Stepper Map */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-wider uppercase text-amber-500">FundiVR</h2>
          <div className="mt-2 text-sm text-slate-400">
            <div>Op: {student?.name || 'Desconhecido'}</div>
            <div className="font-mono text-xs">{student?.registration}</div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Mapa do Processo
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
            {STEPS.map((step) => {
              const isActive = currentStage === step.id;
              const isCompleted = completedStages[step.id];
              const isBlocked = blockedStages[step.id];

              const Icon = step.icon;

              let iconBg = 'bg-slate-800 text-slate-500';
              if (isCompleted)
                iconBg = 'bg-emerald-900/50 text-emerald-500 ring-1 ring-emerald-500/50';
              if (isActive) iconBg = 'bg-amber-900/50 text-amber-500 ring-2 ring-amber-500';
              if (isBlocked) iconBg = 'bg-rose-900/50 text-rose-500 ring-1 ring-rose-500/50';

              return (
                <div
                  key={step.id}
                  className={`relative flex items-center gap-4 ${isBlocked ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`z-10 flex items-center justify-center w-9 h-9 rounded-full ${iconBg}`}
                  >
                    {isBlocked ? (
                      <Lock className="w-4 h-4" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`font-medium text-sm ${isActive ? 'text-amber-500' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      {step.name}
                    </div>
                    {isBlocked && (
                      <div className="text-xs text-rose-500 font-semibold mt-0.5">
                        Acesso Bloqueado
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HUD Topo */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Status do Sistema:</span>
            <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Score Global</span>
              <span className="text-2xl font-mono font-bold text-amber-500">
                {accumulatedScore}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Center Stage */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">{children}</div>
        </div>

        {/* Feedback Panel (Overlay Bottom) */}
        {lastFeedback && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-900/95 to-transparent pointer-events-none">
            <div
              className={`max-w-3xl mx-auto p-4 rounded-lg border backdrop-blur-md flex items-start gap-3 shadow-2xl pointer-events-auto
              ${
                lastFeedback.status === 'approved'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : lastFeedback.status === 'approved_with_warning'
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }
            `}
            >
              <div className="mt-0.5">
                {lastFeedback.status === 'reproved' ? (
                  <AlertOctagon className="w-5 h-5 text-rose-500" />
                ) : lastFeedback.status === 'approved_with_warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 font-medium">{lastFeedback.message}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

### apps/web/src/components/stages/PpeCheck.tsx

```tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export function PpeCheck() {
  const {
    session,
    setFeedback,
    setCurrentStage,
    markStageCompleted,
    markStageBlocked,
    lastFeedback,
    setScore,
    setStageScore,
  } = useSimulatorStore();
  const [helmet, setHelmet] = useState(false);
  const [gloves, setGloves] = useState(false);
  const [boots, setBoots] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      postEvent(session!.id, {
        type: EVENT_TYPES.PPE_CHECK,
        stage: TRAINING_STAGES.PPE,
        payload: { isComplete: helmet && gloves && boots },
      }),
    onSuccess: (data) => {
      setFeedback(data.status, data.feedback);
      setScore(data.score); // Score agregado vindo da API
      setStageScore(TRAINING_STAGES.PPE, data.score);
      if (data.status === 'reproved') {
        // Bloqueia o acesso à próxima zona (Forno) conforme regra
        markStageBlocked(TRAINING_STAGES.THERMAL);
      }
    },
  });

  const handleConfirm = () => {
    mutation.mutate();
  };

  const handleNext = () => {
    markStageCompleted(TRAINING_STAGES.PPE);
    setCurrentStage(TRAINING_STAGES.CHARGE);
  };

  const hasReplied = !!lastFeedback;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-lg ring-1 ring-indigo-500/30">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Verificação de EPI</h2>
            <p className="text-sm text-slate-400">
              Confirme o equipamento de segurança antes de acessar o pátio.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 accent-indigo-500"
              checked={helmet}
              onChange={(e) => setHelmet(e.target.checked)}
              disabled={hasReplied}
            />
            <span className="text-slate-200 font-medium">Capacete com viseira refletiva</span>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 accent-indigo-500"
              checked={gloves}
              onChange={(e) => setGloves(e.target.checked)}
              disabled={hasReplied}
            />
            <span className="text-slate-200 font-medium">Luvas aluminizadas de cano longo</span>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 accent-indigo-500"
              checked={boots}
              onChange={(e) => setBoots(e.target.checked)}
              disabled={hasReplied}
            />
            <span className="text-slate-200 font-medium">Botas de segurança com bico de aço</span>
          </label>
        </div>

        {!hasReplied ? (
          <button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Validando...' : 'Confirmar e Acessar'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Avançar para Pátio de Carga <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### apps/web/src/components/stages/ChargeInspection.tsx

```tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { Truck, ArrowRight, Check, X } from 'lucide-react';

export function ChargeInspection() {
  const {
    session,
    setFeedback,
    setCurrentStage,
    markStageCompleted,
    lastFeedback,
    setScore,
    setStageScore,
  } = useSimulatorStore();

  // Para este mockup, vamos simular que a carga apresentada é úmida.
  const [isWet] = useState(true);

  const mutation = useMutation({
    mutationFn: (userAccepted: boolean) => {
      return postEvent(session!.id, {
        type: isWet ? EVENT_TYPES.WET_CHARGE_DETECTED : EVENT_TYPES.CHARGE_INSPECTED,
        stage: TRAINING_STAGES.CHARGE,
        payload: { isWet, userAccepted },
      });
    },
    onSuccess: (data) => {
      setFeedback(data.status, data.feedback);
      setScore(data.score);
      setStageScore(TRAINING_STAGES.CHARGE, data.score);
    },
  });

  const handleNext = () => {
    markStageCompleted(TRAINING_STAGES.CHARGE);
    setCurrentStage(TRAINING_STAGES.THERMAL);
  };

  const hasReplied = !!lastFeedback;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-lg ring-1 ring-blue-500/30">
            <Truck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Inspeção de Carga (Sucata)</h2>
            <p className="text-sm text-slate-400">
              Analise visualmente o lote antes de autorizar o carregamento no forno.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 mb-8 text-center relative overflow-hidden">
          {/* Simulação visual do lote */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-4">⚙️🧱</div>
            <h3 className="text-lg font-medium text-slate-200">Lote #8849-B</h3>
            <p className="text-slate-400 text-sm mt-2">
              Anotações visuais: Peças metálicas irregulares.
              {isWet && (
                <span className="text-cyan-400 ml-1">
                  Presença de poças d'água e umidade visível na superfície.
                </span>
              )}
            </p>
          </div>
        </div>

        {!hasReplied ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => mutation.mutate(false)}
              disabled={mutation.isPending}
              className="bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-2"
            >
              <X className="w-6 h-6" />
              Rejeitar Carga
            </button>
            <button
              onClick={() => mutation.mutate(true)}
              disabled={mutation.isPending}
              className="bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              Aprovar Carga
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Avançar para Forno / IHM <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### apps/web/src/components/stages/ThermalControl.tsx

```tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { Flame, ArrowRight, Thermometer } from 'lucide-react';

export function ThermalControl() {
  const {
    session,
    setFeedback,
    setCurrentStage,
    markStageCompleted,
    lastFeedback,
    setScore,
    setStageScore,
  } = useSimulatorStore();

  // O usuário controla a temperatura pelo slider
  const [temperature, setTemperature] = useState(700);

  const mutation = useMutation({
    mutationFn: () =>
      postEvent(session!.id, {
        type: EVENT_TYPES.THERMAL_CONTROL,
        stage: TRAINING_STAGES.THERMAL,
        payload: { temperature },
      }),
    onSuccess: (data) => {
      setFeedback(data.status, data.feedback);
      setScore(data.score);
      setStageScore(TRAINING_STAGES.THERMAL, data.score);
    },
  });

  const handleNext = () => {
    markStageCompleted(TRAINING_STAGES.THERMAL);
    setCurrentStage(TRAINING_STAGES.SKIMMING);
  };

  const hasReplied = !!lastFeedback;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-lg ring-1 ring-amber-500/30">
            <Flame className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Painel IHM: Controle Térmico</h2>
            <p className="text-sm text-slate-400">
              Ajuste a potência para atingir a temperatura ideal de fusão.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 mb-8 flex flex-col items-center">
          <div className="text-5xl font-mono font-bold text-amber-500 mb-2 flex items-center gap-2">
            <Thermometer className="w-10 h-10" />
            {temperature}°C
          </div>
          <div className="text-slate-500 text-sm mb-8">Temperatura do Banho Metálico</div>

          <div className="w-full max-w-md">
            <input
              type="range"
              min="650"
              max="850"
              step="5"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              disabled={hasReplied || mutation.isPending}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
              <span>650°C</span>
              <span>Alvo: 730°C</span>
              <span>850°C</span>
            </div>
          </div>
        </div>

        {!hasReplied ? (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Enviando...' : 'Confirmar Temperatura'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Avançar para Escumação <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### apps/web/src/components/stages/Skimming.tsx

```tsx
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { Droplets, ArrowRight, Timer } from 'lucide-react';

export function Skimming() {
  const {
    session,
    setFeedback,
    setCurrentStage,
    markStageCompleted,
    lastFeedback,
    setScore,
    setStageScore,
  } = useSimulatorStore();

  const [coveragePercent, setCoveragePercent] = useState(50);
  const [isImmersing, setIsImmersing] = useState(false);
  const [immersionTime, setImmersionTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isImmersing && !lastFeedback) {
      interval = setInterval(() => {
        setImmersionTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isImmersing, lastFeedback]);

  const mutation = useMutation({
    mutationFn: () =>
      postEvent(session!.id, {
        type: EVENT_TYPES.SKIMMING_COMPLETED,
        stage: TRAINING_STAGES.SKIMMING,
        payload: { coveragePercent, immersionTime },
      }),
    onSuccess: (data) => {
      setFeedback(data.status, data.feedback);
      setScore(data.score);
      setStageScore(TRAINING_STAGES.SKIMMING, data.score);
      setIsImmersing(false);
    },
  });

  const handleNext = () => {
    markStageCompleted(TRAINING_STAGES.SKIMMING);
    setCurrentStage(TRAINING_STAGES.EMERGENCY);
  };

  const hasReplied = !!lastFeedback;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-teal-500/10 rounded-lg ring-1 ring-teal-500/30">
            <Droplets className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Escumação e Medição</h2>
            <p className="text-sm text-slate-400">
              Limpe a escória e meça a temperatura do banho limpo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Controle de Escória */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Área Limpa (%)</h3>
            <div className="text-4xl font-mono font-bold text-teal-400 mb-6">
              {coveragePercent}%
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={coveragePercent}
              onChange={(e) => setCoveragePercent(Number(e.target.value))}
              disabled={hasReplied || mutation.isPending}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          {/* Medição (Termopar) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Termopar Descartável</h3>

            <button
              onMouseDown={() => setIsImmersing(true)}
              onMouseUp={() => setIsImmersing(false)}
              onMouseLeave={() => setIsImmersing(false)}
              onTouchStart={() => setIsImmersing(true)}
              onTouchEnd={() => setIsImmersing(false)}
              disabled={hasReplied || mutation.isPending}
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-colors select-none ${
                isImmersing
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 scale-95'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 cursor-pointer'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Timer className="w-8 h-8 mb-2" />
              <span className="font-mono text-xl font-bold">{immersionTime}s</span>
            </button>
            <p className="text-xs text-slate-500 mt-4 text-center">Segure para imergir a lança.</p>
          </div>
        </div>

        {!hasReplied ? (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (coveragePercent === 0 && immersionTime === 0)}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Enviando...' : 'Confirmar Processo'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Avançar para Vazamento <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### apps/web/src/components/stages/Emergency.tsx

```tsx
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { AlertTriangle, ArrowRight, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Emergency() {
  const {
    session,
    setFeedback,
    markStageCompleted,
    lastFeedback,
    setCurrentStage,
    setScore,
    setStageScore,
  } = useSimulatorStore();
  const navigate = useNavigate();

  const [reactionTime, setReactionTime] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isTriggered) {
      interval = setInterval(() => {
        setReactionTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTriggered]);

  const mutation = useMutation({
    mutationFn: () =>
      postEvent(session!.id, {
        type: EVENT_TYPES.EMERGENCY_TRIGGERED,
        stage: TRAINING_STAGES.EMERGENCY,
        payload: { reactionTime },
      }),
    onSuccess: (data) => {
      setFeedback(data.status, data.feedback);
      setScore(data.score);
      setStageScore(TRAINING_STAGES.EMERGENCY, data.score);
    },
  });

  const handleTrigger = () => {
    setIsTriggered(true);
    mutation.mutate();
  };

  const handleNext = () => {
    markStageCompleted(TRAINING_STAGES.EMERGENCY);
    setCurrentStage('debrief');
    navigate('/debrief');
  };

  const hasReplied = !!lastFeedback;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl w-full relative overflow-hidden">
        {/* Sirene Simulação Visual */}
        {!isTriggered && (
          <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none"></div>
        )}

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="p-3 bg-rose-500/10 rounded-lg ring-1 ring-rose-500/30">
            <BellRing className="w-8 h-8 text-rose-500 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Vazamento Detectado!</h2>
            <p className="text-sm text-slate-400">
              Tempo de reação atual:{' '}
              <span className="font-mono text-rose-400 font-bold">{reactionTime}s</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-8 relative z-10">
          <button
            onClick={handleTrigger}
            disabled={hasReplied || mutation.isPending}
            className={`w-48 h-48 rounded-full border-8 shadow-2xl flex flex-col items-center justify-center transition-all ${
              isTriggered
                ? 'bg-rose-900 border-rose-800 text-rose-500 scale-95'
                : 'bg-rose-600 border-rose-700 text-white hover:bg-rose-500 hover:scale-105 hover:shadow-rose-500/50 cursor-pointer'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <AlertTriangle className="w-16 h-16 mb-2" />
            <span className="font-bold text-xl uppercase tracking-wider">Parada</span>
          </button>
        </div>

        {hasReplied && (
          <button
            onClick={handleNext}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 relative z-10 mt-6"
          >
            Finalizar Sessão e ver Resultados <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### packages/shared-types/src/index.ts

```ts
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
```

## Prova do Loop

### Trecho onde uma etapa dispara `postEvent` e reage no `onSuccess` (ThermalControl.tsx)

```tsx
const mutation = useMutation({
  mutationFn: () =>
    postEvent(session!.id, {
      type: EVENT_TYPES.THERMAL_CONTROL,
      stage: TRAINING_STAGES.THERMAL,
      payload: { temperature },
    }),
  onSuccess: (data) => {
    // A UI não calcula o feedback nem os pontos. Tudo vem do backend:
    setFeedback(data.status, data.feedback);
    setScore(data.score);
    setStageScore(TRAINING_STAGES.THERMAL, data.score);
  },
});
```

### Confirmação explícita sobre a origem do score/feedback

O arquivo de Store (`useSimulatorStore.ts`) prova que a arquitetura não possui funções de avaliação local. Todo o progresso visual de sucesso ou bloqueio advém do `data.status` da `EventResponse` retornada pela requisição, satisfazendo a restrição da regra de ouro. A UI se torna inteiramente reativa às determinações exclusivas do backend.
