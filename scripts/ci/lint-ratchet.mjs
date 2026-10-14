#!/usr/bin/env node
/**
 * Adaptador do gate de lint para o verificador compartilhado da Arquitetura V2
 * (zapp-verify -> zapp-lint-rapido.mjs), que espera `scripts/ci/lint-ratchet.mjs`
 * exportando eslintCommandArguments/scopeBaseline/compareBaseline e a baseline
 * em `scripts/ci/eslint-baseline.json`.
 *
 * O gate real deste repo é `npm run lint` = eslint com `--max-warnings 0`:
 * tolerância ZERO, sem dívida permitida. Por isso a baseline é a lista vazia —
 * toda ocorrência encontrada conta como "nova" e reprova.
 *
 * Standalone (`node scripts/ci/lint-ratchet.mjs`): roda eslint no repositório
 * inteiro com o mesmo critério de zero ocorrências.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const BASELINE_PATH = 'scripts/ci/eslint-baseline.json';

export function eslintCommandArguments(eslintEntry, { targets = [], noWarnIgnored = false } = {}) {
  const args = [eslintEntry, '--format', 'json'];
  if (noWarnIgnored) args.push('--no-warn-ignored');
  return [...args, ...targets];
}

function flattenReport(report, root) {
  const issues = [];
  for (const entry of report) {
    const file = path.relative(root, entry.filePath).split(path.sep).join('/');
    for (const m of entry.messages ?? []) {
      issues.push({
        file,
        line: m.line ?? 0,
        column: m.column ?? 0,
        severity: m.severity ?? 0,
        ruleId: m.ruleId ?? null,
        message: String(m.message ?? ''),
      });
    }
  }
  return issues;
}

// Baseline deste repo é a lista vazia (zero tolerância); os parâmetros vistos/
// apagados existem só por compatibilidade com o chamador do verificador.
export function scopeBaseline(_full, _vistos, _apagados) {
  return [];
}

export function compareBaseline(baseline, report, root) {
  const issues = flattenReport(report, root);
  const known = new Set(
    (baseline ?? []).map(
      i => `${i.file}:${i.line}:${i.column}:${i.ruleId ?? 'parser'}:${i.message}`
    )
  );
  const added = issues.filter(
    i => !known.has(`${i.file}:${i.line}:${i.column}:${i.ruleId ?? 'parser'}:${i.message}`)
  );
  return {
    baselineCount: known.size,
    currentCount: issues.length,
    matchedCount: issues.length - added.length,
    removed: [],
    added,
  };
}

async function main() {
  const root = process.cwd();
  const eslintEntry = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!existsSync(eslintEntry)) {
    console.error('lint-ratchet: eslint local não encontrado (node_modules ausente?).');
    process.exit(2);
  }
  const baseline = existsSync(path.join(root, BASELINE_PATH))
    ? JSON.parse(readFileSync(path.join(root, BASELINE_PATH), 'utf8'))
    : [];
  const r = spawnSync(
    process.execPath,
    eslintCommandArguments(eslintEntry, { targets: ['.'], noWarnIgnored: true }),
    { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  if (r.error) throw r.error;
  if (r.status !== 0 && r.status !== 1) {
    console.error(`ESLint falhou com exit ${r.status}: ${(r.stderr || '').trim().slice(0, 300)}`);
    process.exit(2);
  }
  const report = JSON.parse(r.stdout || '[]');
  const cmp = compareBaseline(baseline, report, root);
  console.log(
    `Lint: baseline=${cmp.baselineCount}, atual=${cmp.currentCount}, novas=${cmp.added.length}`
  );
  if (cmp.added.length === 0) process.exit(0);
  for (const i of cmp.added.slice(0, 50)) {
    console.log(
      `${i.file}:${i.line}:${i.column} ${i.severity === 2 ? 'error' : 'warning'} ${i.ruleId ?? 'parser'} - ${i.message}`
    );
  }
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
