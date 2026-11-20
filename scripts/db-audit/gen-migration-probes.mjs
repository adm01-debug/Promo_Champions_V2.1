#!/usr/bin/env node
// Gera SQL de sondagem que verifica, para cada migration em um intervalo
// de versões, se os objetos que ela cria existem em produção. Escopo =
// existência de objetos apenas: a reconciliação de versões do ledger
// (schema_migrations × arquivos do repo) é responsabilidade do drift
// check em migrations-drift.yml, não desta sonda — um objeto existente
// não prova que a migration foi registrada, e vice-versa.
// Cobre: function, table, view, matview, trigger, cron, policy, index,
// constraint, column, extension, type.
// Objetos criados e depois dropados em migration posterior são suprimidos
// (net-state, evita falso positivo garantido); policies com FOR <cmd>
// também filtram o cmd em pg_policies.
//
// Uso: node scripts/db-audit/gen-migration-probes.mjs [since_version]
// Saída: SQL em stdout — alimentar em psql -At (pipe-separated).
// Teste de regressão: node --test scripts/db-audit/gen-migration-probes.test.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIG_DIR = 'supabase/migrations';

// Identificador com aspas duplas pode conter "" (escape SQL) — "[^"]+"
// truncava no primeiro fecha-aspas interno e sondava o nome errado.
const ID = String.raw`[a-zA-Z_][a-zA-Z0-9_]*|"(?:[^"]|"")*"`;
// Qualquer schema — whitelist anterior perdia objetos reais (ex.: ON realtime.messages
// casava "realtime" como nome da tabela e a probe sondava a combinação errada).
const SCH = String.raw`(?:(${ID})\.)?`;
// Cabeça comum de ALTER TABLE: `ALTER TABLE [IF EXISTS] [ONLY] nome` — os
// tokens opcionais podem vir em qualquer ordem. Sem isso, "IF" era capturado
// como nome da tabela (probe com a combinação errada) e a forma anexa
// `ALTER TABLE IF EXISTS t ADD CONSTRAINT ...` não gerava probe nenhuma.
const ALTER_TBL_HEAD = String.raw`alter\s+table\s+(?:(?:if\s+exists|only)\s+)*`;

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
  ['policy',   new RegExp(String.raw`create\s+policy\s+(${ID})\s+on\s+${SCH}(${ID})(?:\s+as\s+(?:restrictive|permissive))?(?:\s+for\s+(all|select|insert|update|delete))?`, 'gi'), 'pol'],
  // Índice: captura a tabela do ON para a probe casar schemaname+tablename
  // (índices de mesmo nome em tabelas/schemas diferentes não colidem).
  ['index',    new RegExp(String.raw`create\s+(?:unique\s+)?index\s+(?:concurrently\s+)?(?:if\s+not\s+exists\s+)?(${ID})[^;]*?\bon\s+(?:only\s+)?(?:(${ID})\.)?(${ID})`, 'gi'), 'idx'],
  ['constraint', new RegExp(String.raw`${ALTER_TBL_HEAD}${SCH}(${ID})\s+add\s+constraint\s+(${ID})`, 'gi'), 'con'],
  // Forma `ALTER TABLE t DROP CONSTRAINT a, ADD CONSTRAINT b` — o ADD não vem
  // colado no nome da tabela, então o pattern acima não o vê.
  ['constraint', new RegExp(String.raw`,\s*add\s+constraint\s+(${ID})`, 'gi'), 'con'],
  ['column',   new RegExp(String.raw`${ALTER_TBL_HEAD}${SCH}(${ID})\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(${ID})`, 'gi'), 'col'],
  // Forma `ALTER TABLE t ADD COLUMN a ..., ADD COLUMN b ...` — a segunda
  // coluna não vem colada no ALTER e era perdida.
  ['column',   new RegExp(String.raw`,\s*add\s+column\s+(?:if\s+not\s+exists\s+)?(${ID})`, 'gi'), 'col'],
  ['extension', /create\s+extension\s+(?:if\s+not\s+exists\s+)?"([^"]+)"|create\s+extension\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/gi, 'ext'],
  ['type',     new RegExp(String.raw`create\s+type\s+${SCH}(${ID})\s+as`, 'gi'), 'type'],
];

