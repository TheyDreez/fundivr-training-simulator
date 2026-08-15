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
