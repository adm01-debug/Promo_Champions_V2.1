#!/usr/bin/env node
// Gera SQL de sondagem (read-only) que verifica, para cada migration em um
// intervalo de versões, se os objetos que ela cria existem em produção.
// Cobre: function, table, view, matview, trigger, cron, policy, index,
// constraint, column, extension, type.
//
// Uso: node scripts/db-audit/gen-migration-probes.mjs [since_version]
// Saída: SQL em stdout — alimentar em psql -At (pipe-separated).

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIG_DIR = 'supabase/migrations';
const since = process.argv[2] ?? '20260901000000';

// Identificador com aspas duplas pode conter "" (escape SQL) — "[^"]+"
// truncava no primeiro fecha-aspas interno e sondava o nome errado.
const ID = String.raw`[a-zA-Z_][a-zA-Z0-9_]*|"(?:[^"]|"")*"`;
// Qualquer schema — whitelist anterior perdia objetos reais (ex.: ON realtime.messages
// casava "realtime" como nome da tabela e a probe sondava a combinação errada).
const SCH = String.raw`(?:(${ID})\.)?`;

const PATTERNS = [
  // Captura a lista de argumentos: duas sobrecargas com nomes iguais e
  // assinaturas diferentes não devem validar uma à outra (pronargs).
  ['function', new RegExp(String.raw`create\s+(?:or\s+replace\s+)?function\s+${SCH}(${ID})\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)`, 'gi'), 'fn'],
  ['table',    new RegExp(String.raw`create\s+table\s+(?:if\s+not\s+exists\s+)?${SCH}(${ID})`, 'gi'), 'tbl'],
  ['view',     new RegExp(String.raw`create\s+(?:or\s+replace\s+)?view\s+${SCH}(${ID})`, 'gi'), 'view'],
  ['matview',  new RegExp(String.raw`create\s+materialized\s+view\s+(?:if\s+not\s+exists\s+)?${SCH}(${ID})`, 'gi'), 'mv'],
  // Trigger: captura também a tabela do ON — o mesmo tgname pode existir em
  // tabelas diferentes, então sondar só o nome produziria falso-positivo.
  ['trigger',  new RegExp(String.raw`create\s+(?:or\s+replace\s+)?(?:constraint\s+)?trigger\s+(${ID})[^;]*?\bon\s+${SCH}(${ID})`, 'gi'), 'trg'],
  ['cron',     /cron\.schedule\s*\(\s*'([^']+)'/gi, 'cron'],
  ['policy',   new RegExp(String.raw`create\s+policy\s+(${ID})\s+on\s+${SCH}(${ID})`, 'gi'), 'pol'],
  // Índice: captura a tabela do ON para a probe casar schemaname+tablename
  // (índices de mesmo nome em tabelas/schemas diferentes não colidem).
  ['index',    new RegExp(String.raw`create\s+(?:unique\s+)?index\s+(?:concurrently\s+)?(?:if\s+not\s+exists\s+)?(${ID})[^;]*?\bon\s+(?:only\s+)?(?:(${ID})\.)?(${ID})`, 'gi'), 'idx'],
  ['constraint', new RegExp(String.raw`alter\s+table\s+(?:only\s+)?${SCH}(${ID})\s+add\s+constraint\s+(${ID})`, 'gi'), 'con'],
  // Forma `ALTER TABLE t DROP CONSTRAINT a, ADD CONSTRAINT b` — o ADD não vem
  // colado no nome da tabela, então o pattern acima não o vê.
  ['constraint', new RegExp(String.raw`,\s*add\s+constraint\s+(${ID})`, 'gi'), 'con'],
  ['column',   new RegExp(String.raw`alter\s+table\s+(?:only\s+)?${SCH}(${ID})\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(${ID})`, 'gi'), 'col'],
  // Forma `ALTER TABLE t ADD COLUMN a ..., ADD COLUMN b ...` — a segunda
  // coluna não vem colada no ALTER e era perdida.
  ['column',   new RegExp(String.raw`,\s*add\s+column\s+(?:if\s+not\s+exists\s+)?(${ID})`, 'gi'), 'col'],
  ['extension', /create\s+extension\s+(?:if\s+not\s+exists\s+)?"([^"]+)"|create\s+extension\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/gi, 'ext'],
  ['type',     new RegExp(String.raw`create\s+type\s+${SCH}(${ID})\s+as`, 'gi'), 'type'],
];

