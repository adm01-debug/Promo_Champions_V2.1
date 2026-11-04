// Contrato de scripts/types-sync/validar.mjs: o types.ts gerado do banco oficial so substitui o
// commitado se tiver cara de ser do mesmo projeto. Tudo offline (sem CLI, banco ou token).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chavesDoBloco, comparar, resumoMarkdown, TAMANHO_MINIMO } from '../types-sync/validar.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const atual = fs.readFileSync(path.join(raiz, 'src/integrations/supabase/types.ts'), 'utf8');

function tipos(tabelas, funcoes, enchimento = TAMANHO_MINIMO) {
  return [
    'export type Database = {',
    '  graphql_public: {',
    '    Tables: {',
    '      [_ in never]: never',
    '    }',
    '  }',
    '  public: {',
    '    Tables: {',
    ...tabelas.map((t) => `      ${t}: {\n        Row: {\n          id: string\n        }\n      }`),
    '    }',
    '    Functions: {',
    ...funcoes.map((f) => (f.startsWith('*') ? `      ${f.slice(1)}:\n        | { Args: never; Returns: undefined }` : `      ${f}: { Args: never; Returns: undefined }`)),
    '    }',
    '  }',
    '}',
    `// ${'x'.repeat(enchimento)}`,
  ].join('\n') + '\n';
}

test('chavesDoBloco le tabelas e funcoes (inclusive overload em linha propria) so do schema public', () => {
  const t = tipos(['a', 'b'], ['f1', '*f2']);
  assert.deepEqual(chavesDoBloco(t, 'Tables'), ['a', 'b']);
  assert.deepEqual(chavesDoBloco(t, 'Functions'), ['f1', 'f2']);
  assert.equal(chavesDoBloco('nada', 'Tables'), null);
});

test('types.ts real: o leitor acha as tabelas e funcoes de producao', () => {
  assert.ok(chavesDoBloco(atual, 'Tables').length > 300);
  assert.ok(chavesDoBloco(atual, 'Functions').length > 100);
  assert.equal(comparar(atual, atual).mudou, false, 'gerar o mesmo arquivo nao abre PR');
  assert.equal(comparar(`${atual}\n\n`, atual).mudou, false, 'so espaco no fim nao conta como mudanca');
});

test('drift real vira resumo com tabelas/funcoes novas e removidas', () => {
  const antes = tipos(Array.from({ length: 20 }, (_, i) => `t${i}`), ['f_velha', 'f_fica']);
  const depois = tipos([...Array.from({ length: 19 }, (_, i) => `t${i}`), 'nova'], ['f_fica', 'f_nova']);
  const r = comparar(depois, antes);
  assert.equal(r.mudou, true);
  assert.deepEqual(r.tabelas, { antes: 20, depois: 20, novas: ['nova'], removidas: ['t19'] });
  assert.deepEqual(r.funcoes.novas, ['f_nova']);
  assert.deepEqual(r.funcoes.removidas, ['f_velha']);
  assert.match(resumoMarkdown(r), /tabelas novas \(1\): `nova`/);
});

test('recusa candidato pequeno, sem public.Tables ou de outro projeto', () => {
  const antes = tipos(Array.from({ length: 20 }, (_, i) => `t${i}`), []);
  assert.throws(() => comparar(tipos(['t0'], [], 10), antes), /bytes/);
  assert.throws(() => comparar(`// ${'x'.repeat(TAMANHO_MINIMO)}`, antes), /public\.Tables/);
  assert.throws(() => comparar(tipos(['outra1', 'outra2', 't0'], []), antes), /parece outro projeto/);
  assert.equal(comparar(tipos(['t0'], []), '').mudou, true, 'sem arquivo atual, qualquer geracao valida entra');
});
