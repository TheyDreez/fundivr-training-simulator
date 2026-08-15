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
