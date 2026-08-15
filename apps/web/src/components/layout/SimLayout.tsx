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
  Headset,
  Wifi,
  BatteryFull,
} from 'lucide-react';

const STEPS = [
  { id: TRAINING_STAGES.PPE, name: 'Vestiário', icon: Shield },
  { id: TRAINING_STAGES.CHARGE, name: 'Pátio', icon: Truck },
  { id: TRAINING_STAGES.THERMAL, name: 'Forno', icon: Flame },
  { id: TRAINING_STAGES.SKIMMING, name: 'Escumação', icon: Droplets },
  { id: TRAINING_STAGES.EMERGENCY, name: 'Emergência', icon: AlertTriangle },
];

function ScoreGauge({ score }: { score: number }) {
  // Converte score 0-100 para ângulos de SVG
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * (circumference / 2); // Metade para semi-círculo

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          {/* Fundo do Gauge */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Valor do Gauge segmentado (dasharray imitando segmentos) */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={`${circumference / 20} ${circumference / 40}`}
            style={{ strokeDashoffset, strokeDasharray: circumference }}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-2xl font-mono font-bold text-emerald-400">{score}</span>
        </div>
      </div>
      <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest mt-1">
        Pontuação Parcial
      </div>
    </div>
  );
}

export function SimLayout({ children }: { children: React.ReactNode }) {
  const { student, currentStage, completedStages, blockedStages, lastFeedback, stageScores } =
    useSimulatorStore();

  const scores = Object.values(stageScores);
  const partialScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Background Camada Base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#2a1610_0%,_#0a0e14_100%)] z-0" />

      {/* Background Vídeo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen"
        src="/assets/foundry-bg.mp4"
      />
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Grid Overlay para profundidade */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.2) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          transform: 'perspective(500px) rotateX(60deg) scale(2)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Overlays de Imersão VR (Ficam por cima do BG mas atrás ou misturados com a UI) */}
      <div className="absolute inset-0 z-50 vignette-hmd" />
      <div className="absolute inset-0 z-50 scanlines" />
      <div className="absolute inset-0 z-50 reticle" />

      {/* Camada UI com Perspectiva 3D */}
      <div className="absolute inset-0 z-10 perspective-container">
        {/* HUD Superior Esquerdo (Passivo 3D) */}
        <div className="absolute top-10 left-10 panel-3d-left flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-sm font-mono text-[10px] text-emerald-400 uppercase tracking-widest">
            <Headset className="w-4 h-4" />
            <span>HMD Conectado</span>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <BatteryFull className="w-3 h-3" /> 100%
            </span>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Local
            </span>
            <span className="opacity-50">·</span>
            <span>IPD 63mm</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-sm border-l-2 border-l-amber-500 min-w-[250px]">
            <h1 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
              Operador Ativo
            </h1>
            <div className="text-lg font-bold text-slate-200">
              {student?.name || 'Desconhecido'}
            </div>
            <div className="font-mono text-xs text-amber-500/80 mt-1">
              MAT: {student?.registration}
            </div>
          </div>
        </div>

        {/* HUD Superior Direito (Passivo 3D) */}
        <div className="absolute top-10 right-10 panel-3d-right flex flex-col items-end gap-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-sm font-mono text-[10px] text-amber-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            REC
            <span className="opacity-50 ml-2">Sessão {session?.id.split('-')[0]}</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-sm border-r-2 border-r-emerald-500">
            <ScoreGauge score={partialScore} />
          </div>
        </div>

        {/* Conteúdo Central Frontal (Sem rotateY para não atrapalhar interação) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-4xl relative z-20">{children}</div>
        </div>

        {/* HUD Inferior - Mapa Stepper e Compass */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          {/* Compass Opcional */}
          <div className="font-mono text-[10px] text-slate-500 tracking-[0.5em] mb-2 opacity-50">
            NW · N · NE
          </div>

          {/* Stepper Horizontal */}
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-slate-700/50 p-3 rounded-sm">
            {STEPS.map((step, index) => {
              const isActive = currentStage === step.id;
              const isCompleted = completedStages[step.id];
              const isBlocked = blockedStages[step.id];

              const Icon = step.icon;

              let iconColor = 'text-slate-600';
              let lineClass = 'bg-slate-800';

              if (isCompleted) {
                iconColor = 'text-emerald-500';
                lineClass = 'bg-emerald-500/50';
              }
              if (isActive) {
                iconColor = 'text-amber-500 animate-pulse';
                lineClass = 'bg-slate-800'; // linha à frente
              }
              if (isBlocked) {
                iconColor = 'text-rose-500 opacity-50';
              }

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex flex-col items-center gap-2 ${isBlocked ? 'opacity-50' : ''}`}
                  >
                    <div
                      className={`p-2 border rounded-full ${isActive ? 'border-amber-500 bg-amber-500/10' : 'border-transparent'}`}
                    >
                      {isBlocked ? (
                        <Lock className={`w-4 h-4 ${iconColor}`} />
                      ) : isCompleted ? (
                        <CheckCircle className={`w-4 h-4 ${iconColor}`} />
                      ) : (
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      )}
                    </div>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-mono ${isActive ? 'text-amber-500' : 'text-slate-500'}`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && <div className={`w-8 h-px ${lineClass} -mt-4`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Feedback Panel (Overlay Central flutuante) */}
        {lastFeedback && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50 transform -translate-y-full mb-8">
            <div
              className={`max-w-xl mx-auto p-4 border flex items-start gap-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl pointer-events-auto
              ${
                lastFeedback.status === 'approved'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : lastFeedback.status === 'approved_with_warning'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                    : 'bg-rose-950/80 border-rose-500/80 text-rose-200'
              }
            `}
            >
              <div className="mt-0.5">
                {lastFeedback.status === 'reproved' ? (
                  <AlertOctagon className="w-6 h-6 text-rose-500" />
                ) : lastFeedback.status === 'approved_with_warning' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 font-mono text-sm leading-relaxed">{lastFeedback.message}</div>
            </div>
          </div>
        )}

        {/* Placeholders: Mãos Enluvadas (Aparecem nas laterais inferiores) */}
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-20 bg-gradient-to-tr from-slate-800 to-transparent rounded-tr-full blur-2xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none opacity-20 bg-gradient-to-tl from-slate-800 to-transparent rounded-tl-full blur-2xl translate-y-1/4 translate-x-1/4" />
      </div>
    </div>
  );
}