// Desfaz aspas de borda e o escape "" → " dentro de identificadores
// double-quoted (sem isso, "a""b" sondaria o nome errado).
const strip = (s) =>
  s == null ? s : s.replace(/^"|"$/g, '').replace(/""/g, '"');

// Conta argumentos top-level de uma lista de parâmetros (vírgulas fora de
// parênteses). Se o parse não for confiável retorna null e a probe não
// compara aridade — falso-positivo é melhor que falso-negativo aqui.
const countArgs = (args) => {
  if (args == null) return null;
  const trimmed = args.trim();
  if (trimmed === '') return 0;
  let depth = 0;
  let count = 1;
  for (const ch of trimmed) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) count++;
    if (depth < 0) return null;
  }
  return depth === 0 ? count : null;
};

// Remove comentários SQL antes dos regex — senão DDL comentada
// (`-- CREATE TABLE x`, `/* CREATE FUNCTION y */`) gera probes falsas.
// Limitação aceita: `--` dentro de string literal também é removido
// (raríssimo em DDL de migrations).
const stripComments = (sql) =>
  sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((line) => {
      const i = line.indexOf('--');
      return i === -1 ? line : line.slice(0, i);
    })
    .join('\n');

const files = readdirSync(MIG_DIR)
  .filter((f) => /^\d{8,14}_.*\.sql$/.test(f) && f.split('_')[0] >= since)
  .sort();

const rows = [];
const seen = new Set();
const unprobeable = [];

