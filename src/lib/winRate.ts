/**
 * Fonte única da fórmula de win rate do produto.
 *
 * Semântica decidida: `wins / (wins + losses)` — só deals com desfecho
 * entram no denominador. Deals abertos/em andamento NÃO contam como perda.
 * Antes desta lib, ~12 hooks reimplementavam a fórmula à mão com duas
 * grafias equivalentes (`wins/total` onde total = wins+losses) e um caso
 * divergente que incluía vendas abertas no denominador.
 *
 * Retorna percentual 0–100 (float); o arredondamento é decisão do consumidor.
 * Entradas inválidas (NaN, Infinity, negativas) são normalizadas para 0 —
 * contagens de deals nunca são negativas.
 */
export const winRate = (wins: number, losses: number): number => {
  const w = Number.isFinite(wins) && wins > 0 ? wins : 0;
  const l = Number.isFinite(losses) && losses > 0 ? losses : 0;
  const decided = w + l;
  return decided > 0 ? (w / decided) * 100 : 0;
};
