#!/usr/bin/env node
/**
 * Gera docs/DATA_DICTIONARY.md e docs/ER.md a partir das migrations
 * (supabase/migrations/*.sql), aplicadas em ordem lexicográfica.
 *
 * Uso: node scripts/gen-data-dict.mjs
 *
 * Limitações (heurística estática):
 * - Guards `IF EXISTS`/`to_regclass`/blocos `DO $$ ... EXECUTE '...'` não são
 *   avaliados — o dicionário reflete o ÚLTIMO estado declarado nas migrations,
 *   não necessariamente o banco em produção.
 * - DDL dinâmico dentro de EXECUTE '...' não é parseado.
 * Confirme no banco (information_schema) antes de decisões críticas.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const MIG_DIR = join(ROOT, 'supabase', 'migrations');
const OUT_DICT = join(ROOT, 'docs', 'DATA_DICTIONARY.md');
const OUT_ER = join(ROOT, 'docs', 'ER.md');

const files = readdirSync(MIG_DIR).filter(f => f.endsWith('.sql')).sort();

/** tables: Map<name, Table> */
const tables = new Map();
const norm = n => n.replace(/^public\./, '').replace(/"/g, '').toLowerCase();

function getTable(name, create = true) {
  const k = norm(name);
  if (!tables.has(k) && create) {
    tables.set(k, { name: k, cols: new Map(), comment: null, rls: null, policies: new Set(), fks: [], pks: new Set() });
  }
  return tables.get(k);
}

/** divide o corpo de um CREATE TABLE em segmentos de nível 0 */
function splitTopLevel(body) {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** acha o fechamento de parêntese balanceado a partir de idx (aponta para '(') */
function matchParen(sql, idx) {
  let depth = 0;
  for (let i = idx; i < sql.length; i++) {
    if (sql[i] === '(') depth++;
    if (sql[i] === ')') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

const TYPE_STOP = /\b(not|null|default|primary|unique|references|check|collate|constraint|generated)\b/i;

function parseColumn(seg, t) {
  const s = seg.trim().replace(/^--[^\n]*/gm, '').trim();
  const first = s.match(/^("?)([a-zA-Z_]\w*)\1\s+(.*)$/s);
  if (!first) return;
  if (/^(constraint|primary|foreign|unique|check|exclude|like)$/i.test(first[2])) {
    parseTableConstraint(s, t);
    return;
  }
  const colName = first[2].toLowerCase();
  const rest = first[3];
  const typeM = rest.split(TYPE_STOP)[0].trim() || rest.trim();
  const col = {
    type: typeM.replace(/\s+/g, ' '),
    notNull: /NOT\s+NULL/i.test(rest) || /PRIMARY\s+KEY/i.test(rest),
    default: (rest.match(/DEFAULT\s+((?:[^,\s]|\([^)]*\)|'[^']*')+)/i) || [])[1]?.replace(/\s+/g, ' ') ?? null,
    pk: /PRIMARY\s+KEY/i.test(rest),
    uk: /UNIQUE/i.test(rest),
    comment: null,
  };
  const ref = rest.match(/REFERENCES\s+("?(?:\w+\.)?\w+"?)\s*\(([^)]*)\)/i);
  if (ref) {
    col.fk = { table: norm(ref[1]), cols: ref[2].trim() };
    t.fks.push({ cols: [colName], ref: norm(ref[1]), refCols: ref[2].trim(), onDelete: (rest.match(/ON\s+DELETE\s+(\w+)/i) || [])[1] ?? null });
  }
  if (col.pk) t.pks.add(colName);
  t.cols.set(colName, col);
}

function parseTableConstraint(seg, t) {
  const pk = seg.match(/PRIMARY\s+KEY\s*\(([^)]*)\)/i);
  if (pk) for (const c of pk[1].split(',')) {
    const cn = c.trim().replace(/"/g, '').toLowerCase();
    t.pks.add(cn);
    const col = t.cols.get(cn);
    if (col) { col.pk = true; col.notNull = true; }
  }
  const uk = seg.match(/UNIQUE\s*(?:NULLS\s+\w+\s*)?\(([^)]*)\)/i);
  if (uk) for (const c of uk[1].split(',')) {
    const cn = c.trim().replace(/"/g, '').toLowerCase();
    const col = t.cols.get(cn);
    if (col) col.uk = true;
  }
  const fk = seg.match(/FOREIGN\s+KEY\s*\(([^)]*)\)\s*REFERENCES\s+("?(?:\w+\.)?\w+"?)\s*\(([^)]*)\)/i);
  if (fk) {
    const cols = fk[1].split(',').map(s => s.trim().replace(/"/g, '').toLowerCase());
    t.fks.push({ cols, ref: norm(fk[2]), refCols: fk[3].trim(), onDelete: (seg.match(/ON\s+DELETE\s+(\w+)/i) || [])[1] ?? null });
    for (const cn of cols) {
      const col = t.cols.get(cn);
      if (col) col.fk = { table: norm(fk[2]), cols: fk[3].trim() };
    }
  }
}

const unquote = s => s.replace(/^'|'$/g, '').replace(/''/g, "'").trim();
const esc = s => s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, ' ');

for (const file of files) {
  const sql = readFileSync(join(MIG_DIR, file), 'utf-8');

  // CREATE TABLE
  for (const m of sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?("?(?:\w+\.)?\w+"?)\s*\(/gi)) {
    const t = getTable(m[1]);
    const open = sql.indexOf('(', m.index + m[0].length - 1);
    const close = matchParen(sql, open);
    if (close < 0) continue;
    for (const seg of splitTopLevel(sql.slice(open + 1, close))) parseColumn(seg, t);
  }

  // ALTER TABLE ... ações
  for (const m of sql.matchAll(/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?("?(?:\w+\.)?\w+"?)\s+([^;]+);/gi)) {
    const t = getTable(m[1], false);
    if (!t) continue;
    const body = m[2];
    if (/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(body)) t.rls = 'enabled';
    if (/FORCE\s+ROW\s+LEVEL\s+SECURITY/i.test(body)) t.rls = 'forced';
    if (/DISABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(body)) t.rls = 'disabled';
    const rnm = body.match(/RENAME\s+TO\s+("?[a-zA-Z_]\w*"?)/i);
    if (rnm) {
      const to = norm(rnm[1]);
      tables.set(to, t); tables.delete(norm(m[1])); t.name = to;
      continue;
    }
    // ações separadas por vírgula de nível 0 (tipos como NUMERIC(12,2) seguros)
    for (const seg of splitTopLevel(body)) {
      const s = seg.trim();
      let am;
      if ((am = s.match(/^ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(.+)$/is))) parseColumn(am[1], t);
      else if (/^ADD\s+(?:CONSTRAINT\s+\w+\s+)?(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)/i.test(s)) parseTableConstraint(s, t);
      else if ((am = s.match(/^DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?("?)([a-zA-Z_]\w*)\1/i))) t.cols.delete(am[2].toLowerCase());
      else if ((am = s.match(/^RENAME\s+COLUMN\s+("?[a-zA-Z_]\w*"?)\s+TO\s+("?[a-zA-Z_]\w*"?)/i))) {
        const from = am[1].replace(/"/g, '').toLowerCase(), to = am[2].replace(/"/g, '').toLowerCase();
        if (t.cols.has(from)) { t.cols.set(to, t.cols.get(from)); t.cols.delete(from); }
      } else if ((am = s.match(/^ALTER\s+COLUMN\s+("?[a-zA-Z_]\w*"?)\s+(TYPE\s+.+|SET\s+NOT\s+NULL|DROP\s+NOT\s+NULL|SET\s+DEFAULT\s+.+|DROP\s+DEFAULT)$/is))) {
        const col = t.cols.get(am[1].replace(/"/g, '').toLowerCase());
        if (!col) continue;
        if (/^TYPE/i.test(am[2])) col.type = am[2].replace(/^TYPE\s+/i, '').replace(/\s+/g, ' ');
        if (/SET\s+NOT\s+NULL/i.test(am[2])) col.notNull = true;
        if (/DROP\s+NOT\s+NULL/i.test(am[2])) col.notNull = false;
        if (/SET\s+DEFAULT/i.test(am[2])) col.default = am[2].replace(/SET\s+DEFAULT\s+/i, '').trim();
        if (/DROP\s+DEFAULT/i.test(am[2])) col.default = null;
      }
    }
  }

  // DROP TABLE
  for (const m of sql.matchAll(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?("?(?:\w+\.)?\w+"?)/gi)) tables.delete(norm(m[1]));

  // Policies
  for (const m of sql.matchAll(/CREATE\s+POLICY\s+"?([^"\n]+)"?\s+ON\s+("?(?:\w+\.)?\w+"?)/gi)) {
    const t = getTable(m[2], false);
    if (t) t.policies.add(m[1].trim());
  }
  for (const m of sql.matchAll(/DROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?"?([^"\n]+?)"?\s+ON\s+("?(?:\w+\.)?\w+"?)/gi)) {
    const t = getTable(m[2], false);
    if (t) t.policies.delete(m[1].trim());
  }

  // Comentários
  for (const m of sql.matchAll(/COMMENT\s+ON\s+TABLE\s+("?(?:\w+\.)?\w+"?)\s+IS\s+'((?:[^']|'')*)'/gi)) {
    const t = getTable(m[1], false);
    if (t) t.comment = unquote(m[2]);
  }
  for (const m of sql.matchAll(/COMMENT\s+ON\s+COLUMN\s+("?(?:\w+\.)?\w+"?)\.("?[a-zA-Z_]\w*"?)\s+IS\s+'((?:[^']|'')*)'/gi)) {
    const t = getTable(m[1], false);
    const col = t?.cols.get(m[2].replace(/"/g, '').toLowerCase());
    if (col) col.comment = unquote(m[3]);
  }
}

// ---------- DATA_DICTIONARY.md ----------
const out = [];
out.push('# Dicionário de Dados — Promo Champions V2.1', '');
out.push('> Gerado por `scripts/gen-data-dict.mjs` varrendo `supabase/migrations/*.sql`');
out.push('> em ordem. Reflete o último estado declarado — guards `IF EXISTS`/');
out.push('> `to_regclass` não são avaliados, então divergências pontuais com o banco');
out.push('> podem existir. Regenerar: `node scripts/gen-data-dict.mjs`.', '');
out.push(`Total: **${tables.size} tabelas** no schema \`public\`.`, '');
out.push('## Índice', '');
const sorted = [...tables.values()].sort((a, b) => a.name.localeCompare(b.name));
for (const t of sorted) {
  const badge = t.rls === 'enabled' || t.rls === 'forced' ? '🔒' : '⚠️ sem RLS declarado';
  out.push(`- [\`${t.name}\`](#${t.name}) — ${t.cols.size} col · ${badge} · ${t.policies.size} policies`);
}
out.push('');
for (const t of sorted) {
  out.push(`### \`${t.name}\``, '');
  if (t.comment) out.push(`> ${t.comment}`, '');
  const rlsTxt = t.rls === 'forced' ? 'RLS **forced**' : t.rls === 'enabled' ? 'RLS habilitada' : t.rls === 'disabled' ? 'RLS desabilitada' : 'RLS não declarado nas migrations';
  out.push(`**${rlsTxt}** · ${t.policies.size} policies${t.policies.size ? `: ${[...t.policies].slice(0, 8).map(p => `\`${p}\``).join(', ')}${t.policies.size > 8 ? '…' : ''}` : ''}`, '');
  out.push('| Coluna | Tipo | Nulo | Default | Constraints | Comentário |');
  out.push('|--------|------|------|---------|-------------|------------|');
  for (const [cn, c] of t.cols) {
    const flags = [];
    if (c.pk || t.pks.has(cn)) flags.push('PK');
    if (c.uk) flags.push('UNIQUE');
    if (c.fk) flags.push(`FK → \`${c.fk.table}.${c.fk.cols}\``);
    out.push(`| \`${cn}\` | ${esc(c.type)} | ${c.notNull ? 'NOT NULL' : 'sim'} | ${c.default ? `\`${esc(c.default)}\`` : '—'} | ${flags.join(' · ') || '—'} | ${c.comment ? esc(c.comment) : '—'} |`);
  }
  if (!t.cols.size) out.push('| — | — | — | — | — | — |');
  out.push('');
}
writeFileSync(OUT_DICT, out.join('\n'));

// ---------- ER.md ----------
// FKs entre tabelas conhecidas; ranqueia por conectividade e pega as principais.
const degree = new Map();
const edges = [];
const seenEdge = new Set();
for (const t of tables.values()) {
  for (const fk of t.fks) {
    if (!tables.has(fk.ref)) continue;
    const key = `${t.name}|${fk.ref}|${fk.cols.join(',')}`;
    if (seenEdge.has(key)) continue;
    seenEdge.add(key);
    edges.push({ from: t.name, to: fk.ref, cols: fk.cols.join(','), refCols: fk.refCols });
    degree.set(t.name, (degree.get(t.name) ?? 0) + 1);
    degree.set(fk.ref, (degree.get(fk.ref) ?? 0) + 1);
  }
}
const TOP = 40;
const core = new Set([...degree.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP).map(([n]) => n));

const er = [];
er.push('# Diagrama ER — Promo Champions V2.1', '');
er.push('> Gerado por `scripts/gen-data-dict.mjs`. Mostra as ' + TOP + ' tabelas mais');
er.push('> conectadas (por nº de FKs) e as FKs entre elas. O grafo completo está no');
er.push('> [dicionário de dados](./DATA_DICTIONARY.md). Regenerar: `node scripts/gen-data-dict.mjs`.', '');
er.push('```mermaid', 'erDiagram');
for (const e of edges) {
  if (!core.has(e.from) || !core.has(e.to)) continue;
  er.push(`  ${e.to.toUpperCase().replace(/-/g, '_')} ||--o{ ${e.from.toUpperCase().replace(/-/g, '_')} : "${e.cols}"`);
}
er.push('');
for (const name of [...core].sort()) {
  const t = tables.get(name);
  er.push(`  ${name.toUpperCase().replace(/-/g, '_')} {`);
  let shown = 0;
  for (const [cn, c] of t.cols) {
    const isKey = c.pk || t.pks.has(cn) || c.fk;
    if (!isKey && shown >= 6) continue;
    const typ = (c.type.split(' ')[0].replace(/^public\./, '').replace(/\(.*$/, '').replace(/[^a-zA-Z0-9_]/g, '')) || 'text';
    const marks = [c.pk || t.pks.has(cn) ? 'PK' : '', c.fk ? 'FK' : ''].filter(Boolean).join(',');
    er.push(`    ${typ} ${cn}${marks ? ` ${marks}` : ''}`);
    if (!isKey) shown++;
  }
  er.push('  }');
}
er.push('```', '');
er.push(`_${edges.length} FKs declaradas no total; ${[...edges].filter(e => core.has(e.from) && core.has(e.to)).length} exibidas._`);
writeFileSync(OUT_ER, er.join('\n'));

console.log(`DATA_DICTIONARY.md: ${tables.size} tabelas · ER.md: ${core.size} entidades, ${edges.filter(e => core.has(e.from) && core.has(e.to)).length} FKs`);
