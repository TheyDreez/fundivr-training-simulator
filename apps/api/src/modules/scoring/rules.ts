/**
 * SISTEMA DE SCORING - FUNDIVR
 *
 * A nota final da sessão é composta por uma média ponderada das etapas do processo de fusão.
 * Cada etapa avaliada retorna um score de 0 a 100.
 *
 * Pesos definidos para a agregação (Soma = 1):
 * - Controle Térmico (THERMAL_CONTROL_WEIGHT): 0.40 (40%)
 *   A temperatura é o fator mais crítico de segurança e qualidade do metal.
 *
 * - Carga Úmida (WET_CHARGE_WEIGHT): 0.30 (30%)
 *   Falha ao identificar carga úmida pode causar explosões.
 *
 * - Escumação / Skimming (SKIMMING_WEIGHT): 0.30 (30%)
 *   Garante a pureza do banho metálico.
 *
 * Fórmula:
 * Final Score = (ThermalScore * 0.4) + (WetChargeScore * 0.3) + (SkimmingScore * 0.3)
 */

export const SCORING_WEIGHTS = {
  THERMAL_CONTROL: 0.4,
  WET_CHARGE: 0.3,
  SKIMMING: 0.3,
};

export const TEMPERATURE_THRESHOLDS = {
  IDEAL_MIN: 715, // 730 - 15
  IDEAL_MAX: 745, // 730 + 15
  CRITICAL_PEAK: 800,
};

export const SKIMMING_THRESHOLDS = {
  MIN_IMMERSION_TIME_S: 8,
  IDEAL_COVERAGE_PERCENT: 90,
};

export interface ScoringResult {
  score: number;
  status: 'approved' | 'approved_with_warning' | 'reproved';
  feedback: string;
  isCritical?: boolean;
}

export function evaluateThermalControl(payload: any): ScoringResult {
  const temperature = Number(payload?.temperature);

  if (isNaN(temperature)) {
    return {
      score: 0,
      status: 'reproved',
      feedback: 'Dados de temperatura ausentes ou inválidos.',
    };
  }

  if (temperature > TEMPERATURE_THRESHOLDS.CRITICAL_PEAK) {
    return {
      score: 10,
      status: 'reproved',
      feedback: `Pico crítico de ${temperature}°C atingido. Risco de dano ao refratário e oxidação do banho.`,
      isCritical: true,
    };
  }

  // Penalização proporcional baseada na distância do alvo (730)
  const target = 730;
  const diff = Math.abs(temperature - target);

  if (diff <= 15) {
    return {
      score: 100,
      status: 'approved',
      feedback: `Excelente controle térmico. Temperatura mantida em ${temperature}°C, dentro da faixa ideal.`,
    };
  }

  if (diff <= 30) {
    const score = Math.round(85 - (diff - 15) * (25 / 15));
    return {
      score,
      status: 'approved_with_warning',
      feedback: `Temperatura de ${temperature}°C fora da faixa ideal (715-745). Ajuste a potência.`,
    };
  }

  return {
    score: Math.max(0, 100 - diff * 2),
    status: 'reproved',
    feedback: `Temperatura de ${temperature}°C está muito fora da faixa de operação. Risco à qualidade da liga.`,
  };
}

export function evaluateWetCharge(payload: any): ScoringResult {
  const isWet = Boolean(payload?.isWet);
  const userAccepted = Boolean(payload?.userAccepted);

  if (isWet && userAccepted) {
    return {
      score: 0,
      status: 'reproved',
      feedback: 'FALHA GRAVE: Carga úmida inserida no forno. Risco altíssimo de explosão de vapor!',
      isCritical: true,
    };
  }

  if (isWet && !userAccepted) {
    return {
      score: 100,
      status: 'approved',
      feedback: 'Excelente. Você identificou e rejeitou a sucata úmida corretamente.',
    };
  }

  if (!isWet && !userAccepted) {
    return {
      score: 40,
      status: 'approved_with_warning',
      feedback:
        'Você rejeitou uma carga seca e limpa. Isso atrasa o processo produtivo desnecessariamente.',
    };
  }

  return {
    score: 100,
    status: 'approved',
    feedback: 'Carga seca inserida com sucesso.',
  };
}

