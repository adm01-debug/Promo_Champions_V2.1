#!/usr/bin/env node
/**
 * Ratchet de fronteiras entre domínios (auditoria BOUNDARIES).
 *
 * Regras:
 *   1. src/components/<dominio> não importa src/components/<outro-dominio>.
 *      Exceção: dirs compartilhados/primitivos (SHARED_DIRS abaixo) que são
 *      a "UI kit" interna — qualquer domínio pode importá-los.
 *   2. src/hooks/ e src/services/ não importam src/components|pages
 *      (camada de dados não depende de UI — helpers colocados em
 *      components/<dominio>/ devem ser movidos para src/lib/).
 *
 * Apenas imports de runtime contam: `import type`/`export type` são ignorados.
 *
 * Exceções:
 *   - Arestas (importer -> alvo) em scripts/baselines/domain-boundaries.txt —
 *     legado medido; reportadas como warn, nunca como error.
 *   - Aresta nova (arquivo ou direção nova) => error.
 *   - Linha com comentário `// domain-boundary-ok` => exceção legítima pontual.
 *
 * Após migrar uma fronteira, regenere a baseline:
 *   node scripts/check-domain-boundaries.mjs --update-baseline
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const BASELINE_PATH = join(ROOT, 'scripts', 'baselines', 'domain-boundaries.txt');

// Dirs de componentes compartilhados (primitivos/UI kit/cross-cutting):
// qualquer domínio pode importá-los.
const SHARED_DIRS = new Set([
  'accessibility',
  'atoms',
  'common',
  'debug',
  'effects',
  'errors',
  'filters',
  'icons',
  'keyboard',
  'layout',
  'mobile',
  'molecules',
  'navigation',
  'organisms',
  'shared',
  'skeletons',
  'transitions',
  'ui',
]);

const OK_COMMENT = 'domain-boundary-ok';

// Resolve alias `@/` para `src/`; ignora imports relativos que não cruzam domínio.
const IMPORT_RE = /(?:import|export)\s+(?!type\b)[\s\S]*?from\s+['"]([^'"]+)['"]/g;
const BARE_IMPORT_RE = /^import\s+['"]([^'"]+)['"]/gm; // side-effect imports

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) yield full;
  }
}

const domainOf = rel => {
  const m = /^src\/components\/([^/]+)\//.exec(rel);
  return m ? m[1] : null;
};

const isSharedTarget = rel => {
  const d = domainOf(rel);
  return d && SHARED_DIRS.has(d);
};

function resolveTarget(importerRel, spec) {
  if (spec.startsWith('@/')) return `src/${spec.slice(2)}`;
  if (spec.startsWith('.')) {
    const base = relative(ROOT, join(dirname(join(ROOT, importerRel)), spec)).replaceAll('\\', '/');
    return base.startsWith('src/') ? base : `src/${base}`;
  }
  return null; // pacote externo
}

const violations = []; // {from, to, rule, line}
const edgeKey = v => `${v.from}|${v.to}`;

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  if (/\.(test|spec)\.(ts|tsx)$/.test(rel)) continue;
  const src = readFileSync(file, 'utf-8');
  const srcNoType = src
    .replace(/^import\s+type[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .replace(/^export\s+type[\s\S]*?from\s+['"][^'"]+['"];?/gm, '');

  const specs = [];
  for (const m of srcNoType.matchAll(IMPORT_RE)) specs.push(m[1]);
  for (const m of srcNoType.matchAll(BARE_IMPORT_RE)) specs.push(m[1]);

  if (src.includes(OK_COMMENT)) continue; // arquivo marcado como exceção pontual

  for (const spec of specs) {
    const target = resolveTarget(rel, spec);
    if (!target) continue;

    const fromDomain = domainOf(rel);
    const toDomain = domainOf(target);

    if (fromDomain && toDomain && fromDomain !== toDomain && !isSharedTarget(target)) {
      violations.push({ from: rel, to: `${toDomain}/`, rule: 'cross-domain' });
    }
    if (/^src\/(hooks|services)\//.test(rel) && /^src\/(components|pages)\//.test(target)) {
      violations.push({ from: rel, to: target.split('/').slice(0, 3).join('/') + '/', rule: 'layer' });
    }
  }
}

const baseline = new Set(
  existsSync(BASELINE_PATH)
    ? readFileSync(BASELINE_PATH, 'utf-8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
    : []
);

const uniq = new Map();
for (const v of violations) if (!uniq.has(edgeKey(v))) uniq.set(edgeKey(v), v);

if (process.argv.includes('--update-baseline')) {
  const lines = [...uniq.keys()].sort();
  writeFileSync(BASELINE_PATH, lines.join('\n') + '\n');
  console.log(`✔ baseline atualizada: ${lines.length} aresta(s) legadas`);
  process.exit(0);
}

const fresh = [...uniq.values()].filter(v => !baseline.has(edgeKey(v)));
const legacy = [...uniq.keys()].filter(k => baseline.has(k));
const stale = [...baseline].filter(k => !uniq.has(k));

if (legacy.length) {
  console.log(`⚠ ${legacy.length} aresta(s) legadas de fronteira (baseline — migrar quando tocar o arquivo)`);
}
if (stale.length) {
  console.log(`ℹ ${stale.length} entrada(s) obsoleta(s) na baseline:`);
  for (const s of stale) console.log(`   • ${s}`);
}

if (fresh.length) {
  console.error(`\n❌ ${fresh.length} aresta(s) NOVA(S) violando fronteira de domínio:`);
  for (const v of fresh) console.error(`   • [${v.rule}] ${v.from} -> ${v.to}`);
  console.error(
    '\nComponentes de domínio não importam outros domínios (use hooks/services/lib compartilhados). ' +
      'Exceção pontual: comentário `// domain-boundary-ok` no arquivo.'
  );
  process.exit(1);
}

console.log(`\n✔ fronteiras OK — ${legacy.length} aresta(s) legadas na baseline, 0 violação nova`);
