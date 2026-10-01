#!/usr/bin/env node
/**
 * Executor da suíte Deno das edge functions.
 *
 * Dois tiers:
 *   unit  — todo *_test.ts / *.test.ts de supabase/functions que NÃO está em
 *           tests/deno-live-tests.json. Self-contained: deve passar sem secrets
 *           nem rede. Qualquer falha reprova (exit 1).
 *   live  — apenas as suites do manifesto (dependem de backend vivo/secrets).
 *           Sem VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY: puladas com
 *           ::warning:: listando cada arquivo. Com secrets: rodam de verdade;
 *           falhas classificadas como credencial inválida ("Invalid API key",
 *           JWT inválido, MissingEnvVars) viram warning — não reprovam; qualquer
 *           outra falha reprova.
 *   all   — unit + live (default).
 *
 * Uso:
 *   node scripts/deno-test-suite.mjs [--mode unit|live|all] [--verbose]
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const FUNCTIONS_DIR = join(ROOT, 'supabase/functions');
const MANIFEST_PATH = join(ROOT, 'tests/deno-live-tests.json');

const args = process.argv.slice(2);
const mode = args.includes('--mode') ? args[args.indexOf('--mode') + 1] : 'all';
const verbose = args.includes('--verbose');
const isCI = Boolean(process.env.CI);

const CREDENTIAL_FAILURE = /Invalid API key|invalid JWT|MissingEnvVarsError|Invalid login credentials|401 Unauthorized/i;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else if (/_test\.ts$|\.test\.ts$/.test(entry)) {
      yield full;
    }
  }
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const liveFiles = new Set(manifest.suites.map((s) => s.file));
const allFiles = [...walk(FUNCTIONS_DIR)]
  .map((f) => relative(ROOT, f))
  .sort();

const missing = [...liveFiles].filter((f) => !allFiles.includes(f));
if (missing.length) {
  console.warn(
    `::warning::Manifesto live lista suites inexistentes: ${missing.join(', ')}`,
  );
}

const unitFiles = allFiles.filter((f) => !liveFiles.has(f));
const liveList = allFiles.filter((f) => liveFiles.has(f));

function runSuite(file, extraEnv = {}) {
  try {
    const out = execFileSync(
      'deno',
      [
        'test',
        '--frozen',
        '--no-check',
        '--node-modules-dir=none',
        '--allow-read',
        '--allow-env',
        '--allow-net',
        '--allow-run',
        file,
      ],
      {
        cwd: ROOT,
        env: { ...process.env, ...extraEnv },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 180_000,
      },
    );
    return { code: 0, out };
  } catch (err) {
    return {
      code: err.status ?? 1,
      out: `${err.stdout ?? ''}\n${err.stderr ?? ''}`,
    };
  }
}

function runTier(label, files, { liveMode }) {
  const passed = [];
  const failed = [];
  const credSkipped = [];
  for (const file of files) {
    const { code, out } = runSuite(file);
    if (code === 0) {
      passed.push(file);
      if (verbose) console.log(`ok   ${file}`);
      continue;
    }
    if (liveMode && CREDENTIAL_FAILURE.test(out)) {
      credSkipped.push(file);
      console.warn(
        `::warning::${label}: ${file} pulada — credencial inválida/ausente (Invalid API key / env)`,
      );
      continue;
    }
    failed.push(file);
    console.error(`::error::${label}: ${file} FALHOU`);
    if (verbose || isCI) {
      console.error(out.split('\n').slice(-40).join('\n'));
    }
  }
  return { passed, failed, credSkipped };
}

const summary = { unit: null, live: null };

if (mode === 'unit' || mode === 'all') {
  console.log(`[deno-suite] tier unit: ${unitFiles.length} suites`);
  summary.unit = runTier('unit', unitFiles, { liveMode: false });
}

if (mode === 'live' || mode === 'all') {
  const hasSecrets = Boolean(
    process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!hasSecrets) {
    console.warn(
      `::warning::tier live pulado — sem VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY. ` +
        `${liveList.length} suites live não executaram:`,
    );
    for (const f of liveList) console.warn(`::warning::  skip ${f}`);
    summary.live = { skippedAll: true, files: liveList };
  } else {
    console.log(`[deno-suite] tier live: ${liveList.length} suites`);
    summary.live = runTier('live', liveList, { liveMode: true });
  }
}

const failures =
  (summary.unit?.failed.length ?? 0) + (summary.live?.failed?.length ?? 0);
console.log('\n[deno-suite] resumo');
console.log(`  unit: ${summary.unit?.passed.length ?? 0} ok / ${summary.unit?.failed.length ?? 0} falhas`);
if (summary.live?.skippedAll) {
  console.log(`  live: ${summary.live.files.length} puladas (sem secrets)`);
} else if (summary.live) {
  console.log(
    `  live: ${summary.live.passed.length} ok / ${summary.live.failed.length} falhas / ${summary.live.credSkipped.length} puladas por credencial`,
  );
}

process.exit(failures > 0 ? 1 : 0);
