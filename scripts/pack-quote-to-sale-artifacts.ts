#!/usr/bin/env bun
/**
 * Empacota (zip) todos os artefatos de uma execução dos testes quote-to-sale.
 *
 * Uso:
 *   bun scripts/pack-quote-to-sale-artifacts.ts              # última execução
 *   bun scripts/pack-quote-to-sale-artifacts.ts <RUN_ID>     # execução específica
 *   bun scripts/pack-quote-to-sale-artifacts.ts --all        # todas as execuções
 *
 * Saída: test-results/quote-to-sale-artifacts-<RUN_ID>.zip
 */
import { $ } from 'bun';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('test-results/quote-to-sale');

if (!existsSync(ROOT)) {
  console.error(`❌ Nenhuma pasta de artefatos encontrada em ${ROOT}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const runs = readdirSync(ROOT)
  .filter((n) => statSync(path.join(ROOT, n)).isDirectory())
  .filter((n) => !n.startsWith('.'))
  .sort();

if (runs.length === 0) {
  console.error(`❌ Nenhuma execução (RUN_ID) encontrada em ${ROOT}`);
  process.exit(1);
}

let targets: string[];
if (args[0] === '--all') {
  targets = runs;
} else if (args[0]) {
  if (!runs.includes(args[0])) {
    console.error(`❌ RUN_ID "${args[0]}" não existe. Disponíveis:\n  - ${runs.join('\n  - ')}`);
    process.exit(1);
  }
  targets = [args[0]];
} else {
  targets = [runs[runs.length - 1]];
}

for (const runId of targets) {
  const src = path.join(ROOT, runId);
  const out = path.resolve(`test-results/quote-to-sale-artifacts-${runId}.zip`);
  console.log(`📦 Empacotando ${src}\n   → ${out}`);
  // usa `zip` nativo; recursivo, com paths relativos.
  await $`zip -r ${out} ${runId}`.cwd(ROOT).quiet();
  console.log(`✅ Gerado: ${out}`);
}

console.log(`\n🎉 Concluído (${targets.length} execução(ões) empacotada(s)).`);
