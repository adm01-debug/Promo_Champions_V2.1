#!/usr/bin/env node
/**
 * Ratchet de type-check das edge functions (auditoria 2026-10 — item 18).
 *
 * `deno check` em supabase/functions encontra 58 erros de tipo legados em
 * 31 arquivos. Ligá-lo como gate de PR exige baseline por DIAGNÓSTICO:
 * cada erro vira um fingerprint `arquivo|TScodigo|mensagem` e o job falha
 * se aparecer qualquer fingerprint novo — dentro ou fora dos arquivos
 * legados — independentemente do total bater com a baseline.
 *
 * O script falha fechado: deno que não executa, saída sem diagnósticos
 * reconhecíveis ou contagem divergente de "Found N errors" reprovam o gate
 * (nunca aprovam às cegas).
 *
 * Corrigiu erros legados? Encolha a baseline e commite:
 *   node scripts/check-deno-types.mjs --update-baseline
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

const fail = (msg, extra = '') => {
  console.log(`::error::${msg}`);
  if (extra) console.log(extra);
  process.exit(1);
};

if (result.error) {
  fail(
    `deno check não executou (${result.error.message}). Verifique a instalação do Deno no runner/local.`,
  );
}
if (result.signal || result.status === null) {
  fail(
    `deno check terminou por sinal ${result.signal ?? 'desconhecido'} — a checagem não rodou, gate reprovado.`,
  );
}

// deno colore os paths dos erros — strip ANSI antes de parsear.
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(
  /\x1b\[[0-9;]*m/g,
  ''
);

// Cada diagnóstico é um bloco separado por linha em branco:
//   TS2345 [ERROR]: mensagem...
//       <código fonte>
//       ~~~~
//       at file:///.../supabase/functions/x/index.ts:63:13
// Erros sem localização em functions/ recebem file '(sem-localizacao)' —
// nunca estão na baseline, então reprovam o gate.
const diagnostics = [];
for (const block of output.split(/\n[ \t]*\n/)) {
  const ts = block.match(/TS(\d+) \[ERROR\]: ([^\n]+)/);
  if (!ts) continue;
  const at = block.match(/at file:\/\/\S+(functions\/[^\s]+\.ts):\d+:\d+/);
  const file = at ? `supabase/${at[1]}` : '(sem-localizacao)';
  const msg = ts[2].trim().replace(/\s+/g, ' ');
  diagnostics.push(`${file} | TS${ts[1]} | ${msg}`);
}
diagnostics.sort();

const found = output.match(/Found (\d+) errors/);

if (result.status !== 0) {
  if (!found) {
    fail(
      `deno check saiu com código ${result.status} sem relatório de erros reconhecível — tratando como falha.`,
      output.slice(-3000),
    );
  }
  if (Number(found[1]) !== diagnostics.length) {
    // O deno contou N erros mas só conseguimos atribuir alguns — o restante
    // ficou invisível para o gate. Melhor reprovar do que aprovar às cegas.
    fail(
      `deno check reportou ${found[1]} erros, mas só ${diagnostics.length} foram atribuídos a arquivos — formato inesperado, gate reprovado.`,
      output.slice(-3000),
    );
  }
}

if (UPDATE_BASELINE) {
  const baseline = {
    comment:
      "Baseline de erros de tipo legados, um fingerprint 'arquivo | TScodigo | mensagem' por diagnóstico. Só pode descer — gere com 'node scripts/check-deno-types.mjs --update-baseline' após corrigir erros.",
    diagnostics,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n');
  console.log(
    `[deno-typecheck] Baseline atualizada: ${diagnostics.length} diagnósticos.`
  );
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
const baselineCount = new Map();
for (const d of baseline.diagnostics ?? []) {
  baselineCount.set(d, (baselineCount.get(d) ?? 0) + 1);
}

const seen = new Map();
const newDiagnostics = [];
for (const d of diagnostics) {
  const already = seen.get(d) ?? 0;
  seen.set(d, already + 1);
  if (already + 1 > (baselineCount.get(d) ?? 0)) {
    newDiagnostics.push(d);
  }
}

if (diagnostics.length) {
  const files = [...new Set(diagnostics.map(d => d.split(' | ')[0]))].sort();
  console.log(
    `[deno-typecheck] ${diagnostics.length} erros de tipo em ${files.length} arquivos.`
  );
}

if (newDiagnostics.length) {
  console.log(
    `::error::${newDiagnostics.length} diagnóstico(s) de tipo FORA da baseline:`
  );
  for (const d of newDiagnostics.slice(0, 20)) {
    console.log(`::error::  ${d}`);
  }
  if (newDiagnostics.length > 20) {
    console.log(`::error::  ... e mais ${newDiagnostics.length - 20}.`);
  }
  process.exit(1);
}

console.log(
  `[deno-typecheck] OK — ${diagnostics.length}/${baseline.diagnostics?.length ?? 0} diagnósticos dentro da baseline.`
);
process.exit(0);
