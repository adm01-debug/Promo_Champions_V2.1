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
});
