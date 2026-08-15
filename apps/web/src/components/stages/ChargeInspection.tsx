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
