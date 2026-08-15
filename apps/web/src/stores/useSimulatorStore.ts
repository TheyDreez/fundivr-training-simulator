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
