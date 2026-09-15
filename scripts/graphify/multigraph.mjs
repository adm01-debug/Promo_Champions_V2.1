import crypto from 'node:crypto';

const UNRESOLVED_IMPORT_RELATIONS = new Set(['imports', 'imports_from', 'dynamic_import', 're_exports']);

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function edgeSignature(edge) {
  return [edge.source, edge.target, edge.relation, edge.context ?? '', edge.source_file ?? '', edge.source_location ?? '', edge.confidence ?? '', edge._origin ?? ''];
}

function compareArrays(left, right) {
  return left.join('\u0000').localeCompare(right.join('\u0000'));
}

export function createMultiGraphDocument(graph) {
  const nodes = graph.nodes.map(node => ({
    id: node.id,
    label: node.label ?? node.id,
    kind: node.file_type ?? 'code',
    provenance: {
      sourceFile: node.source_file ?? null,
      sourceLocation: node.source_location ?? null,
      origin: node._origin ?? null,
    },
  }));
  const nodeIds = new Set(nodes.map(node => node.id));
  const externalIds = new Set();
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.target) && UNRESOLVED_IMPORT_RELATIONS.has(edge.relation)) externalIds.add(edge.target);
  }
  for (const id of [...externalIds].sort()) {
    nodes.push({
      id,
      label: id,
      kind: 'external_reference',
      provenance: { sourceFile: null, sourceLocation: null, origin: 'graphify_unresolved_import' },
    });
    nodeIds.add(id);
  }

  const occurrences = new Map();
  const edges = graph.edges
    .map(edge => ({ edge, signature: edgeSignature(edge) }))
    .sort((left, right) => compareArrays(left.signature, right.signature))
    .map(({ edge, signature }) => {
      const key = signature.join('\u0000');
      const occurrence = occurrences.get(key) ?? 0;
      occurrences.set(key, occurrence + 1);
      return {
        id: `edge_${stableHash({ signature, occurrence }).slice(0, 24)}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
        context: edge.context ?? null,
        confidence: edge.confidence ?? 'AMBIGUOUS',
        provenance: {
          sourceFile: edge.source_file ?? null,
          sourceLocation: edge.source_location ?? null,
          origin: edge._origin ?? null,
        },
      };
    });

  return {
    schemaVersion: 1,
    directed: true,
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    edges,
    sourceGraph: { nodes: graph.nodes.length, edges: graph.edges.length },
  };
}

function validateMultiGraphShape(document) {
  if (!document || document.schemaVersion !== 1 || document.directed !== true || !Array.isArray(document.nodes) || !Array.isArray(document.edges)) {
    throw new Error('multigraph.json não atende ao esquema suportado.');
  }
}

function collectMultiGraphNodeIds(nodes) {
  const nodeIds = new Set();
  for (const node of nodes) {
    if (!node || typeof node.id !== 'string' || !node.id || nodeIds.has(node.id)) throw new Error('multigraph.json contém nó inválido ou duplicado.');
    nodeIds.add(node.id);
  }
  return nodeIds;
}

function validateMultiGraphEdges(edges, nodeIds) {
  const edgeIds = new Set();
  for (const edge of edges) {
    if (!edge || typeof edge.id !== 'string' || !edge.id || edgeIds.has(edge.id)) throw new Error('multigraph.json contém aresta inválida ou duplicada.');
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target) || typeof edge.relation !== 'string' || !edge.relation) {
      throw new Error('multigraph.json contém relação sem endpoints ou tipo válido.');
    }
    edgeIds.add(edge.id);
  }
}

export function validateMultiGraphDocument(document) {
  validateMultiGraphShape(document);
  const nodeIds = collectMultiGraphNodeIds(document.nodes);
  validateMultiGraphEdges(document.edges, nodeIds);
  if (document.sourceGraph?.edges !== document.edges.length) throw new Error('multigraph.json perdeu relações da fonte.');
  return { nodes: document.nodes.length, edges: document.edges.length };
}

export function findPotentialImpact(document, changedNodeIds) {
  validateMultiGraphDocument(document);
  const changed = new Set(changedNodeIds);
  const reverse = new Map();
  const ambiguous = [];
  for (const edge of document.edges) {
    const dependents = reverse.get(edge.target) ?? [];
    dependents.push(edge);
    reverse.set(edge.target, dependents);
    if (edge.relation === 'dynamic_import' || edge.confidence !== 'EXTRACTED') ambiguous.push(edge.id);
  }
  const impacted = new Set(changed);
  const queue = [...changed];
  const evidence = [];
  while (queue.length > 0) {
    const target = queue.shift();
    for (const edge of reverse.get(target) ?? []) {
      evidence.push(edge.id);
      if (!impacted.has(edge.source)) {
        impacted.add(edge.source);
        queue.push(edge.source);
      }
    }
  }
  return {
    changed: [...changed].sort(),
    impacted: [...impacted].sort(),
    evidence: [...new Set(evidence)].sort(),
    limitations: ambiguous.length > 0 ? ['Há relações dinâmicas ou inferidas; a análise é conservadora e não reduz a suíte obrigatória.'] : [],
  };
}
