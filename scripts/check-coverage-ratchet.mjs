#!/usr/bin/env node
/**
 * Etapa 32 do plano de 50 etapas — ratchet de cobertura.
 *
 * Compara coverage/coverage-summary.json (gerado por `vitest run --coverage`)
 * contra coverage-baseline.json. Falha se qualquer métrica caiu mais que a
 * margem de ruído de medição (0.05pp). Nunca sobe o baseline sozinho — quem
 * melhorou a cobertura roda `npm run coverage:baseline:update` e commita o
 * novo número na mesma PR, tornando o ganho visível no diff.
 *
 * Rodar localmente após `npm run test:coverage`:
 *   node scripts/check-coverage-ratchet.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const EPSILON = 0.05; // pp de tolerância a ruído de arredondamento do v8

const summaryPath = join(process.cwd(), 'coverage', 'coverage-summary.json');
const baselinePath = join(process.cwd(), 'coverage-baseline.json');

if (!existsSync(summaryPath)) {
  console.error('❌ coverage/coverage-summary.json não encontrado. Rode `npm run test:coverage` primeiro.');
  process.exit(1);
}
if (!existsSync(baselinePath)) {
  console.error('❌ coverage-baseline.json não encontrado na raiz do projeto.');
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf-8')).total;
const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));

const metrics = ['lines', 'branches', 'functions', 'statements'];
const regressions = [];
const gains = [];

console.log('\n📈 Coverage Ratchet (etapa 32)\n');
console.log('  métrica       atual     baseline   delta');
console.log('  ' + '-'.repeat(46));

for (const m of metrics) {
  const current = summary[m].pct;
  const base = baseline[m];
  const delta = current - base;
  const sign = delta >= 0 ? '+' : '';
  console.log(
    `  ${m.padEnd(12)} ${current.toFixed(2).padStart(6)}%   ${base.toFixed(2).padStart(6)}%   ${sign}${delta.toFixed(2)}pp`
  );
  if (delta < -EPSILON) regressions.push({ metric: m, current, base, delta });
  if (delta > EPSILON) gains.push({ metric: m, current, base, delta });
}

if (regressions.length > 0) {
  console.error(`\n❌ ${regressions.length} métrica(s) regrediram além da margem de ${EPSILON}pp:`);
  for (const r of regressions) {
    console.error(`   • ${r.metric}: ${r.base.toFixed(2)}% → ${r.current.toFixed(2)}% (${r.delta.toFixed(2)}pp)`);
  }
  console.error('\nA cobertura só sobe neste projeto (etapa 32). Adicione testes para os arquivos que você tocou.');
  process.exit(1);
}

if (gains.length > 0) {
  console.log(`\n✅ Sem regressão. ${gains.length} métrica(s) melhoraram — rode:`);
  console.log('   npm run coverage:baseline:update');
  console.log('   e inclua o novo coverage-baseline.json nesta PR para travar o ganho.');
} else {
  console.log('\n✅ Sem regressão de cobertura.');
}
