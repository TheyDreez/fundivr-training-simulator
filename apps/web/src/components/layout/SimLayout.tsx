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
