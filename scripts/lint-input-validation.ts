#!/usr/bin/env -S deno run --allow-read
// AUD-VALIDACAO — Lint: bloqueia edge function que escreve no banco sem
// validar o payload de entrada.
//
// Regras:
//   1. Todo supabase/functions/<name>/index.ts que executa escrita
//      (.insert( / .update( / .upsert( / .delete( / .rpc() DEVE importar um
//      validador compartilhado: _shared/validation.ts ou, nos webhooks com
//      contrato versionado, _shared/webhook-validator.ts.
//   2. Exceções legadas ficam em scripts/input-validation-lint-allowlist.txt.
//      Novas funções NÃO podem ser adicionadas ao allowlist.
//   3. Função no allowlist que já adota um validador compartilhado também
//      falha (força limpeza — evita entradas mortas).
//
// Uso:
//   deno run --allow-read scripts/lint-input-validation.ts
// Exit codes:
//   0 sem drift
//   1 drift detectado (violadores ou entradas stale)
//   2 erro inesperado

import { walk } from 'jsr:@std/fs/walk';

const FUNCTIONS_DIR = 'supabase/functions';
const ALLOWLIST_PATH = 'scripts/input-validation-lint-allowlist.txt';

async function loadAllowlist(): Promise<Set<string>> {
  try {
    const raw = await Deno.readTextFile(ALLOWLIST_PATH);
    return new Set(
      raw
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
    );
  } catch {
    return new Set();
  }
}

interface FnScan {
  name: string;
  writesToDb: boolean;
  importsValidator: boolean;
}

async function scanFunctions(): Promise<FnScan[]> {
  const results: FnScan[] = [];
  // Escrita via query builder do supabase-js ou RPC (a RPC pode gravar).
  const writePattern = /\.(?:insert|update|upsert|delete|rpc)\s*\(/;
  const validatorPattern =
    /from\s+["'][^"']*_shared\/(?:validation|webhook-validator)\.ts["']/;

  for await (const entry of walk(FUNCTIONS_DIR, {
    includeDirs: false,
    match: [/\/index\.ts$/],
    skip: [/\/_shared\//, /\/node_modules\//],
  })) {
    const parts = entry.path.split('/');
    const name = parts[parts.length - 2];
    if (!name || name.startsWith('_')) continue;
    const src = await Deno.readTextFile(entry.path);
    results.push({
      name,
      writesToDb: writePattern.test(src),
      importsValidator: validatorPattern.test(src),
    });
  }
  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

function main() {
  return (async () => {
    const [allow, scans] = await Promise.all([loadAllowlist(), scanFunctions()]);

    const violators: string[] = [];
    const stale: string[] = [];

    for (const s of scans) {
      if (s.writesToDb && !s.importsValidator && !allow.has(s.name)) {
        violators.push(s.name);
      }
      if (s.importsValidator && allow.has(s.name)) {
        stale.push(s.name);
      }
    }

    const compliant = scans.filter(s => s.writesToDb && s.importsValidator).length;
    const writers = scans.filter(s => s.writesToDb).length;

    console.log(
      `✓ ${compliant}/${writers} edge functions com escrita importam validador compartilhado`
    );
    console.log(`  allowlisted (legacy): ${allow.size}`);

    if (violators.length === 0 && stale.length === 0) {
      console.log('✓ input-validation lint: no drift');
      return 0;
    }

    if (violators.length > 0) {
      console.error(
        `\n✗ ${violators.length} edge function(s) com escrita SEM validação de entrada e FORA do allowlist:`
      );
      for (const v of violators) console.error(`   - ${v}`);
      console.error(
        '\n  Valide o payload com _shared/validation.ts (validateString/validateUUID/validateNumber/validateEnum + collectErrors + validationErrorResponse) ' +
          'ou _shared/webhook-validator.ts nos webhooks com contrato. Exceções legadas documentadas: scripts/input-validation-lint-allowlist.txt.'
      );
    }

    if (stale.length > 0) {
      console.error(
        `\n✗ ${stale.length} stale allowlist entry(ies) — já importam validador compartilhado, remover do allowlist:`
      );
      for (const s of stale) console.error(`   - ${s}`);
    }

    return 1;
  })();
}

if (import.meta.main) {
  try {
    const code = await main();
    Deno.exit(code);
  } catch (err) {
    console.error('lint crashed:', err instanceof Error ? err.stack : err);
    Deno.exit(2);
  }
}
