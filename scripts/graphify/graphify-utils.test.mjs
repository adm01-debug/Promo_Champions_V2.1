import test from 'node:test';
import assert from 'node:assert/strict';
import { assertExactGraphifyVersion, findSecretSignals, isPathInside, parsePositiveInteger, redactSensitiveText, validateGraphDocument } from './graphify-utils.mjs';

test('aceita caminho dentro da raiz e recusa travessia', () => {
  assert.equal(isPathInside('/repo', '/repo/src/modulo.ts'), true);
  assert.equal(isPathInside('/repo', '/repo-out/modulo.ts'), false);
  assert.equal(isPathInside('/repo', '/repo/../segredo'), false);
});

test('valida inteiro positivo', () => {
  assert.equal(parsePositiveInteger('2', '--max-workers'), 2);
  assert.throws(() => parsePositiveInteger('0', '--max-workers'));
  assert.throws(() => parsePositiveInteger('../2', '--max-workers'));
  assert.throws(() => parsePositiveInteger('9', '--max-workers', 8));
});

test('exige a versão completa e exata do Graphify', () => {
  assert.doesNotThrow(() => assertExactGraphifyVersion('graphify 0.9.48\n', '0.9.48'));
  assert.throws(() => assertExactGraphifyVersion('graphify 0.9.480', '0.9.48'));
  assert.throws(() => assertExactGraphifyVersion('graphify 0.9.48 beta', '0.9.48'));
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

test('mantém importações externas ou fora do escopo explicitamente classificadas', () => {
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
    { nodes: 1, edges: 1, unresolvedImports: 1, multiRelationPairs: 0, collapseRisk: 0 }
  );
});

test('não mascara órfão em relação que não é importação', () => {
  assert.throws(() =>
    validateGraphDocument({
      nodes: [{ id: 'modulo_local' }],
      edges: [{ source: 'modulo_local', target: 'simbolo_ausente', relation: 'calls' }],
    })
  );
  assert.throws(() =>
    validateGraphDocument({
      nodes: [{ id: 'modulo_local' }],
      edges: [{ source: 'origem_ausente', target: 'modulo_local', relation: 'imports' }],
    })
  );
});

test('identifica padrões sensíveis sem retornar seu conteúdo', () => {
  const syntheticToken = `sb${'p_'}abcdefghijklmnopqrstuv`;
  const signals = findSecretSignals(`prefixo ${syntheticToken} final`);
  assert.deepEqual(signals, ['padrão sensível 1']);
});

test('redige padrões sensíveis de diagnósticos', () => {
  const syntheticToken = `sb${'p_'}abcdefghijklmnopqrstuv`;
  assert.equal(redactSensitiveText(`falha ${syntheticToken}`), 'falha [REDACTED]');
});

test('aceita grafo mínimo íntegro', () => {
  assert.deepEqual(
    validateGraphDocument({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ source: 'a', target: 'b', relation: 'calls', confidence: 'EXTRACTED' }],
    }),
    { nodes: 2, edges: 1, unresolvedImports: 0, multiRelationPairs: 0, collapseRisk: 0 }
  );
});

test('contabiliza perda potencial quando o mesmo par tem relações diferentes', () => {
  assert.deepEqual(
    validateGraphDocument({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        { source: 'a', target: 'b', relation: 'imports_from', context: 'import' },
        { source: 'a', target: 'b', relation: 're_exports', context: 're-export' },
      ],
    }),
    { nodes: 2, edges: 2, unresolvedImports: 0, multiRelationPairs: 1, collapseRisk: 1 }
  );
});

test('recusa grafo vazio, endpoints vazios, relações ausentes e confiança inválida', () => {
  assert.throws(() => validateGraphDocument({ nodes: [], edges: [] }));
  assert.throws(() => validateGraphDocument({ nodes: [{ id: 'a' }], edges: [{ source: 'a', target: '', relation: 'imports' }] }));
  assert.throws(() => validateGraphDocument({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }] }));
  assert.throws(() => validateGraphDocument({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b', relation: 'calls', confidence: 'CERTA' }] }));
});
