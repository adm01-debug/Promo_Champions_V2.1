import test from 'node:test';
import assert from 'node:assert/strict';
import { findSecretSignals, isPathInside, parsePositiveInteger, validateGraphDocument } from './graphify-utils.mjs';

test('aceita caminho dentro da raiz e recusa travessia', () => {
  assert.equal(isPathInside('/repo', '/repo/src/modulo.ts'), true);
  assert.equal(isPathInside('/repo', '/repo-out/modulo.ts'), false);
  assert.equal(isPathInside('/repo', '/repo/../segredo'), false);
});

test('valida inteiro positivo', () => {
  assert.equal(parsePositiveInteger('2', '--max-workers'), 2);
  assert.throws(() => parsePositiveInteger('0', '--max-workers'));
  assert.throws(() => parsePositiveInteger('../2', '--max-workers'));
});

test('recusa arestas órfãs e ids repetidos', () => {
  assert.throws(() =>
    validateGraphDocument({
      nodes: [{ id: 'a' }, { id: 'a' }],
      edges: [],
    })
  );
  assert.throws(() =>
    validateGraphDocument({
      nodes: [{ id: 'a' }],
      edges: [{ source: 'a', target: 'b' }],
    })
  );
});

test('mantém referências externas de importação explicitamente classificadas', () => {
  assert.deepEqual(
    validateGraphDocument({
      nodes: [{ id: 'modulo_local' }],
      edges: [
        {
          source: 'modulo_local',
          target: 'ref_node_fs',
          relation: 'imports_from',
        },
      ],
    }),
    { nodes: 1, edges: 1, externalReferences: 1 }
  );
});

test('identifica padrões sensíveis sem retornar seu conteúdo', () => {
  const syntheticToken = `sb${'p_'}abcdefghijklmnopqrstuv`;
  const signals = findSecretSignals(`prefixo ${syntheticToken} final`);
  assert.deepEqual(signals, ['padrão sensível 1']);
});

test('aceita grafo mínimo íntegro', () => {
  assert.deepEqual(
    validateGraphDocument({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ source: 'a', target: 'b' }],
    }),
    { nodes: 2, edges: 1, externalReferences: 0 }
  );
});
