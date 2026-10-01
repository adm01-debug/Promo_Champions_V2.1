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
 *           ::warning:: listando cada arquivo. Com secrets: antes de rodar, um
 *           pre-flight valida a anon key (e a service_role para suites marcadas
 *           com "requer_service_role") contra /rest/v1/ — chave inválida (401)
 *           ou backend inacessível pulam as suites com warning, não reprovam.
 *           Suites que rodam e falham por credencial/autorização
 *           ("Invalid API key", JWT inválido, MissingEnvVars, backend
 *           respondendo 401) viram warning — não reprovam; qualquer outra
 *           falha reprova.
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

// Falhas causadas por credencial/ausência de autorização no backend vivo:
// marcadores textuais + backend respondendo 401 onde o teste esperava outro
// status (diff do assertEquals mostra o atual como "-   401").
const CREDENTIAL_FAILURE =
  /Invalid API key|invalid JWT|MissingEnvVarsError|Invalid login credentials|401 Unauthorized|got 401\b|-\s+401\b/i;

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
const serviceRoleFiles = new Set(
  manifest.suites.filter((s) => s.requer_service_role).map((s) => s.file),
);
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

async function checkKey(baseUrl, key) {
  // GET /rest/v1/ devolve o spec OpenAPI quando a apikey é aceita; 401/403
  // quando inválida. Erro de rede = backend inacessível.
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15_000),
    });
    await res.text().catch(() => '');
    return res.status === 401 || res.status === 403 ? 'invalid' : 'ok';
  } catch {
    return 'unreachable';
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

function skipAllLive(reason) {
  console.warn(
    `::warning::tier live pulado — ${reason}. ` +
      `${liveList.length} suites live não executaram:`,
  );
  for (const f of liveList) console.warn(`::warning::  skip ${f}`);
  summary.live = { skippedAll: true, files: liveList, reason };
}

if (mode === 'live' || mode === 'all') {
  const supaUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supaUrl || !anonKey) {
    skipAllLive('sem VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY');
  } else {
    const anonStatus = await checkKey(supaUrl, anonKey);
    if (anonStatus !== 'ok') {
      skipAllLive(
        anonStatus === 'invalid'
          ? 'VITE_SUPABASE_PUBLISHABLE_KEY inválida (backend respondeu 401)'
          : `backend ${supaUrl} inacessível`,
      );
    } else {
      let runnable = liveList;
      const preSkipped = [];
      const needsService = liveList.filter((f) => serviceRoleFiles.has(f));
      if (needsService.length) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const serviceStatus = serviceKey
          ? await checkKey(supaUrl, serviceKey)
          : 'missing';
        if (serviceStatus !== 'ok') {
          const label =
            serviceStatus === 'missing'
              ? 'SUPABASE_SERVICE_ROLE_KEY ausente'
              : serviceStatus === 'invalid'
                ? 'SUPABASE_SERVICE_ROLE_KEY inválida (401)'
                : 'backend inacessível para service_role';
          for (const f of needsService) {
            preSkipped.push(f);
            console.warn(`::warning::live: ${f} pulada — ${label}`);
          }
          runnable = liveList.filter((f) => !serviceRoleFiles.has(f));
        }
      }
      console.log(`[deno-suite] tier live: ${runnable.length} suites`);
      summary.live = runTier('live', runnable, { liveMode: true });
      summary.live.preSkipped = preSkipped;
    }
  }
}

const failures =
  (summary.unit?.failed.length ?? 0) + (summary.live?.failed?.length ?? 0);
console.log('\n[deno-suite] resumo');
console.log(`  unit: ${summary.unit?.passed.length ?? 0} ok / ${summary.unit?.failed.length ?? 0} falhas`);
if (summary.live?.skippedAll) {
  console.log(`  live: ${summary.live.files.length} puladas (sem secrets)`);
} else if (summary.live) {
  const skipped =
    summary.live.credSkipped.length + (summary.live.preSkipped?.length ?? 0);
  console.log(
    `  live: ${summary.live.passed.length} ok / ${summary.live.failed.length} falhas / ${skipped} puladas por credencial`,
  );
}

process.exit(failures > 0 ? 1 : 0);
