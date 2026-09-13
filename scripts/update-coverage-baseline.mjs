#!/usr/bin/env node
/**
 * Etapa 32 do plano de 50 etapas.
 * Reescreve coverage-baseline.json com os números atuais de
 * coverage/coverage-summary.json. Só use depois de confirmar que a cobertura
 * subiu de propósito (novo teste, não uma mudança de escopo do include/exclude
 * do vitest.config.ts que reduziria o denominador).
 *
 * Rodar: npm run test:coverage && npm run coverage:baseline:update
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const summaryPath = join(process.cwd(), 'coverage', 'coverage-summary.json');
const baselinePath = join(process.cwd(), 'coverage-baseline.json');

const summary = JSON.parse(readFileSync(summaryPath, 'utf-8')).total;
const previous = JSON.parse(readFileSync(baselinePath, 'utf-8'));

const next = {
  _comment: previous._comment,
  lines: Number(summary.lines.pct.toFixed(2)),
  branches: Number(summary.branches.pct.toFixed(2)),
  functions: Number(summary.functions.pct.toFixed(2)),
  statements: Number(summary.statements.pct.toFixed(2)),
};

writeFileSync(baselinePath, JSON.stringify(next, null, 2) + '\n');

console.log('coverage-baseline.json atualizado:');
for (const m of ['lines', 'branches', 'functions', 'statements']) {
  const delta = next[m] - previous[m];
  console.log(`  ${m}: ${previous[m]}% → ${next[m]}% (${delta >= 0 ? '+' : ''}${delta.toFixed(2)}pp)`);
}
