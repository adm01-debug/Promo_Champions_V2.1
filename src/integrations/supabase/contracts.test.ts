/**
 * CONTRATO-BANCO - trava as relacoes consultadas pelo front.
 *
 * `auth_users_view` nunca existiu no banco e duas telas a consultavam atraves de
 * um cast que escondia o erro do TypeScript: o PostgREST respondia com erro e a
 * lista ficava vazia sem aviso ao usuario. O teste compara todo `.from('...')` e
 * `.rpc('...')` do `src` com o que `types.ts` (gerado do banco) declara.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TYPES_FILE = path.join(SRC_ROOT, 'integrations/supabase/types.ts');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

/** Nomes declarados em `public` no types.ts, por bloco. */
function generatedRelations() {
  const tables = new Set<string>();
  const views = new Set<string>();
  const functions = new Set<string>();
  let schema: string | null = null;
  let block: string | null = null;
  for (const line of fs.readFileSync(TYPES_FILE, 'utf8').split(/\r?\n/)) {
    let match = line.match(/^  (\w+): \{$/);
    if (match) {
      schema = match[1] ?? null;
      block = null;
      continue;
    }
    match = line.match(/^    (Tables|Views|Functions): \{$/);
    if (match) {
      block = match[1] ?? null;
      continue;
    }
    if (/^    \}/.test(line)) {
      block = null;
      continue;
    }
    if (schema !== 'public' || !block) continue;
    match = line.match(/^      ([a-zA-Z0-9_]+): \{/);
    if (!match) continue;
    const name = match[1] ?? '';
    if (block === 'Tables') tables.add(name);
    else if (block === 'Views') views.add(name);
    else functions.add(name);
  }
  return { tables, views, functions };
}

/** Relacoes/RPCs usados no codigo, ignorando comentarios. */
function usedRelations() {
  const relations = new Map<string, string>();
  const rpcs = new Map<string, string>();
  for (const file of walk(SRC_ROOT)) {
    const source = fs
      .readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const match of source.matchAll(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]/g)) {
      const name = match[1] ?? '';
      if (!relations.has(name)) relations.set(name, path.relative(SRC_ROOT, file));
    }
    for (const match of source.matchAll(/\.rpc\(\s*['"`]([a-zA-Z0-9_]+)['"`]/g)) {
      const name = match[1] ?? '';
      if (!rpcs.has(name)) rpcs.set(name, path.relative(SRC_ROOT, file));
    }
  }
  return { relations, rpcs };
}

type ForeignKey = { name: string; columns: string[]; referencedRelation: string };

/** Estado do parser linha a linha do `types.ts` gerado. */
type TypesParserState = {
  schema: string | null;
  block: string | null;
  table: string | null;
  current: ForeignKey | null;
};

/** Cabecalhos de bloco (schema, secao, tabela). `true` = linha consumida. */
function consumeTypesHeader(
  line: string,
  state: TypesParserState,
  byTable: Map<string, ForeignKey[]>
) {
  const schema = line.match(/^  (\w+): \{$/);
  if (schema) {
    state.schema = schema[1] ?? null;
    state.block = null;
    state.table = null;
    return true;
  }
  const section = line.match(/^    (Tables|Views|Functions): \{$/);
  if (section) {
    state.block = section[1] ?? null;
    state.table = null;
    return true;
  }
  if (/^  \}/.test(line)) {
    state.schema = null;
    state.block = null;
    state.table = null;
    return true;
  }
  const table = line.match(/^      ([a-zA-Z0-9_]+): \{$/);
  if (table) {
    state.table = table[1] ?? '';
    state.current = null;
    byTable.set(state.table, []);
    return true;
  }
  return false;
}

/** Campos de uma FK: `foreignKeyName`, `columns` (abre a FK) e `referencedRelation`. */
function consumeForeignKeyField(
  line: string,
  state: TypesParserState,
  byTable: Map<string, ForeignKey[]>
) {
  if (!state.table) return;
  const name = line.match(/^\s+foreignKeyName: "([^"]+)"/);
  if (name && state.current) {
    state.current.name = name[1] ?? '';
    return;
  }
  const columns = line.match(/^\s+columns: \[([^\]]*)\],?$/);
  if (columns) {
    const parsed = [...(columns[1] ?? '').matchAll(/"([^"]+)"/g)].map(m => m[1] ?? '');
    state.current = { name: '', columns: parsed, referencedRelation: '' };
    byTable.get(state.table)?.push(state.current);
    return;
  }
  const referenced = line.match(/^\s+referencedRelation: "([^"]+)"/);
  if (referenced && state.current) state.current.referencedRelation = referenced[1] ?? '';
}

/**
 * FKs declaradas pelo banco por tabela do schema `public`. O PostgREST resolve
 * `alias:coluna(...)` apenas quando a coluna tem FK (PGRST200 quando nao tem),
 * e `alias:tabela!coluna(...)` (ou `!nome_da_constraint`) apenas quando existe
 * essa FK. Views nao declaram relacionamentos no types.ts gerado, por isso
 * ficam fora da verificacao.
 */
function generatedForeignKeys() {
  const byTable = new Map<string, ForeignKey[]>();
  const state: TypesParserState = {
    schema: null,
    block: null,
    table: null,
    current: null,
  };
  for (const line of fs.readFileSync(TYPES_FILE, 'utf8').split(/\r?\n/)) {
    if (consumeTypesHeader(line, state, byTable)) continue;
    if (state.schema !== 'public' || state.block !== 'Tables') continue;
    consumeForeignKeyField(line, state, byTable);
  }
  return byTable;
}

/** Profundidade de parenteses de cada posicao da string de select. */
function parenDepthAt(select: string, index: number) {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    if (select[i] === '(') depth++;
    else if (select[i] === ')') depth--;
  }
  return depth;
}

/** Embeds de primeiro nivel cujo apelido aponta para coluna/tabela sem relacao declarada. */
function brokenEmbeds(
  table: string,
  select: string,
  fks: Map<string, ForeignKey[]>,
  catalog: Set<string>
) {
  const relations = fks.get(table) ?? [];
  // FK declarada na propria tabela: embed de linha unica (many-to-one).
  const ownHints = new Set(
    relations.flatMap(relation => [...relation.columns, relation.name].filter(Boolean))
  );
  const ownTargets = new Set(relations.map(relation => relation.referencedRelation));
  // FK declarada na tabela filha apontando para esta: embed de colecao (one-to-many).
  const childTargets = new Set(
    [...fks]
      .filter(([, childRelations]) =>
        childRelations.some(relation => relation.referencedRelation === table)
      )
      .map(([child]) => child)
  );
  const broken: string[] = [];

  for (const match of select.matchAll(
    /([a-zA-Z0-9_]+):([a-zA-Z0-9_]+)(!([a-zA-Z0-9_]+))?(?=\s*[(),])/g
  )) {
    if (parenDepthAt(select, match.index ?? 0) !== 0) continue;
    const target = match[2] ?? '';
    const hint = match[4];
    const alias = match[0];
    const isModifier = hint === 'inner' || hint === 'left';
    const isKnownTarget = catalog.has(target);
    const valid = isModifier
      ? ownTargets.has(target) || childTargets.has(target)
      : hint
        ? ownHints.has(hint) || childTargets.has(target)
        : isKnownTarget
          ? ownTargets.has(target) || childTargets.has(target)
          : ownHints.has(target);

    if (!valid) broken.push(alias);
  }
  return broken;
}

/** Pares (tabela de `.from()`, string do `.select()` seguinte) usados no codigo. */
function usedEmbeds() {
  const pairs: Array<{ table: string; select: string; file: string }> = [];
  const stringLiteral = /(['"`])((?:\\.|(?!\1)[\s\S])*)\1/;
  for (const file of walk(SRC_ROOT)) {
    const source = fs
      .readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const match of source.matchAll(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]\s*\)/g)) {
      const table = match[1] ?? '';
      const window = source.slice(
        (match.index ?? 0) + match[0].length,
        (match.index ?? 0) + 900
      );
      const selectCall = window.match(/\.select\(\s*/);
      if (!selectCall) continue;
      const rest = window.slice(selectCall.index ?? 0);
      const literal = rest.match(stringLiteral);
      if (!literal?.[2]) continue;
      pairs.push({ table, select: literal[2], file: path.relative(SRC_ROOT, file) });
    }
  }
  return pairs;
}

describe('contratos do front com o banco', () => {
  const { tables, views, functions } = generatedRelations();
  const { relations, rpcs } = usedRelations();

  it('encontra o catalogo gerado do banco', () => {
    expect(tables.size).toBeGreaterThan(300);
    expect(views.size).toBeGreaterThan(10);
  });

  it('nao consulta tabela/view ausente do types.ts', () => {
    const missing = [...relations]
      .filter(([name]) => !tables.has(name) && !views.has(name))
      .map(([name, file]) => `${name} (${file})`);
    expect(missing).toEqual([]);
  });

  it('nao chama RPC ausente do types.ts', () => {
    const missing = [...rpcs]
      .filter(([name]) => !functions.has(name))
      .map(([name, file]) => `${name} (${file})`);
    expect(missing).toEqual([]);
  });

  it('nao embute relacao sem FK declarada no banco', () => {
    const fks = generatedForeignKeys();
    const catalog = new Set([...tables, ...views]);
    const pairs = usedEmbeds().filter(({ table }) => tables.has(table));
    expect(pairs.length).toBeGreaterThan(20);
    const broken = pairs
      .flatMap(({ table, select, file }) =>
        brokenEmbeds(table, select, fks, catalog).map(
          alias => `${table} -> ${alias} (${file})`
        )
      )
      .sort();
    expect(broken).toEqual([]);
  });

  it('le as FKs declaradas para as tabelas do catalogo', () => {
    const fks = generatedForeignKeys();
    expect(fks.size).toBeGreaterThan(300);
    expect(
      (fks.get('order_items') ?? []).map(relation => relation.referencedRelation)
    ).toContain('orders');
  });

  it('detecta embed sem FK (regressao real de intent_audit_logs)', () => {
    const fks = generatedForeignKeys();
    const catalog = new Set([...tables, ...views]);
    expect(
      brokenEmbeds('intent_audit_logs', '*, leads:lead_id(client_name)', fks, catalog)
    ).toEqual(['leads:lead_id']);
    expect(
      brokenEmbeds(
        'prospect_cadences',
        'id, sales(client_name), quotes(client_name)',
        fks,
        catalog
      )
    ).toEqual([]);
    expect(
      brokenEmbeds(
        'deal_probability_scores',
        '*, sales:sale_id(id, salespeople:salespeople!salesperson_id(name))',
        fks,
        catalog
      )
    ).toEqual([]);
  });
});