// Drops de objetos — usados para suprimir probes de objetos criados num
// arquivo e dropados neste ou em outro posterior (net-state). Labels =
// mesmos kinds de probe. Formas encadeadas de constraint/column espelham
// os patterns de ADD (a tabela vem do ALTER TABLE que envolve).
const DROP_PATTERNS = [
  ['table',    new RegExp(String.raw`drop\s+table\s+(?:if\s+exists\s+)?${SCH}(${ID})`, 'gi')],
  ['view',     new RegExp(String.raw`drop\s+view\s+(?:if\s+exists\s+)?${SCH}(${ID})`, 'gi')],
  ['matview',  new RegExp(String.raw`drop\s+materialized\s+view\s+(?:if\s+exists\s+)?${SCH}(${ID})`, 'gi')],
  // function: captura a lista de argumentos (opcional) — drop com aridade
  // só casa create de MESMA aridade; sem parênteses fica sem aux (backcompat).
  ['function', new RegExp(String.raw`drop\s+function\s+(?:if\s+exists\s+)?${SCH}(${ID})(?:\s*\(\s*([^()]*(?:\([^()]*\)[^()]*)*)\s*\))?`, 'gi')],
  ['trigger',  new RegExp(String.raw`drop\s+trigger\s+(?:if\s+exists\s+)?(${ID})\s+on\s+${SCH}(${ID})`, 'gi')],
  ['policy',   new RegExp(String.raw`drop\s+policy\s+(?:if\s+exists\s+)?\*\s+on\s+public\.(${ID})\s+for\s+delete`, 'gi')],
  // wildcard-drop acima gera obj='*' e extra=tabela; tratado em collectDrops/suppressDropped.
  ['index',    new RegExp(String.raw`drop\s+index\s+(?:concurrently\s+)?(?:if\s+exists\s+)?${SCH}(${ID})`, 'gi')],
  ['constraint', new RegExp(String.raw`${ALTER_TBL_HEAD}${SCH}(${ID})\s+drop\s+constraint\s+(?:if\s+exists\s+)?(${ID})`, 'gi')],
  ['constraint', new RegExp(String.raw`,\s*drop\s+constraint\s+(?:if\s+exists\s+)?(${ID})`, 'gi')],
  ['column',   new RegExp(String.raw`${ALTER_TBL_HEAD}${SCH}(${ID})\s+drop\s+column\s+(?:if\s+exists\s+)?(${ID})`, 'gi')],
  ['column',   new RegExp(String.raw`,\s*drop\s+column\s+(?:if\s+exists\s+)?(${ID})`, 'gi')],
  ['extension', new RegExp(String.raw`drop\s+extension\s+(?:if\s+exists\s+)?(${ID})`, 'gi')],
  ['cron',     /cron\.unschedule\s*\(\s*'([^']+)'/gi],
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

// Tabela do ALTER TABLE que envolve um match da forma `, ADD ...` — sem
// isso a probe sondava só o nome do objeto e uma constraint/coluna
// homônima em outra tabela produzia falso-positivo. Retorna null quando o
// match não está dentro de um ALTER TABLE (mesmo statement: sem `;`
// entre o ALTER e o match) — a probe fica com aux vazio, como antes.
const ALTER_TBL = new RegExp(String.raw`${ALTER_TBL_HEAD}${SCH}(${ID})`, 'gi');
const enclosingAlterTable = (sql, index) => {
  ALTER_TBL.lastIndex = 0;
  let last = null;
  let m;
  while ((m = ALTER_TBL.exec(sql)) && m.index < index) last = m;
  if (!last) return null;
  if (sql.slice(last.index, index).includes(';')) return null;
  return { schema: strip(last[1]) ?? 'public', table: strip(last[2]) };
};

// Extrai as probes de um SQL de migration (comentários removidos aqui
// mesmo — o caller não precisa tratar). Exportado para o teste de
// regressão.
// ── Expansão de DDL dinâmico (DO .. EXECUTE format) ─────────────────────────
// Migrations como 20261001193000_soft_delete_business_tables criam/dropam
// objetos dentro de DO $tag$ blocks via FOREACH + EXECUTE format(...). Sem
// expandir, o gerador (a) perde os creates (0 probe) e (b) não suprime os
// creates antigos que o bloco dropa dinamicamente -> alarmes falsos de drift.
// Este expander materializa esses blocks em DDL estático sondável, substituindo
// o placeholder %I/%L de cada loop por cada tabela do array, e traduz o loop de
// "DROP POLICY de qualquer policy FOR DELETE" num marcador de wildcard.
//
// Classes suportadas (padrão usado em soft_delete_business_tables):
//   - var TEXT[] := ARRAY['t1', ...];  +  FOREACH v IN ARRAY var LOOP
//   - EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE ...', name, t);
//   - EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t)
//       -> marcador `DROP POLICY IF EXISTS * ON public.<t> FOR DELETE`
//   - EXECUTE format('ALTER TABLE public.%I ADD COLUMN ...', t);
//   - EXECUTE format('CREATE INDEX ... ON public.%I ...', t);
const expandDynamic = (rawSql) => {
  let sql = rawSql;
  const materialized = [];
  const doRe = /\bDO\s+(\$[A-Za-z0-9_]*\$)([\s\S]*?)\1/gi;
  let dm;
  while ((dm = doRe.exec(rawSql))) {
    const block = dm[2];
    // Tabelas do array TYPE[] := ARRAY['a','b',...];
    const arrRe = /(\w+)\s*TEXT\[\]\s*:=\s*ARRAY\s*\[\s*((?:'[^']*'\s*,?\s*)+)\s*\]\s*;/i;
    const am = arrRe.exec(block);
    if (!am) continue;
    const tables = [...am[2].matchAll(/'([^']*)'/g)].map((m) => m[1]);
    const arrayVar = am[1];
    // FOREACH v IN ARRAY var LOOP
    const fc = new RegExp(`FOREACH\\s+(\\w+)\\s+IN\\s+ARRAY\\s+${arrayVar}\\s+LOOP`, 'i').exec(block);
    const loopVar = fc ? fc[1] : Array.from(new Set([...block.matchAll(/\b(\w+)\s+IN\s+ARRAY\s+\w+\s+LOOP/gi)])).length ? null : null;
    if (!loopVar) continue;
    // Cada EXECUTE format(...)
    const exRe = /EXECUTE\s+format\s*\(/g;
    let ex;
    while ((ex = exRe.exec(block))) {
      // extrai conteúdo balanceado até o ')' de fechamento + ';'
      let depth = 1, i = exRe.lastIndex, j;
      const start = i;
      while (i < block.length && depth > 0) {
        const ch = block[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        i++;
      }
      j = i; // pos após ')'
      let end = j;
      while (end < block.length && block[end] !== ';') end++;
      const inner = block.slice(start, j - 1);
      const parts = splitTopLevel(inner);
      // template = primeira parte (string literal)
      const tplRe = /^\s*'((?:[^']|'')*)'\s*,?/s;
      const tplM = tplRe.exec(inner);
      if (!tplM) continue;
      const template = tplM[1].replace(/''/g, "'");
      const argStrs = parts.slice(1);
      // classifica cada arg em relação ao loopVar
      const argInfo = argStrs.map((a) => classifyArg(a, loopVar));
      // drop de policies: marca wildcard
      if (/^\s*drop\s+policy/i.test(template)) {
        for (const t of tables) {
          materialized.push(`DROP POLICY IF EXISTS * ON public.${t} FOR DELETE;`);
        }
        continue;
      }
      // create/alter/index: exige uma ocorrencia de loopVar como tabela; se
      // algum arg nao resolve por loop, pula (nao conseguimos materializar).
      const resolved = resolveTemplate(template, argInfo, tables, loopVar);
      if (resolved === null) continue;
      materialized.push(resolved);
    }
    // remove o bloco DO do texto (materialization fica anexado)
    sql = sql.replace(dm[0], '');
  }
  return materialized.join('\n') + '\n' + sql;
};

// Quebra string em argumentos por vírgula de nível top-level (fora de quotes/parens).
const splitTopLevel = (s) => {
  const out = [];
  let depth = 0, cur = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "'") { cur += c; i++; while (i < s.length && s[i] !== "'") { cur += s[i]; i++; } cur += "'"; i++; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; i++; continue; }
    cur += c; i++;
  }
  if (cur.trim() !== '') out.push(cur);
  return out;
};

