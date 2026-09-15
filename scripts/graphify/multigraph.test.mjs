import assert from 'node:assert/strict';
import test from 'node:test';
import { createMultiGraphDocument, findPotentialImpact, validateMultiGraphDocument } from './multigraph.mjs';

test('preserva relações múltiplas dirigidas entre os mesmos nós', () => {
  const multigraph = createMultiGraphDocument({
    nodes: [{ id: 'tela' }, { id: 'tabela' }],
    edges: [
      { source: 'tela', target: 'tabela', relation: 'reads', confidence: 'EXTRACTED', source_file: 'tela.ts' },
      { source: 'tela', target: 'tabela', relation: 'writes', confidence: 'EXTRACTED', source_file: 'tela.ts' },
    ],
  });
  assert.deepEqual(validateMultiGraphDocument(multigraph), { nodes: 2, edges: 2 });
  assert.equal(new Set(multigraph.edges.map(edge => edge.id)).size, 2);
  assert.deepEqual(multigraph.edges.map(edge => edge.relation).sort(), ['reads', 'writes']);
});

test('materializa importações externas e mantém todas as relações da fonte', () => {
  const multigraph = createMultiGraphDocument({
    nodes: [{ id: 'modulo' }],
    edges: [{ source: 'modulo', target: 'ref_node_fs', relation: 'imports_from', confidence: 'EXTRACTED' }],
  });
  assert.deepEqual(validateMultiGraphDocument(multigraph), { nodes: 2, edges: 1 });
  assert.equal(multigraph.nodes.find(node => node.id === 'ref_node_fs')?.kind, 'external_reference');
});

test('impacto reverso conserva evidência e informa relações ambíguas', () => {
  const multigraph = createMultiGraphDocument({
    nodes: [{ id: 'pagina' }, { id: 'hook' }, { id: 'rpc' }],
    edges: [
      { source: 'pagina', target: 'hook', relation: 'calls', confidence: 'EXTRACTED' },
      { source: 'hook', target: 'rpc', relation: 'dynamic_import', confidence: 'INFERRED' },
    ],
  });
  const report = findPotentialImpact(multigraph, ['rpc']);
  assert.deepEqual(report.impacted, ['hook', 'pagina', 'rpc']);
  assert.equal(report.evidence.length, 2);
  assert.equal(report.limitations.length, 1);
});

test('rejeita documento que perde uma relação da fonte', () => {
  assert.throws(() => validateMultiGraphDocument({ schemaVersion: 1, directed: true, nodes: [{ id: 'a' }], edges: [], sourceGraph: { edges: 1 } }));
});
