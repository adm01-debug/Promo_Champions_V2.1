#!/usr/bin/env node
/**
 * Relatório de flakies + quarentena de specs (vitest).
 *
 * Lê o JSON do vitest (--reporter=json --outputFile=...) e classifica cada
 * spec:
 *   - flaky: passou, mas com failureMessages registradas — vitest 5 não expõe
 *     retryCount no JSON; passou-com-falha-anterior só acontece quando o teste
 *     foi recuperado por --retry (retry>0);
 *   - failed: status 'failed' mesmo após os retries;
 *   - quarantined: consta em tests/flaky-quarantine.json — roda mas não
 *     reprova o build (com ::warning:: e prazo). Prazo vencido invalida a
 *     quarentena e a spec volta a contar como falha real.
 *
 * Saídas:
 *   - markdown em --output (artefato do CI);
 *   - ::warning:: por flaky e por spec em quarentena;
 *   - exit 1 se houver falha real (não-quarentenada) ou se o vitest não
 *     produziu resultado válido; 0 caso contrário.
 *
 * Uso:
 *   node scripts/flaky-report.mjs \
 *     --input test-results/vitest.json \
 *     --output test-results/flaky-report.md \
 *     --quarantine tests/flaky-quarantine.json \
 *     --vitest-exit 0
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
function opt(name, def) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
}

const input = opt('input', 'test-results/vitest.json');
const output = opt('output', 'test-results/flaky-report.md');
const quarantinePath = opt('quarantine', 'tests/flaky-quarantine.json');
const vitestExit = Number(opt('vitest-exit', '0'));
const isCI = Boolean(process.env.CI);

if (!existsSync(input)) {
  console.error(
    `::error::Relatório JSON do vitest não encontrado em ${input} — a suíte não rodou ou quebrou antes de reportar.`,
  );
  process.exit(1);
}

const report = JSON.parse(readFileSync(input, 'utf8'));

const quarantine = new Map();
if (existsSync(quarantinePath)) {
  const raw = JSON.parse(readFileSync(quarantinePath, 'utf8'));
  for (const entry of raw.specs ?? []) {
    quarantine.set(entry.id, entry);
  }
}

const hoje = new Date().toISOString().slice(0, 10);
const flakies = [];
const failedReal = [];
const failedQuarantined = [];
const expiredQuarantine = [];

for (const file of report.testResults ?? []) {
  for (const t of file.assertionResults ?? []) {
    const id = `${file.name}::${t.fullName}`;
    const entry = quarantine.get(id) ?? quarantine.get(file.name);
    const active =
      entry && (!entry.ate || entry.ate >= hoje);
    const expired = entry && entry.ate && entry.ate < hoje;

    if (expired) {
      expiredQuarantine.push({ id, entry });
      console.warn(
        `::warning::Quarentena vencida (${entry.ate}) para ${id} — volta a contar como falha normal.`,
      );
    }

    if (t.status === 'failed' || t.status === 'timedout') {
      if (active) {
        failedQuarantined.push({ id, entry });
        console.warn(
          `::warning::Spec em quarentena falhou (não reprova): ${id} — prazo ${entry.ate ?? 'sem data'} — ${entry.motivo ?? ''}`,
        );
      } else {
        failedReal.push(id);
      }
    } else if (t.status === 'passed' && (t.failureMessages?.length ?? 0) > 0) {
      flakies.push({ id, quarantined: Boolean(active) });
      console.warn(`::warning::Flaky (passou após retry): ${id}`);
    }
  }
}

const lines = [];
lines.push('# Relatório de flakies — vitest');
lines.push('');
lines.push(`- Suites: ${report.numTotalTestSuites ?? '?'} | Testes: ${report.numTotalTests ?? '?'}`);
lines.push(`- Flakes detectados (retry>0): **${flakies.length}**`);
lines.push(`- Falhas reais: **${failedReal.length}**`);
lines.push(`- Falhas em quarentena: **${failedQuarantined.length}**`);
lines.push('');
if (flakies.length) {
  lines.push('## Flaky tests (passaram após retry)');
  lines.push('');
  for (const f of flakies) {
    lines.push(`- \`${f.id}\`${f.quarantined ? ' — em quarentena' : ''}`);
  }
  lines.push('');
}
if (failedQuarantined.length) {
  lines.push('## Falhas toleradas por quarentena');
  lines.push('');
  lines.push('| Spec | Prazo | Motivo |');
  lines.push('| --- | --- | --- |');
  for (const f of failedQuarantined) {
    lines.push(
      `| \`${f.id}\` | ${f.entry.ate ?? '—'} | ${f.entry.motivo ?? '—'} |`,
    );
  }
  lines.push('');
}
if (failedReal.length) {
  lines.push('## Falhas reais');
  lines.push('');
  for (const id of failedReal) lines.push(`- \`${id}\``);
  lines.push('');
}
if (expiredQuarantine.length) {
  lines.push('## Quarentenas vencidas');
  lines.push('');
  for (const q of expiredQuarantine) lines.push(`- \`${q.id}\` (venceu ${q.entry.ate})`);
  lines.push('');
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, lines.join('\n'));

console.log(`[flaky-report] flakes=${flakies.length} falhas=${failedReal.length} quarentenadas=${failedQuarantined.length} -> ${output}`);

if (failedReal.length > 0 || vitestExit !== 0) {
  if (vitestExit !== 0 && failedReal.length === 0) {
    console.error(
      `::error::vitest saiu com código ${vitestExit} sem falhas de spec no JSON (crash/infra).`,
    );
  }
  process.exit(1);
}