// Classifica um argumento do format: como produzir o valor por tabela.
// Retorna {type:'table'|'lit'|'concat-fix'|'dynamic'} + payload.
const classifyArg = (arg, loopVar) => {
  const a = arg.trim();
  // 'literal' || var
  let m = /^'(?:[^']|'')*'\s*\|\|\s*\b(\w+)$/s.exec(a);
  if (m && m[1] === loopVar) {
    const lit = a.slice(a.indexOf("'") + 1, a.lastIndexOf("'")).replace(/''/g, "'");
    return { type: 'prefix', prefix: lit };
  }
  // var || 'literal'
  m = /^(\w+)\s*\|\|\s*'(?:[^']|'')*'$/s.exec(a);
  if (m && m[1] === loopVar) {
    const lit = a.slice(a.lastIndexOf("'") + 1, a.length - 1).replace(/''/g, "'");
    return { type: 'suffix', suffix: lit };
  }
  // var sozinho
  if (/^\w+$/s.test(a) && a.trim() === loopVar) return { type: 'table' };
  // referência a outra coluna/registro (ex. pol.policyname) → dinâmico
  if (/^[a-zA-Z_]\w*\.[a-zA-Z_]\w*$/s.test(a)) return { type: 'dynamic' };
  // string literal fixa (ex. nome de schema)
  if (/^'[^']*'$/s.test(a)) return { type: 'lit', value: a.slice(1, -1) };
  return { type: 'dynamic' };
};

