// Testes de regressão do gerador de probes: node --test scripts/db-audit/gen-migration-probes.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectProbes, collectDrops, suppressKey, suppressDropped } from './gen-migration-probes.mjs';

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

test('ALTER TABLE IF EXISTS não captura "if" como tabela', () => {
  const sql = 'ALTER TABLE IF EXISTS public.sales ADD CONSTRAINT sales_chk CHECK (amount > 0);';
  const cons = collectProbes(sql, V).filter((r) => r.kind === 'constraint');
  assert.deepEqual(cons.map((r) => [r.obj, r.schema, r.extra]), [['sales_chk', 'public', 'sales']]);
});

test('ALTER TABLE IF EXISTS com , ADD encadeado resolve a tabela certa', () => {
  const sql = 'ALTER TABLE IF EXISTS sales ADD CONSTRAINT a_chk CHECK (x > 0), ADD CONSTRAINT b_chk CHECK (y > 0);';
  const cons = collectProbes(sql, V).filter((r) => r.kind === 'constraint');
  assert.deepEqual(cons.map((r) => [r.obj, r.extra]), [['a_chk', 'sales'], ['b_chk', 'sales']]);
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

test('create-then-drop em arquivo posterior é suprimido (net-state)', () => {
  const fileSets = [
    {
      file: '20261019000000_a.sql', version: '20261019000000',
      creates: collectProbes('CREATE TABLE legacy_roles (id int);', '20261019000000', '20261019000000_a.sql'),
      drops: [],
    },
    {
      file: '20261020000000_b.sql', version: '20261020000000',
      creates: [],
      drops: collectDrops('DROP TABLE IF EXISTS legacy_roles;', '20261020000000', '20261020000000_b.sql'),
    },
  ];
  const keeps = suppressDropped(fileSets);
  assert.deepEqual(keeps.filter((r) => r.kind === 'table'), []);
});

test('drop em arquivo anterior + create posterior sobrevive (recreate)', () => {
  const fileSets = [
    {
      file: '20261019000000_a.sql', version: '20261019000000',
      creates: [],
      drops: collectDrops('DROP TABLE IF EXISTS legacy_roles;', '20261019000000', '20261019000000_a.sql'),
    },
    {
      file: '20261020000000_b.sql', version: '20261020000000',
      creates: collectProbes('CREATE TABLE legacy_roles (id int);', '20261020000000', '20261020000000_b.sql'),
      drops: [],
    },
  ];
  const keeps = suppressDropped(fileSets);
  assert.deepEqual(
    keeps.filter((r) => r.kind === 'table').map((r) => [r.obj, r.schema]),
    [['legacy_roles', 'public']],
  );
});

test('policy com FOR SELECT e FOR ALL carrega o cmd no extra', () => {
  const sel = collectProbes('CREATE POLICY p_sel ON t FOR SELECT USING (true);', V).find((r) => r.kind === 'policy');
  assert.equal(sel.extra, 'select|t');
  const all = collectProbes('CREATE POLICY p_all ON t FOR ALL USING (true);', V).find((r) => r.kind === 'policy');
  assert.equal(all.extra, 'all|t');
});

test('policy sem FOR fica sem filtro de cmd (backcompat)', () => {
  const pol = collectProbes('CREATE POLICY p_plain ON t USING (true);', V).find((r) => r.kind === 'policy');
  assert.equal(pol.extra, 't');
});

test('drop-then-recreate no MESMO arquivo sobrevive (net-state)', () => {
  const sql = 'DROP TABLE IF EXISTS t; CREATE TABLE t (id int);';
  const fileSets = [
    {
      file: '20261019000000_a.sql', version: '20261019000000',
      creates: collectProbes(sql, '20261019000000', '20261019000000_a.sql'),
      drops: collectDrops(sql, '20261019000000', '20261019000000_a.sql'),
    },
  ];
  const keeps = suppressDropped(fileSets);
  assert.deepEqual(keeps.filter((r) => r.kind === 'table').map((r) => r.obj), ['t']);
});

test('DROP FUNCTION sem parênteses continua sem aux em collectDrops', () => {
  const drops = collectDrops('DROP FUNCTION IF EXISTS public.f;', V);
  assert.deepEqual(drops.filter((r) => r.kind === 'function').map((r) => [r.obj, r.schema, r.extra]), [['f', 'public', '']]);
});

test('aridade no DROP FUNCTION casa create/drop pela MESMA aridade', () => {
  const fs = (sql, file, version) => ({ file, version, creates: collectProbes(sql, version, file), drops: collectDrops(sql, version, file) });
  // a) aridade diferente (1 × 2): NÃO suprime.
  const naSup = suppressDropped([
    fs('CREATE FUNCTION f(a int, b int) RETURNS int AS $$ SELECT 1 $$ LANGUAGE sql;', '20261019000000_a.sql', '20261019000000'),
    fs('DROP FUNCTION IF EXISTS f(int);', '20261020000000_b.sql', '20261020000000'),
  ]);
  assert.deepEqual(naSup.filter((r) => r.kind === 'function').map((r) => [r.obj, r.schema, r.extra]), [['f', 'public', '2']]);
  // b) mesma aridade: SUPRIME.
  const sup = suppressDropped([
    fs('CREATE FUNCTION f(a int, b int) RETURNS int AS $$ SELECT 1 $$ LANGUAGE sql;', '20261019000000_a.sql', '20261019000000'),
    fs('DROP FUNCTION IF EXISTS f(int, int);', '20261020000000_b.sql', '20261020000000'),
  ]);
  assert.deepEqual(sup.filter((r) => r.kind === 'function'), []);
});

test('suppressKey de function distingue aridade; table ignora aux', () => {
  assert.equal(suppressKey({ kind: 'function', schema: 'public', obj: 'f', extra: '2' }), 'function|public|f|2');
  assert.equal(suppressKey({ kind: 'function', schema: 'public', obj: 'f', extra: '' }), 'function|public|f');
  assert.equal(suppressKey({ kind: 'table', schema: 'public', obj: 't', extra: 'x' }), 'table|public|t');
});
