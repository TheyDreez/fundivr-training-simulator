import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postEvent } from '../../services/api';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { TRAINING_STAGES, EVENT_TYPES } from '@fundivr/shared-types';
import { Flame, ArrowRight, Thermometer } from 'lucide-react';

export function ThermalControl() {
  const { session, setFeedback, setCurrentStage, markStageCompleted, lastFeedback, setStageScore } =
    useSimulatorStore();

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
