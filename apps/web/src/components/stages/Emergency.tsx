import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { AlertTriangle, ArrowRight, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Emergency() {
  const { session, setFeedback, markStageCompleted, lastFeedback, setCurrentStage, setStageScore } =
    useSimulatorStore();
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
