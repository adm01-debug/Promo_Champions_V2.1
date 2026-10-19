// Testes de regressão do gerador de probes: node --test scripts/db-audit/gen-migration-probes.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectProbes } from './gen-migration-probes.mjs';

const V = '20261019000000';

test('ALTER TABLE com vários ADD em uma linha carrega a tabela em todos', () => {
  const sql = `ALTER TABLE public.sales
    ADD CONSTRAINT sales_chk CHECK (amount > 0),
    ADD CONSTRAINT sales_uq UNIQUE (code),
    ADD CONSTRAINT sales_fk FOREIGN KEY (owner_id) REFERENCES users(id);`;
  const cons = collectProbes(sql, V).filter((r) => r.kind === 'constraint');
  assert.deepEqual(
    cons.map((r) => [r.obj, r.schema, r.extra]),
    [
      ['sales_chk', 'public', 'sales'],
      ['sales_uq', 'public', 'sales'],
      ['sales_fk', 'public', 'sales'],
    ],
  );
});

test('DROP CONSTRAINT + ADD CONSTRAINT na mesma statement resolve a tabela', () => {
  const sql = 'ALTER TABLE t DROP CONSTRAINT IF EXISTS old_chk, ADD CONSTRAINT new_chk CHECK (x > 0);';
  const cons = collectProbes(sql, V).filter((r) => r.kind === 'constraint');
  assert.deepEqual(cons.map((r) => [r.obj, r.extra]), [['new_chk', 't']]);
});

test('ADD COLUMN encadeado carrega a tabela do ALTER', () => {
  const sql = 'ALTER TABLE s.t ADD COLUMN c1 text, ADD COLUMN c2 int;';
  const cols = collectProbes(sql, V).filter((r) => r.kind === 'column');
  assert.deepEqual(
    cols.map((r) => [r.obj, r.schema, r.extra]),
    [
      ['c1', 's', 't'],
      ['c2', 's', 't'],
    ],
  );
});

test(', ADD fora de ALTER TABLE cai no fallback sem tabela (aux vazio)', () => {
  // Edge: ADD órfão — aux vazio mantém a sonda permissiva (comportamento anterior).
  const sql = 'SELECT 1, 2; -- , ADD CONSTRAINT ghost CHECK (true)';
  assert.equal(collectProbes(sql, V).filter((r) => r.kind === 'constraint').length, 0);
});

test('schema qualificado é respeitado nos dois shapes', () => {
  const sql = 'ALTER TABLE app.t ADD CONSTRAINT c1 UNIQUE (x); ALTER TABLE app.t ADD COLUMN c2 text;';
  const rows = collectProbes(sql, V);
  assert.deepEqual(rows.find((r) => r.kind === 'constraint'), {
    version: V, kind: 'constraint', schema: 'app', obj: 'c1', extra: 't', file: '',
  });
  assert.deepEqual(rows.find((r) => r.kind === 'column'), {
    version: V, kind: 'column', schema: 'app', obj: 'c2', extra: 't', file: '',
  });
});

test('trigger carrega tabela do ON; índice carrega tabela do ON', () => {
  const sql = `CREATE TRIGGER trg_x AFTER INSERT ON public.t FOR EACH ROW EXECUTE FUNCTION f();
    CREATE UNIQUE INDEX idx_y ON public.t (a);`;
  const rows = collectProbes(sql, V);
  assert.deepEqual(rows.find((r) => r.kind === 'trigger'), {
    version: V, kind: 'trigger', schema: 'public', obj: 'trg_x', extra: 't', file: '',
  });
  assert.deepEqual(rows.find((r) => r.kind === 'index'), {
    version: V, kind: 'index', schema: 'public', obj: 'idx_y', extra: 't', file: '',
  });
});

test('comentários não geram probes falsas', () => {
  const sql = `-- CREATE TABLE ghost (id int);
    /* CREATE TABLE ghost2 (id int); */
    CREATE TABLE real_t (id int);`;
  const tables = collectProbes(sql, V).filter((r) => r.kind === 'table');
  assert.deepEqual(tables.map((r) => r.obj), ['real_t']);
});
