/**
 * Cálculo puro de probabilidade de fechamento por estágio — fonte única usada
 * pela edge function `deal-probability`. Extraído para `supabase/functions/_shared/`
 * para ficar testável via `deno test` sem Supabase/rede.
 *
 * Heurística (somente sinais já persistidos):
 *   base por estágio → ajustes por tempo parado, ticket, categoria e velocidade
 *   média de progressão → clamp em [5, 95].
 */

/** Probabilidade base por estágio do funil. */
export const STAGE_PROBABILITIES: Record<string, number> = {
  pending: 10, // Lead
  in_progress: 25, // Qualificado
  proposal: 50, // Proposta
  negotiation: 75, // Negociação
  completed: 100, // Fechado
};

export interface DealProbabilityInput {
  id: string;
  status: string;
  amount: number;
  category: string | null;
}

export interface StageHistoryEntry {
  entered_at: string;
  exited_at: string | null;
}

export interface DealProbabilityResult {
  probability: number;
  factors: string[];
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeDealProbability(
  deal: DealProbabilityInput,
  stageHistory: readonly StageHistoryEntry[],
  nowMs: number = Date.now(),
): DealProbabilityResult {
  const factors: string[] = [];
  let probability = STAGE_PROBABILITIES[deal.status] || 10;

  // Fator 1: tempo no estágio atual (deals parados têm probabilidade menor)
  const currentStageEntry = stageHistory.find((h) => !h.exited_at);
  if (currentStageEntry) {
    const daysInStage = Math.floor(
      (nowMs - new Date(currentStageEntry.entered_at).getTime()) / MS_PER_DAY,
    );
    if (daysInStage > 14) {
      probability -= 15;
      factors.push('Estagnado há mais de 14 dias');
    } else if (daysInStage > 7) {
      probability -= 5;
      factors.push('7+ dias na etapa atual');
    } else if (daysInStage <= 3) {
      probability += 5;
      factors.push('Deal recente/ativo');
    }
  }

  // Fator 2: ticket (deals muito altos pedem mais maturação)
  if (deal.amount > 50000) {
    probability -= 5;
    factors.push('Deal de alto valor');
  } else if (deal.amount > 10000) {
    factors.push('Valor médio-alto');
  } else if (deal.amount < 5000) {
    probability += 5;
    factors.push('Ticket acessível');
  }

  // Fator 3: categoria
  if (deal.category === 'subscription') {
    probability += 5;
    factors.push('Modelo recorrente');
  } else if (deal.category === 'one-time') {
    factors.push('Venda única');
  }

  // Fator 4: velocidade média de progressão entre estágios
  if (stageHistory.length > 2) {
    const avgDaysPerStage =
      stageHistory.reduce((acc, h) => {
        if (h.exited_at) {
          const days =
            (new Date(h.exited_at).getTime() - new Date(h.entered_at).getTime()) /
            MS_PER_DAY;
          return acc + days;
        }
        return acc;
      }, 0) / (stageHistory.length - 1);

    if (avgDaysPerStage < 5) {
      probability += 10;
      factors.push('Progressão rápida');
    } else if (avgDaysPerStage > 10) {
      probability -= 5;
      factors.push('Ciclo longo');
    }
  }

  // Clamp entre 5 e 95 — nunca promete certeza nem morte
  probability = Math.max(5, Math.min(95, probability));

  return {
    probability: Math.round(probability),
    factors: factors.length > 0 ? factors : ['Análise padrão'],
  };
}
