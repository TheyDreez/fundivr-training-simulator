import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { SimLayout } from '../components/layout/SimLayout';
import { TRAINING_STAGES } from '@fundivr/shared-types';
import { AlertOctagon, RotateCcw } from 'lucide-react';

import { PpeCheck } from '../components/stages/PpeCheck';
import { ChargeInspection } from '../components/stages/ChargeInspection';
import { ThermalControl } from '../components/stages/ThermalControl';
import { Skimming } from '../components/stages/Skimming';
import { Emergency } from '../components/stages/Emergency';

export function Simulator() {
  const { session, currentStage, blockedStages, unblockStage, setCurrentStage } =
    useSimulatorStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  const renderStage = () => {
    if (currentStage === TRAINING_STAGES.THERMAL && blockedStages[TRAINING_STAGES.THERMAL]) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 bg-rose-950/20 border border-rose-500/30 rounded-xl p-8 text-center mt-12">
          <AlertOctagon className="w-16 h-16 text-rose-500 mb-6" />
          <h2 className="text-2xl font-bold text-rose-400 mb-4 uppercase tracking-wider">
            Acesso Negado
          </h2>
          <p className="text-slate-300 max-w-md mb-8">
            Acesso ao forno bloqueado: EPI incompleto. Retorne e refaça a verificação de segurança
            antes de prosseguir com a operação.
          </p>
          <button
            onClick={() => {
              unblockStage(TRAINING_STAGES.THERMAL);
              setCurrentStage(TRAINING_STAGES.PPE);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-3 border border-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
            Retornar ao Vestiário
          </button>
        </div>
      );
    }

    switch (currentStage) {
      case TRAINING_STAGES.PPE:
        return <PpeCheck />;
      case TRAINING_STAGES.CHARGE:
        return <ChargeInspection />;
      case TRAINING_STAGES.THERMAL:
        return <ThermalControl />;
      case TRAINING_STAGES.SKIMMING:
        return <Skimming />;
      case TRAINING_STAGES.EMERGENCY:
        return <Emergency />;
      default:
        return null;
    }
  };

  return <SimLayout>{renderStage()}</SimLayout>;
}
