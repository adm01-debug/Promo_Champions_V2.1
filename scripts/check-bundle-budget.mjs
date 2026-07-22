#!/usr/bin/env node
/**
 * Onda O — Bundle-size budget guard.
 *
 * Executa após `ANALYZE_BUNDLE=1 vite build` e valida cada chunk contra
 * um teto em KB gzip. Sai com código != 0 se qualquer chunk exceder o
 * budget, quebrando o CI antes que uma regressão de peso vá a produção.
 *
 * Rodar localmente:
 *   ANALYZE_BUNDLE=1 npm run build && node scripts/check-bundle-budget.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

// Teto em KB gzip por chunk. Baseline medido em 2026-07-22 + ~15% de margem
// para absorver crescimento orgânico sem esconder regressões reais.
const BUDGETS_KB = {
  'vendor-core': 165,      // React + Radix + router (baseline 139)
  'vendor-data': 70,       // supabase-js + react-query (baseline 54)
  'vendor-charts': 130,    // recharts + d3 (baseline 109)
  'vendor-motion': 60,     // framer-motion
  'vendor-pdf': 210,       // jspdf + html-to-image (baseline 174)
  'vendor-excel': 400,     // exceljs (lazy)
  'vendor-maps': 65,       // leaflet (baseline 53)
  'vendor-flow': 50,       // @xyflow (baseline 40)
  'vendor-dnd': 40,
  'vendor-date': 40,
  'vendor-icons': 35,      // lucide-react (baseline 25)
  'vendor-forms': 40,
  'vendor-markdown': 80,
  'vendor-data-utils': 40,
  'vendor-confetti': 20,
  'vendor-ui-extras': 60,
  'vendor-ui-utils': 30,
  'vendor-platform': 20,
  'vendor': 190,           // catch-all (baseline 163)
  // Entry principal (não-vendor)
  '__entry__': 90,
};

const DIST_ASSETS = join(process.cwd(), 'dist', 'assets');
if (!existsSync(DIST_ASSETS)) {
  console.error(`❌ dist/assets não encontrado. Rode: ANALYZE_BUNDLE=1 npm run build`);
  process.exit(1);
}

const files = readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.js'));
if (files.length === 0) {
  console.error(`❌ Nenhum .js em dist/assets`);
  process.exit(1);
}

function gzipKB(path) {
  const buf = readFileSync(path);
  return gzipSync(buf, { level: 9 }).length / 1024;
}

function bucketFor(file) {
  const base = file.replace(/-[A-Za-z0-9_-]{6,}\.js$/, '');
  if (BUDGETS_KB[base] !== undefined) return base;
  // entry chunk (e.g. index-abc123.js)
  if (/^index-/.test(file) || /^main-/.test(file)) return '__entry__';
  return null;
}

const results = [];
for (const f of files) {
  const full = join(DIST_ASSETS, f);
  const sizeKB = gzipKB(full);
  const bucket = bucketFor(f);
  const budget = bucket ? BUDGETS_KB[bucket] : null;
  results.push({ file: f, sizeKB, bucket, budget });
}

results.sort((a, b) => b.sizeKB - a.sizeKB);

const failures = [];
console.log('\n📦 Bundle Budget Report (gzip KB)\n');
console.log('  chunk                                       size    budget   status');
console.log('  ' + '-'.repeat(72));
for (const r of results) {
  const size = r.sizeKB.toFixed(1).padStart(6);
  const budget = r.budget ? String(r.budget).padStart(6) : '   n/a';
  const status = r.budget == null
    ? '⚪ untracked'
    : r.sizeKB > r.budget ? '❌ OVER' : '✅ ok';
  console.log(`  ${r.file.padEnd(44)} ${size}  ${budget}   ${status}`);
  if (r.budget != null && r.sizeKB > r.budget) {
    failures.push(`${r.file} (${r.sizeKB.toFixed(1)} KB > ${r.budget} KB)`);
  }
}

const total = results.reduce((s, r) => s + r.sizeKB, 0);
console.log(`\n  TOTAL: ${total.toFixed(1)} KB gzip across ${results.length} chunks\n`);

if (failures.length > 0) {
  console.error(`❌ ${failures.length} chunk(s) excederam o budget:`);
  for (const f of failures) console.error(`   • ${f}`);
  console.error(`\nAjuste os imports (lazy load, tree-shake) ou revise o budget em scripts/check-bundle-budget.mjs.`);
  process.exit(1);
}
console.log('✅ Todos os chunks dentro do budget.');
