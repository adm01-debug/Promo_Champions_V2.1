#!/usr/bin/env node
/**
 * Ratchet de typecheck estrito (pacote de tipagem — STRICT).
 *
 * Compila `tsconfig.strict.json` (noUncheckedIndexedAccess + noUnusedLocals +
 * noUnusedParameters) e compara os erros contra
 * `scripts/typecheck-baseline.json`. Falha apenas em erros NOVOS:
 *  - um par arquivo+código TS com mais erros que a baseline;
 *  - um arquivo+código ausente da baseline (primeiro erro daquele tipo ali).
 *
 * Reduzir a baseline é sempre bem-vindo: corrigiu erros, rode
 * `npm run typecheck:baseline:update` e commite o JSON novo.
 * Zerou uma flag? Mova-a de tsconfig.strict.json para tsconfig.app.json.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASELINE_PATH = join(process.cwd(), 'scripts', 'typecheck-baseline.json');

if (!existsSync(BASELINE_PATH)) {
  console.error(
    '❌ scripts/typecheck-baseline.json não encontrado. Rode `npm run typecheck:baseline:update`.'
  );
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));

const result = spawnSync(
  'npx',
  ['tsc', '-p', 'tsconfig.strict.json', '--noEmit', '--pretty', 'false'],
  { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
);
const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

const errorRe = /^([^\s(]+\.tsx?)\((\d+),(\d+)\): error (TS\d+):/gm;
const current = new Map(); // "arquivo|TSxxxx" -> count
const examples = new Map(); // "arquivo|TSxxxx" -> primeira linha de erro
let m;
while ((m = errorRe.exec(output))) {
  const key = `${m[1]}|${m[4]}`;
  current.set(key, (current.get(key) ?? 0) + 1);
  if (!examples.has(key)) examples.set(key, m[0]);
}

const total = [...current.values()].reduce((a, b) => a + b, 0);
const regressions = [];
for (const [key, count] of current) {
  const allowed = baseline.byFileAndCode[key] ?? 0;
  if (count > allowed) {
    regressions.push({ key, count, allowed, example: examples.get(key) });
  }
}

console.log(
  `  estrito: ${total} erro(s) atual / ${baseline.total} na baseline (${baseline.flags.join(', ')})`
);

if (regressions.length > 0) {
  console.error('\n❌ Novos erros de typecheck estrito acima da baseline:');
  for (const r of regressions.sort((a, b) => a.key.localeCompare(b.key))) {
    console.error(`  ${r.key}: ${r.count} atual > ${r.allowed} baseline`);
    console.error(`    ex: ${r.example}`);
  }
  console.error(
    '\nCorrija os erros novos ou, se resolveu débito, rode `npm run typecheck:baseline:update`.'
  );
  process.exit(1);
}

console.log('✅ Sem erros novos acima da baseline de typecheck estrito.');
