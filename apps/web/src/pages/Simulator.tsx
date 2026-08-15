import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { SimLayout } from '../components/layout/SimLayout';
import { TRAINING_STAGES } from '@fundivr/shared-types';

import { PpeCheck } from '../components/stages/PpeCheck';
import { ChargeInspection } from '../components/stages/ChargeInspection';
import { ThermalControl } from '../components/stages/ThermalControl';
import { Skimming } from '../components/stages/Skimming';
import { Emergency } from '../components/stages/Emergency';

export function Simulator() {
  const { session, currentStage } = useSimulatorStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <SimLayout>
      {currentStage === TRAINING_STAGES.PPE && <PpeCheck />}
      {currentStage === TRAINING_STAGES.CHARGE && <ChargeInspection />}
      {currentStage === TRAINING_STAGES.THERMAL && <ThermalControl />}
      {currentStage === TRAINING_STAGES.SKIMMING && <Skimming />}
      {currentStage === TRAINING_STAGES.EMERGENCY && <Emergency />}
    </SimLayout>
  );
}