// Substitui %I/%L do template pelos valores por tabela. Retorna DDL ou null.
const resolveTemplate = (template, argInfo, tables, loopVar) => {
  const phCount = (template.match(/%[IL]/g) || []).length;
  if (argInfo.some((v) => v.type === 'dynamic')) return null;
  if (phCount !== argInfo.length && phCount !== tables.length) {
    // placeholders devem casar com argInfo em ordem; se houver mais args que
    // placeholders, ignoramos o excedente apenas quando resolvíveis.
  }
  const lines = [];
  for (const t of tables) {
    let oi = 0, res = '', k = 0;
    for (k = 0; k < template.length; k++) {
      if (template[k] === '%' && (template[k+1] === 'I' || template[k+1] === 'L')) {
        const info = argInfo[oi] || { type: 'dynamic' };
        oi++;
        let val;
        if (info.type === 'table') val = litIdent(t);
        else if (info.type === 'prefix') val = litIdent(info.prefix + t);
        else if (info.type === 'suffix') val = litIdent(t + info.suffix);
        else if (info.type === 'lit') val = info.value;
        else return null;
        res += val;
        k++;
        continue;
      }
      res += template[k];
    }
    lines.push(res);
  }
  return lines.join('\n');
};

const litIdent = (s) => (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) ? s : `"${s.replace(/"/g, '""')}"`);

export const collectProbes = (rawSql, version, file = '') => {
  const sql = stripComments(expandDynamic(rawSql));
  const rows = [];
  const seen = new Set();
  for (const [kind, re] of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(sql))) {
      const groups = m.slice(1).map(strip);
      let schema, obj, extra;
      if (kind === 'policy') {
        obj = groups[0]; schema = groups[1] ?? 'public';
        extra = groups[3] ? `${groups[3].toLowerCase()}|${groups[2]}` : groups[2];
      } else if (kind === 'constraint' || kind === 'column') {
        // Dois shapes: ALTER TABLE t ADD X → (schema, tabela, obj) e
        // ", ADD X" → (obj) — a tabela vem do ALTER TABLE que envolve.
        if (groups[2] !== undefined) {
          schema = groups[0] ?? 'public'; extra = groups[1]; obj = groups[2];
        } else {
          const enc = enclosingAlterTable(sql, m.index);
          schema = enc?.schema ?? 'public'; extra = enc?.table ?? ''; obj = groups[0];
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
      rows.push({ version, kind, schema, obj, extra, file });
    }
  }
  return rows;
};

