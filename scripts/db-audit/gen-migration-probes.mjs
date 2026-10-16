#!/usr/bin/env node
/**
 * gen-migration-probes.mjs
 *
 * Para cada migration em supabase/migrations/, emite um SELECT de sanidade que
 * pode ser executado no banco para confirmar que a migration foi aplicada
 * corretamente. Útil para auditar drift entre o diretório local e o banco
 * de produção.
 *
 * Uso:
 *   node scripts/db-audit/gen-migration-probes.mjs [--out probes.sql] [--filter <glob>]
 *
 * Saída padrão: SQL comentado com blocos por migration — execute via
 *   psql $DATABASE_URL -f probes.sql
 * ou cole no Supabase SQL Editor.
 *
 * Estratégia de sondas por tipo de statement:
 *   CREATE TABLE        → SELECT COUNT(*) FROM information_schema.tables
 *   CREATE INDEX        → SELECT COUNT(*) FROM pg_indexes
 *   CREATE FUNCTION     → SELECT COUNT(*) FROM pg_proc (by proname)
 *   CREATE POLICY       → SELECT COUNT(*) FROM pg_policies
 *   ALTER TABLE ADD COL → SELECT COUNT(*) FROM information_schema.columns
 *   CREATE TYPE/ENUM    → SELECT COUNT(*) FROM pg_type
 *   INSERT              → (skipped — data probes are too fragile)
 *   DDL não reconhecido → comentário explicativo
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    out: { type: 'string', short: 'o' },
    filter: { type: 'string', short: 'f' },
  },
  allowPositionals: true,
});

const MIGRATIONS_DIR = resolve('supabase/migrations');

function listMigrations(filter) {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  if (!filter) return files;
  // Escape regex metacharacters, then translate glob wildcards
  const escaped = filter.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
  return files.filter((f) => re.test(f));
}

/** Remove SQL comments before running regex patterns to avoid false positives. */
function stripComments(sql) {
  // Block comments /* ... */ (non-greedy)
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Single-line comments --...
  s = s.replace(/--[^\n]*/g, '');
  return s;
}

// Extrai nomes de objetos de statements DDL relevantes
function parseStatements(rawSql) {
  const sql = stripComments(rawSql);
  const probes = [];

  // CREATE TABLE [IF NOT EXISTS] schema.table
  for (const m of sql.matchAll(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)/gi,
  )) {
    const schema = m[1] || 'public';
    const table = m[2];
    probes.push({
      type: 'table',
      sql: `SELECT COUNT(*) AS found FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = '${table}'; -- expect 1`,
      label: `table ${schema}.${table}`,
    });
  }

  // CREATE [UNIQUE] INDEX [CONCURRENTLY] [IF NOT EXISTS] name ON table
  for (const m of sql.matchAll(
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(?:\w+\.)?(\w+)/gi,
  )) {
    const idx = m[1];
    const table = m[2];
    probes.push({
      type: 'index',
      sql: `SELECT COUNT(*) AS found FROM pg_indexes WHERE tablename = '${table}' AND indexname = '${idx}'; -- expect 1`,
      label: `index ${idx} on ${table}`,
    });
  }

  // CREATE [OR REPLACE] FUNCTION [schema.]name
  for (const m of sql.matchAll(
    /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(\w+)\.)?(\w+)\s*\(/gi,
  )) {
    const schema = m[1] || 'public';
    const fn = m[2];
    probes.push({
      type: 'function',
      sql: `SELECT COUNT(*) AS found FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = '${schema}' AND p.proname = '${fn}'; -- expect >= 1`,
      label: `function ${schema}.${fn}`,
    });
  }

  // CREATE POLICY name ON table — handles quoted names with spaces
  for (const m of sql.matchAll(
    /CREATE\s+POLICY\s+(?:"([^"]+)"|(\w+))\s+ON\s+(?:(\w+)\.)?(\w+)/gi,
  )) {
    const policy = m[1] ?? m[2]; // quoted name (m[1]) or bare identifier (m[2])
    const schema = m[3] || 'public';
    const table = m[4];
    probes.push({
      type: 'policy',
      sql: `SELECT COUNT(*) AS found FROM pg_policies WHERE schemaname = '${schema}' AND tablename = '${table}' AND policyname = '${policy}'; -- expect 1`,
      label: `policy ${policy} on ${schema}.${table}`,
    });
  }

  // ALTER TABLE [schema.]table ... ADD COLUMN [IF NOT EXISTS] col
  // Two-phase: capture entire statement, then iterate all ADD COLUMN within it
  for (const stmt of sql.matchAll(
    /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)(\s[^;]+;)/gi,
  )) {
    const body = stmt[3];
    if (!/ADD\s+COLUMN/i.test(body)) continue;
    const schema = stmt[1] || 'public';
    const table = stmt[2];
    for (const c of body.matchAll(
      /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi,
    )) {
      probes.push({
        type: 'column',
        sql: `SELECT COUNT(*) AS found FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}' AND column_name = '${c[1]}'; -- expect 1`,
        label: `column ${schema}.${table}.${c[1]}`,
      });
    }
  }

  // CREATE TYPE [schema.]name AS ENUM
  for (const m of sql.matchAll(
    /CREATE\s+TYPE\s+(?:(\w+)\.)?(\w+)\s+AS\s+ENUM/gi,
  )) {
    const schema = m[1] || 'public';
    const typ = m[2];
    probes.push({
      type: 'enum',
      sql: `SELECT COUNT(*) AS found FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = '${schema}' AND t.typname = '${typ}' AND t.typtype = 'e'; -- expect 1`,
      label: `enum ${schema}.${typ}`,
    });
  }

  return probes;
}

function buildOutput(files) {
  const lines = [
    '-- Migration probes generated by gen-migration-probes.mjs',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Migrations scanned: ${files.length}`,
    '--',
    '-- Run: psql $DATABASE_URL -f probes.sql',
    '-- Each SELECT should return `found = 1` (or >= 1 for functions/overloads).',
    '',
  ];

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const probes = parseStatements(sql);

    lines.push(`-- ============================================================`);
    lines.push(`-- ${file}`);
    lines.push(`-- ============================================================`);

    if (probes.length === 0) {
      lines.push(`-- (no structural DDL probes generated for this migration)`);
    } else {
      for (const p of probes) {
        lines.push(`-- ${p.label}`);
        lines.push(p.sql);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

const files = listMigrations(args.filter);
const output = buildOutput(files);

if (args.out) {
  writeFileSync(args.out, output, 'utf8');
  console.log(`Wrote ${args.out} (${files.length} migrations)`);
} else {
  process.stdout.write(output);
}
