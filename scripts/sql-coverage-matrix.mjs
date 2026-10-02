#!/usr/bin/env node
/**
 * Matriz de cobertura das suites SQL (supabase/tests/) sobre as tabelas public.
 *
 * Lê todas as migrations em supabase/migrations/, extrai as tabelas
 * `public.<tabela>` criadas (CREATE TABLE) e cruza com as tabelas referenciadas
 * por cada suite em supabase/tests/*.sql. O resultado é um markdown com:
 *   - contagem de tabelas public vs. tocadas por pelo menos uma suite;
 *   - tabelas sem cobertura (candidatas a novas asserções RLS/contrato);
 *   - suíte × tabela (quais suites tocam cada tabela coberta).
 *
 * É um relatório informativo — nunca reprova. A decisão de fechar brechas é
 * editorial (tabelas legadas/mortas não devem gerar ruído de suite).
 *
 * Uso:
 *   node scripts/sql-coverage-matrix.mjs [--output docs/testes/matrizz-sql.md]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const MIGRATIONS_DIR = join(ROOT, 'supabase/migrations');
const TESTS_DIR = join(ROOT, 'supabase/tests');

const args = process.argv.slice(2);
const outputPath = args.includes('--output')
  ? args[args.indexOf('--output') + 1]
  : null;

const CREATE_TABLE_RE =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi;
const TABLE_REF_RE =
  /\b(?:public\.)?"?([a-z_][a-z0-9_]*)"?\b/g;

// Identificadores que aparecem em SQL mas não são tabelas public.
const NOT_TABLES = new Set([
  'public', 'select', 'insert', 'update', 'delete', 'from', 'where', 'into',
  'values', 'set', 'begin', 'end', 'declare', 'function', 'returns', 'trigger',
  'policy', 'index', 'view', 'sequence', 'role', 'grant', 'revoke', 'schema',
  'extension', 'constraint', 'primary', 'foreign', 'references', 'on', 'and',
  'or', 'not', 'null', 'true', 'false', 'if', 'then', 'else', 'elsif', 'loop',
  'return', 'raise', 'exception', 'perform', 'execute', 'language', 'plpgsql',
  'sql', 'as', 'is', 'in', 'exists', 'case', 'when', 'do', 'anonymous', 'auth',
  'storage', 'pg_catalog', 'information_schema', 'realtime', 'graphql_public',
]);

const publicTables = new Set();
for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
  for (const match of sql.matchAll(CREATE_TABLE_RE)) {
    publicTables.add(match[1].toLowerCase());
  }
}

const suites = [];
for (const file of readdirSync(TESTS_DIR).filter((f) => f.endsWith('.sql')).sort()) {
  const sql = readFileSync(join(TESTS_DIR, file), 'utf8');
  const referenced = new Set();
  for (const match of sql.matchAll(TABLE_REF_RE)) {
    const name = match[1].toLowerCase();
    if (!NOT_TABLES.has(name) && publicTables.has(name)) referenced.add(name);
  }
  suites.push({ file, referenced });
}

const covered = new Set();
for (const suite of suites) {
  for (const t of suite.referenced) covered.add(t);
}
const uncovered = [...publicTables].filter((t) => !covered.has(t)).sort();

const lines = [];
lines.push('# Matriz de cobertura — suites SQL × tabelas public');
lines.push('');
lines.push(
  `Gerado por \`scripts/sql-coverage-matrix.mjs\` em ${new Date().toISOString().slice(0, 10)}.`,
);
lines.push('');
lines.push(`- Tabelas \`public.*\` criadas em migrations: **${publicTables.size}**`);
lines.push(`- Tocadas por ao menos uma suite: **${covered.size}**`);
lines.push(`- Sem nenhuma referência nas suites: **${uncovered.length}**`);
lines.push('');
lines.push('## Cobertura por suite');
lines.push('');
lines.push('| Suite | Tabelas referenciadas |');
lines.push('| --- | ---: |');
for (const s of suites) {
  lines.push(`| \`supabase/tests/${s.file}\` | ${s.referenced.size} |`);
}
lines.push('');
lines.push('## Tabelas sem cobertura (ordem alfabética)');
lines.push('');
for (const t of uncovered) lines.push(`- \`${t}\``);
lines.push('');
lines.push('## Suíte × tabela (apenas tabelas cobertas)');
lines.push('');
lines.push('| Tabela | Suites |');
lines.push('| --- | --- |');
for (const t of [...covered].sort()) {
  const names = suites
    .filter((s) => s.referenced.has(t))
    .map((s) => s.file.replace(/\.sql$/, ''))
    .join('<br>');
  lines.push(`| \`${t}\` | ${names} |`);
}
lines.push('');

const report = lines.join('\n');
if (outputPath) {
  writeFileSync(outputPath, report);
  console.log(`matriz escrita em ${outputPath}`);
}
console.log(
  `[sql-matrix] ${publicTables.size} tabelas public | ${covered.size} cobertas | ${uncovered.length} sem cobertura`,
);
if (uncovered.length) {
  console.warn(
    `::warning::${uncovered.length} tabelas public sem cobertura de suite SQL (lista completa no artefato sql-coverage-matrix.md)`,
  );
  for (const t of uncovered) console.log(`  sem cobertura: ${t}`);
}
