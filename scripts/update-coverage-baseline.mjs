#!/usr/bin/env node
/**
 * Etapa 32 do plano de 50 etapas.
 * Reescreve coverage-baseline.json com os números atuais de
 * coverage/coverage-summary.json. Só use depois de confirmar que a cobertura
 * subiu de propósito (novo teste, não uma mudança de escopo do include/exclude
 * do vitest.config.ts que reduziria o denominador).
 *
 * Também regenera coverage-ladder-baseline.json: pisos por módulo crítico
 * (escada) medidos a partir do mesmo summary — o piso fica ~0.1pp abaixo do
 * valor medido para não reprovar por ruído de arredondamento.
 *
 * Rodar: npm run test:coverage && npm run coverage:baseline:update
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const summaryPath = join(process.cwd(), 'coverage', 'coverage-summary.json');
const baselinePath = join(process.cwd(), 'coverage-baseline.json');
const ladderPath = join(process.cwd(), 'coverage-ladder-baseline.json');

// Módulos críticos com piso próprio. Não existe src/lib/financeiro — a lógica
// financeira vive em markupHelpers, bi/, revenueForecast/ e services/.
const LADDER_MODULES = [
  'src/lib/validators/',
  'src/lib/schemas/',
  'src/lib/markupHelpers',
  'src/lib/gamification.ts',
  'src/lib/race/',
  'src/lib/orderTracking/',
  'src/lib/bi/',
  'src/lib/revenueForecast/',
  'src/services/',
  'src/hooks/reports/',
];

const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
const previous = JSON.parse(readFileSync(baselinePath, 'utf-8'));

const next = {
  _comment: previous._comment,
  lines: Number(summary.total.lines.pct.toFixed(2)),
  branches: Number(summary.total.branches.pct.toFixed(2)),
  functions: Number(summary.total.functions.pct.toFixed(2)),
  statements: Number(summary.total.statements.pct.toFixed(2)),
};

writeFileSync(baselinePath, JSON.stringify(next, null, 2) + '\n');

console.log('coverage-baseline.json atualizado:');
for (const m of ['lines', 'branches', 'functions', 'statements']) {
  const delta = next[m] - previous[m];
  console.log(`  ${m}: ${previous[m]}% → ${next[m]}% (${delta >= 0 ? '+' : ''}${delta.toFixed(2)}pp)`);
}

// --- escada por módulo ------------------------------------------------------
function aggregate(prefix) {
  const acc = { t: 0, c: 0, files: 0 };
  for (const [file, data] of Object.entries(summary)) {
    if (file === 'total') continue;
    const rel = relative(process.cwd(), file).replaceAll('\\', '/');
    if (!rel.startsWith(prefix)) continue;
    acc.files++;
    acc.t += data.lines.total;
    acc.c += data.lines.covered;
  }
  return acc;
}

let previousLadder = { modules: {} };
try {
  previousLadder = JSON.parse(readFileSync(ladderPath, 'utf-8'));
} catch {
  /* primeira geração */
}

const modules = {};
console.log('\ncoverage-ladder-baseline.json atualizado:');
for (const prefix of LADDER_MODULES) {
  const agg = aggregate(prefix);
  if (agg.files === 0) {
    console.log(`  ${prefix}: nenhum arquivo no coverage — prefixo removido do baseline`);
    continue;
  }
  const measured = agg.t === 0 ? 100 : (100 * agg.c) / agg.t;
  // piso = medido truncado em 0.1pp (headroom de arredondamento; EPSILON cobre o resto)
  const floor = Math.floor(measured * 10) / 10;
  const prevFloor = previousLadder.modules?.[prefix]?.lines;
  const delta = prevFloor === undefined ? 'novo' : `${(floor - prevFloor).toFixed(1)}pp`;
  modules[prefix] = { lines: floor };
  console.log(`  ${prefix}: medido ${measured.toFixed(2)}% → piso ${floor.toFixed(1)}% (${delta})`);
}

const ladder = {
  _comment:
    'Escada de cobertura por módulo crítico. Cada piso foi medido na cobertura real (truncado em 0.1pp) e só pode subir — `npm run coverage:ladder` reprova queda. Plano de subida gradual: docs/estado/15_PLANO_COBERTURA_MODULOS.md. Regenere com `npm run coverage:baseline:update`.',
  modules,
};
writeFileSync(ladderPath, JSON.stringify(ladder, null, 2) + '\n');
