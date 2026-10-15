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
 */
export const winRate = (wins: number, losses: number): number => {
  const decided = wins + losses;
  return decided > 0 ? (wins / decided) * 100 : 0;
};
