#!/usr/bin/env node
/**
 * Ratchet de type-check das edge functions (auditoria 2026-10 — item 18).
 *
 * `deno check` em supabase/functions encontra 58 erros de tipo legados em
 * 31 arquivos. Ligá-lo como gate de PR exige baseline: o job falha se
 *   - qualquer arquivo FORA da baseline apresentar erro de tipo, ou
 *   - o total de erros passar de `maxErrors`.
 * Erros novos reprovam o gate; o débito legado só pode descer — para
 * encolher a baseline depois de corrigir erros, rode:
 *   node scripts/check-deno-types.mjs --update-baseline
 * e commite scripts/deno-typecheck-baseline.json.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const FUNCTIONS_DIR = join(ROOT, 'supabase/functions');
const BASELINE_PATH = join(ROOT, 'scripts/deno-typecheck-baseline.json');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');

const targets = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .flatMap(d => {
    if (d.name === '_shared') {
      return readdirSync(join(FUNCTIONS_DIR, '_shared'))
        .filter(f => f.endsWith('.ts'))
        .map(f => join(FUNCTIONS_DIR, '_shared', f));
    }
    const index = join(FUNCTIONS_DIR, d.name, 'index.ts');
    return existsSync(index) ? [index] : [];
  });

const result = spawnSync('deno', ['check', ...targets], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(
  // deno colore os paths dos erros — strip ANSI antes de parsear.
  // eslint-disable-next-line no-control-regex
  /\x1b\[[0-9;]*m/g,
  ''
);
const filesWithErrors = [
  ...new Set(
    [...output.matchAll(/at file:\/\/\S+(functions\/[^\s]+\.ts):\d+:\d+/g)].map(
      m => `supabase/${m[1]}`
    )
  ),
].sort();
const found = output.match(/Found (\d+) errors/);
const errorCount = filesWithErrors.length
  ? Number(found?.[1] ?? filesWithErrors.length)
  : 0;

if (UPDATE_BASELINE) {
  const baseline = {
    maxErrors: errorCount,
    allowedFiles: filesWithErrors,
    comment:
      "Baseline de erros de tipo legados. Só pode descer — gere com 'node scripts/check-deno-types.mjs --update-baseline' após corrigir erros.",
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n');
  console.log(
    `[deno-typecheck] Baseline atualizada: ${errorCount} erros em ${filesWithErrors.length} arquivos.`
  );
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
const allowed = new Set(baseline.allowedFiles);
const outsideBaseline = filesWithErrors.filter(f => !allowed.has(f));

if (filesWithErrors.length) {
  console.log(`[deno-typecheck] ${errorCount} erros de tipo encontrados:`);
  for (const f of filesWithErrors) {
    console.log(`  ${outsideBaseline.includes(f) ? '(NOVO)' : '(baseline)'} ${f}`);
  }
}

let failed = false;
if (errorCount > baseline.maxErrors) {
  console.log(
    `::error::Erros de tipo acima da baseline: ${errorCount} > ${baseline.maxErrors}. Corrija o erro novo ou rode --update-baseline após revisar.`
  );
  failed = true;
}
if (outsideBaseline.length) {
  console.log(
    `::error::Erros de tipo fora da baseline (${outsideBaseline.length} arquivo(s)): ${outsideBaseline.join(', ')}`
  );
  failed = true;
}
if (failed) {
  process.exit(1);
}
console.log(
  `[deno-typecheck] OK — ${errorCount}/${baseline.maxErrors} erros dentro da baseline (${filesWithErrors.length} arquivos legados).`
);
process.exit(0);