// Extrai os drops de um SQL de migration com a mesma lógica de shape de
// collectProbes (schema/extra por kind; policy/trigger → extra=tabela;
// constraint/column → tabela do ALTER que envolve; index → sem aux;
// function → aridade dos args, quando presentes). Exportado para o teste
// de regressão.
export const collectDrops = (rawSql, version, file = '') => {
  const sql = stripComments(expandDynamic(rawSql));
  const rows = [];
  const seen = new Set();
  for (const [kind, re] of DROP_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(sql))) {
      const groups = m.slice(1).map(strip);
      let schema, obj, extra;
      if (kind === 'policy') {
        // wildcard dinámico (bloco DO dropa todas as FOR DELETE da tabela):
        // obj='*' + extra=tabela, para suppressDropped suprimir creates de DELETE.
        if (/^\s*drop\s+policy/i.test(m[0]) && /\*\s+on\s+/i.test(m[0])) {
          obj = '*'; schema = 'public'; extra = groups[0];
        } else {
          obj = groups[0]; schema = groups[1] ?? 'public'; extra = groups[2];
        }
      } else if (kind === 'trigger') {
        obj = groups[0]; schema = groups[1] ?? 'public'; extra = groups[2];
      } else if (kind === 'constraint' || kind === 'column') {
        if (groups[2] !== undefined) {
          schema = groups[0] ?? 'public'; extra = groups[1]; obj = groups[2];
        } else {
          const enc = enclosingAlterTable(sql, m.index);
          schema = enc?.schema ?? 'public'; extra = enc?.table ?? ''; obj = groups[0];
        }
      } else if (kind === 'extension') {
        schema = ''; obj = groups[0] ?? groups[1];
      } else if (kind === 'cron') {
        schema = ''; obj = groups[0];
      } else if (kind === 'function') {
        // Aridade em extra — drop com args só casa create de mesma aridade.
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
      rows.push({ version, kind, schema, obj, extra, file });
    }
  }
  return rows;
};

// Chave estável para casar create com drop: policy/trigger/constraint/
// column levam a tabela (aux) — para policy o cmd é desconsiderado (uma
// policy recriada com outro FOR não conta como drop do mesmo objeto).
export const suppressKey = (row) => {
  const aux = row.extra ?? '';
  if (row.kind === 'constraint' || row.kind === 'column' || row.kind === 'trigger') {
    return `${row.kind}|${row.schema}|${row.obj}|${aux}`;
  }
  if (row.kind === 'policy') {
    const table = aux.includes('|') ? aux.split('|')[1] ?? '' : aux;
    return `${row.kind}|${row.schema}|${row.obj}|${table}`;
  }
  if (row.kind === 'function') {
    // Aridade: drop com args só suprime create de MESMA aridade; sem args
    // casa sem aridade (backcompat com o comportamento anterior).
    return `${row.kind}|${row.schema}|${row.obj}${aux !== '' ? `|${aux}` : ''}`;
  }
  return `${row.kind}|${row.schema}|${row.obj}`;
};

