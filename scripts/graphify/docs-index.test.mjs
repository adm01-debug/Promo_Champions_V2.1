import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { indexDocuments } from './docs-index.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-graphify-docs-'));
  fs.mkdirSync(path.join(root, 'docs', 'planos'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'decisions'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'README.md'), '# Raiz\n');
  fs.writeFileSync(path.join(root, 'src', 'app.ts'), 'export const app = true;\n');
  fs.writeFileSync(path.join(root, 'docs', 'planos', 'PLANO.md'), '# Plano executável\n[App](../../src/app.ts) [Ausente](../nao-existe.md) [Externo](https://example.invalid)\n');
  fs.writeFileSync(path.join(root, 'docs', 'decisions', 'ADR.md'), '# Decisão\n[Plano](../planos/PLANO.md#topo)\n');
  return root;
}

test('indexa links explícitos sem concluir implementação', () => {
  const root = fixture();
  const index = indexDocuments(root);
  assert.equal(index.documents.length, 2);
  assert.equal(index.documents.find(document => document.path === 'docs/planos/PLANO.md').classification, 'proposta');
  assert.equal(index.documents.find(document => document.path === 'docs/decisions/ADR.md').classification, 'decisao');
  assert.equal(index.links.filter(link => link.kind === 'local').length, 2);
  assert.equal(index.links.filter(link => link.kind === 'ausente').length, 1);
  assert.equal(index.links.filter(link => link.kind === 'externo').length, 1);
  assert.match(index.limitations[0], /não comprovam implementação/);
});

test('recusa documentação alcançada por link simbólico', () => {
  const root = fixture();
  fs.symlinkSync(path.join(root, 'README.md'), path.join(root, 'docs', 'atalho.md'));
  assert.throws(() => indexDocuments(root));
});

test('não classifica como local um link para symlink externo', () => {
  const root = fixture();
  const external = path.join(os.tmpdir(), 'promo-graphify-external.md');
  fs.writeFileSync(external, '# externo\n');
  fs.symlinkSync(external, path.join(root, 'src', 'externo.md'));
  fs.appendFileSync(path.join(root, 'docs', 'planos', 'PLANO.md'), '[Fora](../../src/externo.md)\n');
  const index = indexDocuments(root);
  assert.equal(index.links.find(link => link.target === '../../src/externo.md')?.kind, 'fora_do_repositorio');
});
