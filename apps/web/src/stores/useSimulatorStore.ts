import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  completedStages: Record<string, boolean>;
  blockedStages: Record<string, boolean>;
  stageScores: Record<string, number>;

  // Actions
  setStudent: (student: Student) => void;
  setSession: (session: TrainingSession) => void;
  setCurrentStage: (stage: TrainingStage | 'debrief') => void;
  setFeedback: (status: string, message: string) => void;
  setStageScore: (stage: string, score: number) => void;
  markStageCompleted: (stage: string) => void;
  markStageBlocked: (stage: string) => void;
  unblockStage: (stage: string) => void;
  reset: () => void;
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set) => ({
      student: null,
      session: null,
      currentStage: TRAINING_STAGES.PPE,
      lastFeedback: null,
      completedStages: {},
      blockedStages: {},
      stageScores: {},

      setStudent: (student) => set({ student }),
      setSession: (session) => set({ session }),
      setCurrentStage: (stage) => set({ currentStage: stage, lastFeedback: null }),
      setFeedback: (status, message) => set({ lastFeedback: { status, message } }),
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
      unblockStage: (stage) =>
        set((state) => {
          const newBlocked = { ...state.blockedStages };
          delete newBlocked[stage];
          return { blockedStages: newBlocked };
        }),
      reset: () =>
        set({
          student: null,
          session: null,
          currentStage: TRAINING_STAGES.PPE,
          lastFeedback: null,
          completedStages: {},
          blockedStages: {},
          stageScores: {},
        }),
    }),
    {
      name: 'fundivr-simulator-storage',
    },
  ),
);