export function evaluateSkimming(payload: any): ScoringResult {
  const immersionTime = Number(payload?.immersionTime) || 0;
  const coveragePercent = Number(payload?.coveragePercent) || 0;

  if (immersionTime < SKIMMING_THRESHOLDS.MIN_IMMERSION_TIME_S) {
    return {
      score: 30,
      status: 'reproved',
      feedback: `Tempo de imersão do termopar insuficiente (${immersionTime}s). O mínimo é ${SKIMMING_THRESHOLDS.MIN_IMMERSION_TIME_S}s para leitura confiável.`,
    };
  }

  if (coveragePercent < 50) {
    return {
      score: 40,
      status: 'reproved',
      feedback: `Escumação muito fraca (Cobertura: ${coveragePercent}%). O banho permanece contaminado com escória.`,
    };
  }

  if (coveragePercent >= SKIMMING_THRESHOLDS.IDEAL_COVERAGE_PERCENT) {
    return {
      score: 100,
      status: 'approved',
      feedback: `Escumação excelente! Área limpa (${coveragePercent}%) e tempo de imersão adequado (${immersionTime}s).`,
    };
  }

  // Proporcional entre 50 e 90
  const score = Math.round(50 + (coveragePercent - 50) * 1.25);

  return {
    score,
    status: 'approved_with_warning',
    feedback: `Escumação razoável (${coveragePercent}%), mas pode melhorar para atingir o ideal de >90%.`,
  };
}

export function evaluatePpeCheck(payload: any): ScoringResult {
  const isComplete = Boolean(payload?.isComplete);

  if (!isComplete) {
    return {
      score: 0,
      status: 'reproved',
      feedback: 'FALHA GRAVE: EPI incompleto. O acesso ao forno está bloqueado por segurança.',
      isCritical: true,
    };
  }

  return {
    score: 100,
    status: 'approved',
    feedback: 'Todos os EPIs verificados. Acesso liberado.',
  };
}

export function evaluateEmergency(payload: any): ScoringResult {
  const reactionTime = Number(payload?.reactionTime) || 0;

  if (reactionTime > 5) {
    return {
      score: 50,
      status: 'approved_with_warning',
      feedback: 'Reação lenta. A parada de emergência deve ser acionada imediatamente.',
    };
  }

  return {
    score: 100,
    status: 'approved',
    feedback: 'Parada de emergência acionada corretamente.',
  };
}

export function aggregateSessionScore(events: any[]): number {
  if (!events || events.length === 0) return 0;

  // Extrair o último score de cada etapa (caso o usuário tente várias vezes, pegamos o resultado final ou a média, aqui vamos pegar a média dos eventos daquela etapa ou o último. Pela regra simples, podemos pegar todos avaliados e fazer a média ponderada)

  const thermalScores: number[] = [];
  const wetChargeScores: number[] = [];
  const skimmingScores: number[] = [];

  for (const event of events) {
    if (event.type === 'thermal_control_completed') {
      const res = evaluateThermalControl(event.payload);
      thermalScores.push(res.score);
    }
    if (event.type === 'wet_charge_detected' || event.type === 'charge_inspected') {
      const res = evaluateWetCharge(event.payload);
      wetChargeScores.push(res.score);
    }
    if (event.type === 'skimming_completed') {
      const res = evaluateSkimming(event.payload);
      skimmingScores.push(res.score);
    }
  }

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const finalThermal = avg(thermalScores);
  const finalWet = avg(wetChargeScores);
  const finalSkim = avg(skimmingScores);

  // Se a sessão ainda não teve eventos para aquela etapa, aquele peso é desconsiderado ou zera?
  // O mais justo é calcular o peso com base no que foi feito.
  // Mas para o score agregado final assumimos a fórmula da documentação:
  let totalScore = 0;
  let totalWeight = 0;

  if (thermalScores.length > 0) {
    totalScore += finalThermal * SCORING_WEIGHTS.THERMAL_CONTROL;
    totalWeight += SCORING_WEIGHTS.THERMAL_CONTROL;
  }
  if (wetChargeScores.length > 0) {
    totalScore += finalWet * SCORING_WEIGHTS.WET_CHARGE;
    totalWeight += SCORING_WEIGHTS.WET_CHARGE;
  }
  if (skimmingScores.length > 0) {
    totalScore += finalSkim * SCORING_WEIGHTS.SKIMMING;
    totalWeight += SCORING_WEIGHTS.SKIMMING;
  }

  if (totalWeight === 0) return 0;

  // Normaliza o score para caso nem todas as etapas tenham sido feitas
  return Math.round(totalScore / totalWeight);
}