// Supressão por net-state: percorre os arquivos em ordem crescente de
// version; na passada reversa mantém o set de drops vistos em arquivos
// posteriores. Para cada arquivo, filtra os creates contra esse set ANTES
// de registrar os drops do próprio arquivo — drop-then-recreate no MESMO
// arquivo sobrevive (recreate). Create-then-drop em arquivo posterior
// continua suprimido.
export const suppressDropped = (fileSets) => {
  const sorted = [...fileSets]
    .sort((a, b) => (a.version < b.version ? -1 : a.version > b.version ? 1 : 0))
    .map((fs) => ({ ...fs, creates: fs.creates ?? [], drops: fs.drops ?? [] }));
  const droppedLater = new Set();
  const droppedDeleteTables = new Set(); // tabelas cujo bloco DO dropa TODAS as policies FOR DELETE
  const keeps = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const fs = sorted[i];
    const kept = fs.creates.filter((c) => {
      if (droppedLater.has(suppressKey(c))) return false;
      // wildcard: bloco dinâmico dropou todas as policies FOR DELETE da tabela
      if (c.kind === 'policy' && c.obj !== '*') {
        const tbl = c.extra.includes('|') ? c.extra.split('|')[1] ?? '' : c.extra;
        const cmd = c.extra.includes('|') ? c.extra.split('|')[0] : '';
        if (cmd.toLowerCase() === 'delete' && droppedDeleteTables.has(`${c.schema}|${tbl}`)) return false;
      }
      return true;
    });
    keeps.unshift(...kept);
    for (const d of fs.drops) {
      droppedLater.add(suppressKey(d));
      if (d.kind === 'policy' && d.obj === '*' && d.extra) {
        droppedDeleteTables.add(`${d.schema}|${d.extra}`);
      }
    }
  }
  return keeps;
};

const lit = (s) => `'${String(s).replaceAll("'", "''")}'`;

const main = () => {
  const since = process.argv[2] ?? '20260901000000';
  const files = readdirSync(MIG_DIR)
    .filter((f) => /^\d{8,14}_.*\.sql$/.test(f) && f.split('_')[0] >= since)
    .sort();

  const fileSets = [];
  for (const f of files) {
    const version = f.split('_')[0];
    const rawSql = readFileSync(join(MIG_DIR, f), 'utf8');
    fileSets.push({
      file: f,
      version,
      creates: collectProbes(rawSql, version, f),
      drops: collectDrops(rawSql, version, f),
    });
  }
  const rows = suppressDropped(fileSets);

  // Arquivos sem objeto sondável que sobreviveu (a supressão pode ter
  // eliminado todas as probes do arquivo — vira alvo de revisão manual).
  const perFileKeeps = new Map();
  for (const r of rows) {
    perFileKeeps.set(r.file, [...(perFileKeeps.get(r.file) ?? []), r]);
  }
  const unprobeable = files.filter((f) => !(perFileKeeps.get(f)?.length));

  const values = rows
    .map((r) => `  (${lit(r.version)}, ${lit(r.kind)}, ${lit(r.schema)}, ${lit(r.obj)}, ${lit(r.extra ?? '')})`)
    .join(',\n');

const renderSql = (values) => `\\pset footer off
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
         WHEN 'table'      THEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=probes.schema AND table_name=probes.obj AND table_type='BASE TABLE')::text
         WHEN 'view'       THEN EXISTS(SELECT 1 FROM information_schema.views WHERE table_schema=probes.schema AND table_name=probes.obj)::text
         WHEN 'matview'    THEN EXISTS(SELECT 1 FROM pg_matviews WHERE schemaname=probes.schema AND matviewname=probes.obj)::text
         WHEN 'trigger'    THEN EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE t.tgname=probes.obj AND c.relname=probes.aux AND n.nspname=probes.schema AND NOT t.tgisinternal)::text
         WHEN 'cron'       THEN pg_temp.probe_cron(probes.obj)
         WHEN 'policy'     THEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname=probes.schema AND policyname=probes.obj AND (probes.aux NOT LIKE '%|%' OR cmd=upper(split_part(probes.aux,'|',1))) AND tablename=coalesce(nullif(split_part(probes.aux,'|',2),''),probes.aux))::text
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

  console.log(renderSql(values));

  console.error(`\n-- ${files.length} migrations no intervalo (>= ${since})`);
  console.error(`-- ${rows.length} probes geradas`);
  if (unprobeable.length) {
    console.error(`-- ${unprobeable.length} migrations SEM objeto sondável (revisão manual):`);
    for (const f of unprobeable) console.error(`--   ${f}`);
  }
};

// Só gera saída quando executado diretamente — o import pelo teste de
// regressão não deve varrer supabase/migrations nem imprimir.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
