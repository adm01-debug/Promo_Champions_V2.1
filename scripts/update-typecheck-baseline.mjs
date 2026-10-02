#!/usr/bin/env node
/**
 * Regenera scripts/typecheck-baseline.json a partir da compilação atual de
 * tsconfig.strict.json. Rode após corrigir erros para reduzir a baseline —
 * nunca para absorver regressão (ver scripts/check-typecheck-baseline.mjs).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const result = spawnSync(
  'npx',
  ['tsc', '-p', 'tsconfig.strict.json', '--noEmit', '--pretty', 'false'],
  { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
);
const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

const errorRe = /^([^\s(]+\.tsx?)\((\d+),(\d+)\): error (TS\d+):/gm;
const byFileAndCode = {};
let m;
let total = 0;
while ((m = errorRe.exec(output))) {
  const key = `${m[1]}|${m[4]}`;
  byFileAndCode[key] = (byFileAndCode[key] ?? 0) + 1;
  total += 1;
}

const baseline = {
  geradoEm: new Date().toISOString(),
  flags: ['noUncheckedIndexedAccess', 'noUnusedLocals', 'noUnusedParameters'],
  tsconfig: 'tsconfig.strict.json',
  total,
  byFileAndCode: Object.fromEntries(
    Object.entries(byFileAndCode).sort(([a], [b]) => a.localeCompare(b))
  ),
};

const path = join(process.cwd(), 'scripts', 'typecheck-baseline.json');
writeFileSync(path, JSON.stringify(baseline, null, 2) + '\n');
console.log(`✅ Baseline atualizada: ${total} erro(s) → ${path}`);
