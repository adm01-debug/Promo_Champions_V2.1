#!/usr/bin/env node
/**
 * Ratchet da camada de dados (auditoria DATALAYER).
 *
 * Regra: acesso direto ao Supabase (`supabase.from(...)` / `supabase.rpc(...)`)
 * só é permitido dentro da camada de dados:
 *   src/hooks/   — hooks TanStack Query por domínio
 *   src/services/— acesso não-React (singletons)
 *   src/lib/     — utilitários de dados puros
 *   src/integrations/ — clientes gerados
 *
 * Exceções:
 *   - Arquivos listados em scripts/baselines/data-layer.txt (legado — migrar
 *     para hooks/services quando tocar no arquivo; registrar TODO no PR).
 *   - Linha com comentário `// data-layer-ok` — exceção legítima pontual.
 *
 * Falha (exit 1) se um arquivo FORA da baseline tiver acesso direto.
 * Entrada de baseline sem violação vira aviso (remova-a ao migrar o arquivo).
 * Para atualizar a baseline após migrar arquivos, regenere com:
 *   node scripts/check-data-layer.mjs --update-baseline
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const BASELINE_PATH = join(ROOT, 'scripts', 'baselines', 'data-layer.txt');

const ALLOWED_PREFIXES = [
  'src/hooks/',
  'src/services/',
  'src/lib/',
  'src/integrations/',
];

const SKIP_FILE = /\.(test|spec)\.(ts|tsx)$/;

// Acesso direto: supabase.from( / supabase.rpc( (qualquer quebra de linha entre tokens)
const ACCESS_RE = /supabase\s*\.\s*(from|rpc)\s*\(/g;
const OK_COMMENT = 'data-layer-ok';

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) yield full;
  }
}

const baseline = new Set(
  readFileSync(BASELINE_PATH, 'utf-8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
);

const offenders = new Map(); // file -> [lines]

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  if (SKIP_FILE.test(rel)) continue;
  if (ALLOWED_PREFIXES.some(p => rel.startsWith(p))) continue;

  const lines = readFileSync(file, 'utf-8').split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    if (line.includes(OK_COMMENT)) return;
    // regex é multiline-friendly: checar a linha e a junção com a próxima
    const chunk = `${line} ${lines[i + 1] ?? ''}`;
    if (/supabase\s*\.\s*(from|rpc)\s*\(/.test(chunk)) hits.push(i + 1);
  });
  if (hits.length) offenders.set(rel, hits);
}

if (process.argv.includes('--update-baseline')) {
  const files = [...offenders.keys()].sort();
  writeFileSync(BASELINE_PATH, files.join('\n') + '\n');
  console.log(`✔ baseline atualizada: ${files.length} arquivo(s) com acesso direto legado`);
  process.exit(0);
}

const newViolations = [...offenders.keys()].filter(f => !baseline.has(f));
const staleEntries = [...baseline].filter(f => !offenders.has(f));

if (staleEntries.length) {
  console.log(`ℹ ${staleEntries.length} entrada(s) obsoleta(s) na baseline (arquivo já migrado — remova):`);
  for (const f of staleEntries) console.log(`   • ${f}`);
}

if (newViolations.length) {
  console.error(`\n❌ ${newViolations.length} arquivo(s) com acesso direto ao Supabase fora da camada de dados:`);
  for (const f of newViolations) {
    console.error(`   • ${f} (linhas: ${offenders.get(f).join(', ')})`);
  }
  console.error(
    '\nExtraia a query para src/hooks/ ou src/services/. Exceções legítimas: ' +
      'comentário `// data-layer-ok` na linha. Legado novo NÃO entra na baseline.'
  );
  process.exit(1);
}

console.log(
  `\n✔ camada de dados OK — ${offenders.size} arquivo(s) legado(s) na baseline, 0 violação nova`
);
