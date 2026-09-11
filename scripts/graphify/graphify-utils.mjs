import path from 'node:path';

const SECRET_PATTERNS = [
  /sbp_[A-Za-z0-9]{20,}/,
  /sb_secret_[A-Za-z0-9_-]{15,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
];

const IMPORT_RELATIONS = new Set(['imports', 'imports_from', 'dynamic_import', 're_exports']);

export function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export function parsePositiveInteger(value, flag) {
  if (!/^\d+$/.test(value ?? '')) {
    throw new Error(`${flag} deve receber um inteiro positivo.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${flag} deve receber um inteiro positivo.`);
  }

  return parsed;
}

export function validateGraphDocument(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('graph.json não contém um objeto JSON.');
  }

  if (!Array.isArray(document.nodes) || !Array.isArray(document.edges)) {
    throw new Error('graph.json deve conter arrays nodes e edges.');
  }

  const nodeIds = new Set();
  for (const node of document.nodes) {
    if (!node || typeof node.id !== 'string' || node.id.length === 0) {
      throw new Error('graph.json contém nó sem id textual.');
    }
    if (nodeIds.has(node.id)) {
      throw new Error(`graph.json contém id de nó duplicado: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  let unresolvedImports = 0;
  const edgeVariantsByEndpoint = new Map();
  for (const edge of document.edges) {
    if (!edge || typeof edge.source !== 'string' || typeof edge.target !== 'string') {
      throw new Error('graph.json contém aresta sem source/target textual.');
    }
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      const isUnresolvedImport = nodeIds.has(edge.source) && IMPORT_RELATIONS.has(edge.relation);
      if (isUnresolvedImport) {
        unresolvedImports += 1;
        continue;
      }
      throw new Error('graph.json contém aresta com endpoint ausente.');
    }

    const endpointKey = `${edge.source}\u0000${edge.target}`;
    const variantKey = `${edge.relation ?? ''}\u0000${edge.context ?? ''}`;
    const variants = edgeVariantsByEndpoint.get(endpointKey) ?? new Set();
    variants.add(variantKey);
    edgeVariantsByEndpoint.set(endpointKey, variants);
  }

  const multiRelationPairs = [...edgeVariantsByEndpoint.values()].filter(
    variants => variants.size > 1
  );
  const collapseRisk = multiRelationPairs.reduce((total, variants) => total + variants.size - 1, 0);

  return {
    nodes: document.nodes.length,
    edges: document.edges.length,
    unresolvedImports,
    multiRelationPairs: multiRelationPairs.length,
    collapseRisk,
  };
}

export function findSecretSignals(serialized) {
  return SECRET_PATTERNS.flatMap((pattern, index) =>
    pattern.test(serialized) ? [`padrão sensível ${index + 1}`] : []
  );
}
