import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  computeDealProbability,
  STAGE_PROBABILITIES,
  type DealProbabilityInput,
  type StageHistoryEntry,
} from './deal-probability-calc.ts';

const NOW = new Date('2026-10-01T12:00:00Z').getTime();
const DAY_MS = 1000 * 60 * 60 * 24;

function deal(over: Partial<DealProbabilityInput> = {}): DealProbabilityInput {
  return { id: 'd-1', status: 'proposal', amount: 8000, category: 'one-time', ...over };
}

function entry(daysAgoStart: number, daysAgoEnd: number | null): StageHistoryEntry {
  return {
    entered_at: new Date(NOW - daysAgoStart * DAY_MS).toISOString(),
    exited_at:
      daysAgoEnd === null ? null : new Date(NOW - daysAgoEnd * DAY_MS).toISOString(),
  };
}

Deno.test(
  'probabilidade base vem do estágio e cai para 10 em estágio desconhecido',
  () => {
    // amount=8000 (entre 5000 e 10000) e category one-time não ajustam — resultado = base clampada.
    for (const [status, base] of Object.entries(STAGE_PROBABILITIES)) {
      const { probability } = computeDealProbability(deal({ status }), [], NOW);
      assert(probability >= 5 && probability <= 95);
      assertEquals(probability, Math.max(5, Math.min(95, base)));
    }
    const { probability } = computeDealProbability(
      deal({ status: 'etapa_inexistente' }),
      [],
      NOW
    );
    assertEquals(probability, 10);
  }
);

Deno.test('estagnação no estágio atual desconta; deal recente bonifica', () => {
  const stagnant = computeDealProbability(deal(), [entry(20, null)], NOW);
  assertEquals(stagnant.probability, 50 - 15); // base proposal=50, sem ajuste de ticket
  assert(stagnant.factors.includes('Estagnado há mais de 14 dias'));

  const weekOld = computeDealProbability(deal(), [entry(10, null)], NOW);
  assertEquals(weekOld.probability, 50 - 5);
  assert(weekOld.factors.includes('7+ dias na etapa atual'));

  const fresh = computeDealProbability(deal(), [entry(2, null)], NOW);
  assertEquals(fresh.probability, 50 + 5);
  assert(fresh.factors.includes('Deal recente/ativo'));
});

Deno.test('ticket e categoria ajustam a probabilidade', () => {
  const big = computeDealProbability(deal({ amount: 60000 }), [], NOW);
  assert(big.factors.includes('Deal de alto valor'));

  const mid = computeDealProbability(deal({ amount: 20000 }), [], NOW);
  assert(mid.factors.includes('Valor médio-alto'));

  const recurring = computeDealProbability(
    deal({ amount: 1000, category: 'subscription' }),
    [],
    NOW
  );
  assert(recurring.factors.includes('Modelo recorrente'));
  assert(recurring.factors.includes('Ticket acessível'));
});

Deno.test(
  'velocidade média de progressão bonifica ciclo rápido e penaliza ciclo longo',
  () => {
    // 3 entradas encerradas em ~2 dias cada → média 2d < 5 → +10
    const fast = computeDealProbability(
      deal(),
      [entry(6, 4), entry(4, 2), entry(2, null)],
      NOW
    );
    assert(fast.factors.includes('Progressão rápida'));

    // média ~15d > 10 → -5
    const slow = computeDealProbability(
      deal(),
      [entry(45, 30), entry(30, 15), entry(15, 5)],
      NOW
    );
    assert(slow.factors.includes('Ciclo longo'));

    // 2 entradas não acionam o fator (regra exige > 2 registros)
    const thin = computeDealProbability(deal(), [entry(40, 20), entry(20, null)], NOW);
    assert(!thin.factors.includes('Ciclo longo'));
    assert(!thin.factors.includes('Progressão rápida'));
  }
);

Deno.test('probabilidade é sempre clampada entre 5 e 95 e fatores nunca vazios', () => {
  const dead = computeDealProbability(
    deal({ status: 'cancelled', amount: 60000 }),
    [entry(30, null)],
    NOW
  );
  assertEquals(dead.probability, 5);

  const hot = computeDealProbability(
    deal({ status: 'completed', amount: 1000, category: 'subscription' }),
    [entry(1, null)],
    NOW
  );
  assertEquals(hot.probability, 95);

  const plain = computeDealProbability(deal({ amount: 10000, category: null }), [], NOW);
  assertEquals(plain.factors, ['Análise padrão']);
});
