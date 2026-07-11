#!/usr/bin/env -S deno run --allow-read
// OBS-04 — Lint: bloqueia Deno.serve/serve sem withRequestId em edge functions.
//
// Regras:
//   1. Toda edge function em supabase/functions/<name>/index.ts que usa
//      `Deno.serve(` ou `serve(` DEVE importar/usar `withRequestId`.
//   2. Exceções legadas ficam em scripts/request-id-lint-allowlist.txt.
//      Novas funções NÃO podem ser adicionadas ao allowlist.
//   3. Se uma função no allowlist já adotou `withRequestId`, o lint também
//      falha (força limpeza — evita entradas mortas).
//
// Uso:
//   deno run --allow-read scripts/lint-request-id.ts
// Exit codes:
//   0 sem drift
//   1 drift detectado (violadores ou entradas stale)
//   2 erro inesperado

import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

const FUNCTIONS_DIR = "supabase/functions";
const ALLOWLIST_PATH = "scripts/request-id-lint-allowlist.txt";

async function loadAllowlist(): Promise<Set<string>> {
  try {
    const raw = await Deno.readTextFile(ALLOWLIST_PATH);
    return new Set(
      raw.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#")),
    );
  } catch {
    return new Set();
  }
}

interface FnScan {
  name: string;
  usesServe: boolean;
  usesWithRequestId: boolean;
}

async function scanFunctions(): Promise<FnScan[]> {
  const results: FnScan[] = [];
  const servePattern = /\bDeno\.serve\s*\(|(^|\s)serve\s*\(/m;
  const helperPattern = /\bwithRequestId\b/;

  for await (const entry of walk(FUNCTIONS_DIR, {
    includeDirs: false,
    match: [/\/index\.ts$/],
    skip: [/\/_shared\//, /\/node_modules\//],
  })) {
    const parts = entry.path.split("/");
    const name = parts[parts.length - 2];
    if (!name || name.startsWith("_")) continue;
    const src = await Deno.readTextFile(entry.path);
    results.push({
      name,
      usesServe: servePattern.test(src),
      usesWithRequestId: helperPattern.test(src),
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
      if (s.usesServe && !s.usesWithRequestId && !allow.has(s.name)) {
        violators.push(s.name);
      }
      if (s.usesWithRequestId && allow.has(s.name)) {
        stale.push(s.name);
      }
    }

    const compliant = scans.filter(s => s.usesWithRequestId).length;
    const total = scans.filter(s => s.usesServe).length;

    console.log(`✓ ${compliant}/${total} edge functions use withRequestId`);
    console.log(`  allowlisted (legacy): ${allow.size}`);

    if (violators.length === 0 && stale.length === 0) {
      console.log("✓ request-id lint: no drift");
      return 0;
    }

    if (violators.length > 0) {
      console.error(
        `\n✗ ${violators.length} edge function(s) missing withRequestId and NOT in allowlist:`,
      );
      for (const v of violators) console.error(`   - ${v}`);
      console.error("\n  Adopt withRequestId (supabase/functions/_shared/request-id.ts) or, if truly legacy, add to scripts/request-id-lint-allowlist.txt.");
    }

    if (stale.length > 0) {
      console.error(`\n✗ ${stale.length} stale allowlist entry(ies) — already adopted withRequestId, remove from allowlist:`);
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
    console.error("lint crashed:", err instanceof Error ? err.stack : err);
    Deno.exit(2);
  }
}
