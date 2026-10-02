#!/usr/bin/env node
/**
 * Ratchet de cobertura em escada — por módulo crítico.
 *
 * O ratchet global (check-coverage-ratchet.mjs) protege a média do projeto,
 * mas uma queda num módulo crítico pode ser diluída por ganho em outro. Este
 * check agrega coverage/coverage-summary.json por prefixo de módulo e falha
 * se algum módulo cair abaixo do seu piso em coverage-ladder-baseline.json.
 *
 * Os pisos foram medidos na cobertura real do módulo (arredondados para baixo)
 * e sobem de forma gradual — veja docs/estado/15_PLANO_COBERTURA_MODULOS.md.
 * Quando um módulo melhora, rode `npm run coverage:baseline:update` e commite
 * o coverage-ladder-baseline.json atualizado na mesma PR.
 *
 * Rodar: npm run test:coverage && npm run coverage:ladder
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const EPSILON = 0.05; // pp de tolerância a ruído de medição (mesmo do ratchet global)

const summaryPath = join(process.cwd(), 'coverage', 'coverage-summary.json');
const baselinePath = join(process.cwd(), 'coverage-ladder-baseline.json');

if (!existsSync(summaryPath)) {
  console.error('❌ coverage/coverage-summary.json não encontrado. Rode `npm run test:coverage` primeiro.');
  process.exit(1);
}
if (!existsSync(baselinePath)) {
  console.error('❌ coverage-ladder-baseline.json não encontrado na raiz do projeto.');
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
const modules = baseline.modules ?? {};

/** Agrega os totais de cobertura dos arquivos que batem num prefixo. */
function aggregate(prefix) {
  const acc = { lines: { t: 0, c: 0 }, branches: { t: 0, c: 0 }, functions: { t: 0, c: 0 }, statements: { t: 0, c: 0 }, files: 0 };
  for (const [file, data] of Object.entries(summary)) {
    if (file === 'total') continue;
    const rel = relative(process.cwd(), file).replaceAll('\\', '/');
    if (!rel.startsWith(prefix)) continue;
    acc.files++;
    for (const m of ['lines', 'branches', 'functions', 'statements']) {
      acc[m].t += data[m].total;
      acc[m].c += data[m].covered;
    }
  }
  return acc;
}

const regressions = [];
const warnings = [];

console.log('\n🪜 Coverage Ladder — pisos por módulo crítico\n');
console.log('  módulo                              arquivos   linhas atual   piso    delta');
console.log('  ' + '-'.repeat(82));

for (const [prefix, floors] of Object.entries(modules)) {
  const agg = aggregate(prefix);
  if (agg.files === 0) {
    warnings.push(`${prefix}: nenhum arquivo no coverage (prefixo renomeado/removido?)`);
    continue;
  }
  const pct = agg.lines.t === 0 ? 100 : (100 * agg.lines.c) / agg.lines.t;
  const floor = floors.lines ?? 0;
  const delta = pct - floor;
  console.log(
    `  ${prefix.padEnd(36)} ${String(agg.files).padStart(5)}   ${pct.toFixed(2).padStart(9)}%   ${floor.toFixed(2).padStart(5)}%   ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}pp`,
  );
  if (delta < -EPSILON) {
    regressions.push({ prefix, pct, floor, delta });
  }
}

for (const w of warnings) console.warn(`\n⚠️  ${w}`);

if (regressions.length > 0) {
  console.error(`\n❌ ${regressions.length} módulo(s) abaixo do piso (margem ${EPSILON}pp):`);
  for (const r of regressions) {
    console.error(`   • ${r.prefix}: ${r.floor.toFixed(2)}% → ${r.pct.toFixed(2)}% (${r.delta.toFixed(2)}pp)`);
  }
  console.error('\nAdicione testes ao módulo ou, se a queda foi intencional e revisada, atualize o piso com `npm run coverage:baseline:update`.');
  process.exit(1);
}

console.log('\n✅ Todos os módulos críticos estão no piso ou acima.');