for (const f of files) {
  const version = f.split('_')[0];
  const sql = stripComments(readFileSync(join(MIG_DIR, f), 'utf8'));
  let found = 0;
  for (const [kind, re] of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(sql))) {
      const groups = m.slice(1).map(strip);
      let schema, obj, extra;
      if (kind === 'policy') {
        obj = groups[0]; schema = groups[1] ?? 'public'; extra = groups[2];
      } else if (kind === 'constraint' || kind === 'column') {
        // Dois shapes: ALTER TABLE t ADD CONSTRAINT c → (schema, tabela, obj)
        // e ", ADD CONSTRAINT c" → (obj) sem tabela.
        if (groups[2] !== undefined) {
          schema = groups[0] ?? 'public'; extra = groups[1]; obj = groups[2];
        } else {
          schema = 'public'; extra = ''; obj = groups[0];
        }
      } else if (kind === 'trigger') {
        obj = groups[0]; schema = groups[1] ?? 'public'; extra = groups[2];
      } else if (kind === 'extension') {
        schema = ''; obj = groups[0] ?? groups[1];
      } else if (kind === 'cron') {
        schema = ''; obj = groups[0];
      } else if (kind === 'index') {
        obj = groups[0]; schema = groups[1] ?? 'public'; extra = groups[2];
      } else if (kind === 'function') {
        // groups[2] = lista de args — vira contagem para comparar pronargs.
        schema = groups[0] ?? 'public'; obj = groups[1];
        const argc = countArgs(groups[2]);
        extra = argc === null ? '' : String(argc);
      } else {
        schema = groups[0] ?? 'public'; obj = groups[1];
      }
      if (!obj) continue;
      const key = `${version}|${kind}|${schema}|${obj}|${extra ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ version, kind, schema, obj, extra, file: f });
      found++;
    }
  }
  if (!found) unprobeable.push(f);
}

const lit = (s) => `'${String(s).replaceAll("'", "''")}'`;

const values = rows
  .map((r) => `  (${lit(r.version)}, ${lit(r.kind)}, ${lit(r.schema)}, ${lit(r.obj)}, ${lit(r.extra ?? '')})`)
  .join(',\n');

const out = `\\pset footer off
-- cron.job só existe com pg_cron instalado — referência estática a ela
-- quebra o parse do SELECT inteiro (CASE não ajuda, o parser resolve a
-- relação em todos os ramos). pg_temp + EXECUTE dinâmico avalia em runtime.
CREATE OR REPLACE FUNCTION pg_temp.probe_cron(job text) RETURNS text AS $probe$
DECLARE r boolean;
BEGIN
  IF to_regclass('cron.job') IS NULL THEN RETURN 'n/a(no pg_cron)'; END IF;
  EXECUTE 'SELECT EXISTS(SELECT 1 FROM cron.job WHERE jobname=$1)'
    INTO r USING job;
  RETURN r::text;
END;
$probe$ LANGUAGE plpgsql;

WITH probes(version, kind, schema, obj, aux) AS (VALUES
${values || '  (NULL, NULL, NULL, NULL, NULL)'}
)
SELECT version || '|' || kind || '|' ||
       CASE WHEN kind = 'column' THEN coalesce(nullif(schema,'') || '.', '') || aux || '.' || obj
            WHEN aux <> '' THEN coalesce(nullif(schema,'') || '.', '') || obj || '@' || aux
            ELSE coalesce(nullif(schema,'') || '.', '') || obj END ||
       '|' ||
       CASE kind
         WHEN 'function'   THEN EXISTS(SELECT 1 FROM pg_proc pr JOIN pg_namespace n ON n.oid=pr.pronamespace WHERE n.nspname=probes.schema AND pr.proname=probes.obj AND (probes.aux='' OR pr.pronargs=probes.aux::int))::text
         WHEN 'table'      THEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=probes.schema AND table_name=probes.obj)::text
         WHEN 'view'       THEN EXISTS(SELECT 1 FROM information_schema.views WHERE table_schema=probes.schema AND table_name=probes.obj)::text
         WHEN 'matview'    THEN EXISTS(SELECT 1 FROM pg_matviews WHERE schemaname=probes.schema AND matviewname=probes.obj)::text
         WHEN 'trigger'    THEN EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE t.tgname=probes.obj AND c.relname=probes.aux AND n.nspname=probes.schema AND NOT t.tgisinternal)::text
         WHEN 'cron'       THEN pg_temp.probe_cron(probes.obj)
         WHEN 'policy'     THEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname=probes.schema AND policyname=probes.obj AND tablename=probes.aux)::text
         WHEN 'index'      THEN EXISTS(SELECT 1 FROM pg_indexes WHERE indexname=probes.obj AND schemaname=probes.schema AND tablename=probes.aux)::text
         WHEN 'constraint' THEN EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid JOIN pg_namespace n ON n.oid=r.relnamespace WHERE c.conname=probes.obj AND (probes.aux='' OR (r.relname=probes.aux AND n.nspname=probes.schema)))::text
         WHEN 'column'     THEN EXISTS(SELECT 1 FROM information_schema.columns WHERE (probes.aux='' OR (table_schema=probes.schema AND table_name=probes.aux)) AND column_name=probes.obj)::text
         WHEN 'extension'  THEN EXISTS(SELECT 1 FROM pg_extension WHERE extname=probes.obj)::text
         WHEN 'type'       THEN EXISTS(SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=probes.schema AND t.typname=probes.obj)::text
         ELSE 'unknown'
       END AS status
FROM probes
WHERE version IS NOT NULL
ORDER BY version, kind, obj;
`;

console.log(out);

console.error(`\n-- ${files.length} migrations no intervalo (>= ${since})`);
console.error(`-- ${rows.length} probes geradas`);
if (unprobeable.length) {
  console.error(`-- ${unprobeable.length} migrations SEM objeto sondável (revisão manual):`);
  for (const f of unprobeable) console.error(`--   ${f}`);
}
