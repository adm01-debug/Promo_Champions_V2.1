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
 *   CREATE INDEX        → SELECT COUNT(*) FROM pg_indexes (com schemaname)
 *   CREATE FUNCTION     → SELECT COUNT(*) FROM pg_proc (by proname)
 *   CREATE POLICY       → SELECT COUNT(*) FROM pg_policies (com cmd)
 *   ALTER TABLE ADD COL → SELECT COUNT(*) FROM information_schema.columns
 *   CREATE TYPE/ENUM    → SELECT COUNT(*) FROM pg_type
 *   INSERT              → (skipped — data probes are too fragile)
 *   DDL não reconhecido → comentário explicativo
 *
 * Objetos removidos por DROP TABLE/FUNCTION/POLICY/TYPE/INDEX em qualquer
 * migration são suprimidos das sondas para evitar falsos positivos garantidos.
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

/**
 * First pass over ALL migration files to collect objects that are explicitly
 * DROPped so probes for those objects can be suppressed. A CREATE in an earlier
 * migration + DROP in a later one would otherwise produce guaranteed false
 * positives when running probes against production.
 */
function collectDroppedObjects(files) {
  const tables = new Set();
  const functions = new Set();
  const policies = new Set();
  const types = new Set();
  const indexes = new Set();

  for (const file of files) {
    const sql = stripComments(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'));

    for (const m of sql.matchAll(
      /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)/gi,
    )) {
      tables.add(`${m[1] || 'public'}.${m[2]}`);
    }
    for (const m of sql.matchAll(
      /DROP\s+FUNCTION\s+(?:IF\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)/gi,
    )) {
      functions.add(`${m[1] || 'public'}.${m[2]}`);
    }
    for (const m of sql.matchAll(
      /DROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?(?:"([^"]+)"|(\w+))\s+ON\s+(?:(\w+)\.)?(\w+)/gi,
    )) {
      const policy = m[1] ?? m[2];
      const schema = m[3] || 'public';
      policies.add(`${schema}.${m[4]}.${policy}`);
    }
    for (const m of sql.matchAll(
      /DROP\s+TYPE\s+(?:IF\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)/gi,
    )) {
      types.add(`${m[1] || 'public'}.${m[2]}`);
    }
    // Index names are unique within a schema; capture bare name for pg_indexes lookup
    for (const m of sql.matchAll(
      /DROP\s+INDEX\s+(?:IF\s+EXISTS\s+)?(?:CONCURRENTLY\s+)?(?:\w+\.)?(\w+)/gi,
    )) {
      indexes.add(m[1]);
    }
  }

  return { tables, functions, policies, types, indexes };
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
      key: `${schema}.${table}`,
      sql: `SELECT COUNT(*) AS found FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = '${table}'; -- expect 1`,
      label: `table ${schema}.${table}`,
    });
  }

  // CREATE [UNIQUE] INDEX [CONCURRENTLY] [IF NOT EXISTS] name ON [schema.]table
  // Captures schema from ON clause to include schemaname filter in probe.
  for (const m of sql.matchAll(
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(?:(\w+)\.)?(\w+)/gi,
  )) {
    const idx = m[1];
    const schema = m[2] || 'public';
    const table = m[3];
    probes.push({
      type: 'index',
      key: idx,
      sql: `SELECT COUNT(*) AS found FROM pg_indexes WHERE schemaname = '${schema}' AND tablename = '${table}' AND indexname = '${idx}'; -- expect 1`,
      label: `index ${idx} on ${schema}.${table}`,
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
      key: `${schema}.${fn}`,
      sql: `SELECT COUNT(*) AS found FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = '${schema}' AND p.proname = '${fn}'; -- expect >= 1`,
      label: `function ${schema}.${fn}`,
    });
  }

  // CREATE POLICY name ON [schema.]table — handles quoted names, also captures
  // the FOR clause (cmd) so the probe detects a same-name policy with different
  // semantics (e.g. SELECT replaced by INSERT).
  for (const m of sql.matchAll(
    /CREATE\s+POLICY\s+(?:"([^"]+)"|(\w+))\s+ON\s+(?:(\w+)\.)?(\w+)([^;]*);/gi,
  )) {
    const policy = m[1] ?? m[2]; // quoted name (m[1]) or bare identifier (m[2])
    const schema = m[3] || 'public';
    const table = m[4];
    const rest = m[5] || '';
    // Extract FOR clause; PostgreSQL defaults to ALL when the clause is omitted.
    const cmdMatch = rest.match(/\bFOR\s+(ALL|SELECT|INSERT|UPDATE|DELETE)\b/i);
    const cmd = cmdMatch ? cmdMatch[1].toUpperCase() : 'ALL';
    probes.push({
      type: 'policy',
      key: `${schema}.${table}.${policy}`,
      sql: `SELECT COUNT(*) AS found FROM pg_policies WHERE schemaname = '${schema}' AND tablename = '${table}' AND policyname = '${policy}' AND cmd = '${cmd}'; -- expect 1`,
      label: `policy ${policy} on ${schema}.${table} (${cmd})`,
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
        key: `${schema}.${table}.${c[1]}`,
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
      key: `${schema}.${typ}`,
      sql: `SELECT COUNT(*) AS found FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = '${schema}' AND t.typname = '${typ}' AND t.typtype = 'e'; -- expect 1`,
      label: `enum ${schema}.${typ}`,
    });
  }

  return probes;
}

function buildOutput(files) {
  // First pass: collect all DROPped objects across all migrations to suppress
  // probes for objects that no longer exist in production.
  const dropped = collectDroppedObjects(files);

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

    // Suppress probes for objects explicitly DROPped in any migration to avoid
    // guaranteed false positives (object created in A then dropped in B).
    const filtered = probes.filter((p) => {
      switch (p.type) {
        case 'table':    return !dropped.tables.has(p.key);
        case 'function': return !dropped.functions.has(p.key);
        case 'policy':   return !dropped.policies.has(p.key);
        case 'enum':     return !dropped.types.has(p.key);
        case 'index':    return !dropped.indexes.has(p.key);
        default:         return true;
      }
    });

    lines.push(`-- ============================================================`);
    lines.push(`-- ${file}`);
    lines.push(`-- ============================================================`);

    if (filtered.length === 0) {
      lines.push(`-- (no structural DDL probes generated for this migration)`);
    } else {
      for (const p of filtered) {
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
