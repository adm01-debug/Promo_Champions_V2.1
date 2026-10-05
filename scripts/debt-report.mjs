#!/usr/bin/env node
/**
 * Quadro consolidado de débito técnico.
 *
 * Agrega os ratchets/budgets existentes num relatório único (markdown):
 *  - lint:complexity — warnings de complexidade>20 e max-lines>600 vs teto 126
 *  - coverage-baseline.json — piso de cobertura vitest (etapa 32)
 *  - eslint-disable — total e breakdown por regra em src/
 *  - react-hooks/exhaustive-deps — disables pendentes
 *  - casts `as unknown as` — src/ e supabase/functions
 *  - request-id allowlist — edge functions isentas do lint de request-id
 *  - bundle budgets — budgets gzip por chunk (scripts/check-bundle-budget.mjs)
 *
 * Uso:
 *   node scripts/debt-report.mjs            # relatório completo
 *   node scripts/debt-report.mjs --quick    # pula o eslint (mais rápido)
 *   node scripts/debt-report.mjs --json     # saída JSON em vez de markdown
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const QUICK = process.argv.includes('--quick');
const JSON_OUT = process.argv.includes('--json');

const COMPLEXITY_BUDGET = 126;

function grepCount(pattern, dir, glob) {
  try {
    const out = execSync(
      `grep -rEn ${JSON.stringify(pattern)} ${JSON.stringify(dir)} ${glob ? `--include=${JSON.stringify(glob)}` : ''} | wc -l`,
      { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return Number(out.trim());
  } catch {
    return 0;
  }
}

function countByRule(rule) {
  try {
    const out = execSync(
      `grep -rn ${JSON.stringify(rule)} ${JSON.stringify(join(ROOT, 'src'))} | grep -c 'eslint-disable'`,
      { cwd: ROOT, encoding: 'utf-8' }
    );
    return Number(out.trim());
  } catch {
    return 0;
  }
}

function runComplexityLint() {
  try {
    const out = execSync(
      `npx eslint . --format json --report-unused-disable-directives ` +
        `--rule 'complexity: [warn, 20]' ` +
        `--rule 'max-lines: [warn, { max: 600, skipBlankLines: true, skipComments: true }]'`,
      { cwd: ROOT, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return JSON.parse(out);
  } catch (err) {
    // eslint sai !=0 quando há erros; stdout ainda tem o JSON
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function summarizeComplexity(results) {
  const fileWarnings = [];
  for (const f of results ?? []) {
    const w = (f.messages ?? []).filter(
      m => m.ruleId === 'complexity' || m.ruleId === 'max-lines'
    );
    if (w.length > 0) {
      fileWarnings.push({
        file: f.filePath.replace(`${ROOT}/`, ''),
        warnings: w.length,
      });
    }
  }
  fileWarnings.sort((a, b) => b.warnings - a.warnings);
  return {
    total: fileWarnings.reduce((acc, f) => acc + f.warnings, 0),
    files: fileWarnings.length,
    worst: fileWarnings.slice(0, 5),
  };
}

function eslintDisableBreakdown() {
  try {
    const out = execSync(
      `grep -rhoE 'eslint-disable.*' ${JSON.stringify(join(ROOT, 'src'))}`,
      { cwd: ROOT, encoding: 'utf-8' }
    );
    const counts = new Map();
    for (const line of out.split('\n')) {
      const rulesPart = line
        .replace(/.*eslint-disable(-next-line|-line)?/, '')
        .replace(/\*\//, '')
        .split('--')[0]
        .trim();
      const rules = rulesPart
        .split(',')
        .map(r => r.trim())
        .filter(r => /^[\w\-/]+/.test(r))
        .map(r => r.split(/\s/)[0]);
      for (const r of rules) counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

function readCoverageBaseline() {
  const p = join(ROOT, 'coverage-baseline.json');
  if (!existsSync(p)) return null;
  const b = JSON.parse(readFileSync(p, 'utf-8'));
  return { lines: b.lines, branches: b.branches, functions: b.functions, statements: b.statements };
}

function countLines(p) {
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf-8').split('\n').filter(l => l.trim()).length;
}

function countEdgeFunctions() {
  const dir = join(ROOT, 'supabase', 'functions');
  if (!existsSync(dir)) return null;
  return readdirSync(dir, { withFileTypes: true }).filter(
    d => d.isDirectory() && !d.name.startsWith('_')
  ).length;
}

const report = {
  generatedAt: new Date().toISOString(),
  items: [],
};

const coverage = readCoverageBaseline();
report.items.push({
  id: 'coverage-baseline',
  titulo: 'Piso de cobertura de testes (ratchet etapa 32)',
  atual: coverage
    ? `linhas ${coverage.lines}% · branches ${coverage.branches}% · funções ${coverage.functions}%`
    : 'baseline ausente',
  teto: 'só pode subir',
  origem: 'coverage-baseline.json',
  notas: 'Atualizado por `npm run coverage:baseline:update`.',
});

const complexity = QUICK ? null : summarizeComplexity(runComplexityLint());
report.items.push({
  id: 'lint-complexity',
  titulo: 'Complexidade ciclomática > 20 e arquivos > 600 linhas',
  atual: complexity
    ? `${complexity.total} warnings em ${complexity.files} arquivos`
    : 'não medido (--quick)',
  teto: `${COMPLEXITY_BUDGET} warnings (npm run lint:complexity)`,
  origem: 'package.json → lint:complexity',
  notas: complexity?.worst?.length
    ? `Piores: ${complexity.worst.map(w => `${w.file} (${w.warnings})`).join(', ')}`
    : undefined,
});

report.items.push({
  id: 'eslint-disables',
  titulo: 'Diretivas eslint-disable em src/',
  atual: `${grepCount('eslint-disable', join(ROOT, 'src'))} diretivas`,
  teto: 'ratchet manual — reduzir, nunca aumentar',
  origem: 'grep src/',
  notas: 'Breakdown por regra abaixo.',
});

const exhaustiveDeps = countByRule('react-hooks/exhaustive-deps');
report.items.push({
  id: 'exhaustive-deps',
  titulo: 'eslint-disable de exhaustive-deps (deps suspensas)',
  atual: `${exhaustiveDeps} diretivas`,
  teto: '0 — corrigir com useCallback/ref ou justificar',
  origem: 'grep src/',
  notas: 'Cada disable remanescente carrega comentário explicando o padrão.',
});

const unknownSrc = grepCount('as unknown as', join(ROOT, 'src'));
const unknownFns = grepCount('as unknown as', join(ROOT, 'supabase', 'functions'));
report.items.push({
  id: 'as-unknown',
  titulo: 'Cast duplo `as unknown as` (tipagem contornada)',
  atual: `${unknownSrc} em src/ + ${unknownFns} em supabase/functions`,
  teto: '0 — substituir por tipos corretos',
  origem: 'grep',
  notas: 'Majoritariamente em respostas de RPC/tabelas do Supabase.',
});

const allowlist = countLines(join(ROOT, 'scripts', 'request-id-lint-allowlist.txt'));
report.items.push({
  id: 'request-id-allowlist',
  titulo: 'Edge functions isentas do lint de request-id',
  atual: allowlist !== null ? `${allowlist} funções` : 'allowlist ausente',
  teto: '0 — toda função pública propaga x-request-id',
  origem: 'scripts/request-id-lint-allowlist.txt',
});

const fns = countEdgeFunctions();
report.items.push({
  id: 'edge-functions',
  titulo: 'Edge functions implantadas (deno check/lint por função)',
  atual: fns !== null ? `${fns} funções` : 'diretório ausente',
  teto: 'typecheck zero erros por função tocada',
  origem: 'supabase/functions/',
  notas: 'ci: edge-functions-bundle.yml roda deno check via scripts/bundle-edge-functions.ts.',
});

report.items.push({
  id: 'bundle-budget',
  titulo: 'Budget de bundle por chunk (gzip)',
  atual: 'budgets definidos por chunk vendor',
  teto: 'ver BUDGETS_KB em scripts/check-bundle-budget.mjs',
  origem: 'scripts/check-bundle-budget.mjs',
  notas: 'Rodar ANALYZE_BUNDLE=1 npm run build && node scripts/check-bundle-budget.mjs.',
});

const breakdown = eslintDisableBreakdown();

if (JSON_OUT) {
  console.log(JSON.stringify({ ...report, eslintDisableBreakdown: breakdown }, null, 2));
  process.exit(0);
}

console.log(`\n# Quadro de débito técnico — ${report.generatedAt.slice(0, 10)}\n`);
console.log('| Item | Atual | Teto/orçamento | Fonte |');
console.log('| --- | --- | --- | --- |');
for (const i of report.items) {
  console.log(`| ${i.titulo} | ${i.atual} | ${i.teto} | ${i.origem} |`);
}
console.log('\n## eslint-disable por regra (top 10)\n');
for (const r of breakdown.slice(0, 10)) {
  console.log(`- \`${r.rule}\`: ${r.count}`);
}
console.log('\nDetalhes e responsáveis: docs/TECH_DEBT.md\n');
