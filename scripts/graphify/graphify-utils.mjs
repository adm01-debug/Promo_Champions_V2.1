import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SECRET_PATTERNS = [
  /sbp_[A-Za-z0-9]{20,}/g,
  /sb_secret_[A-Za-z0-9_-]{15,}/g,
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
  /sk_(?:live|test)_[A-Za-z0-9]{16,}/gi,
  /re_[A-Za-z0-9]{20,}/gi,
  /AKIA[0-9A-Z]{16}/g,
  /(?:postgres(?:ql)?:\/\/)[^\s'"<>]+/gi,
  /\bBearer\s+[A-Za-z0-9._~+\/-]{12,}/gi,
];
const SENSITIVE_PATH = /(?:^|\/)(?:\.env(?:\.[^/]+)?|[^/]*\.(?:pem|key|p12|pfx|keystore))$/i;
const SENSITIVE_KEY = /(?:authorization|api[_-]?key|token|secret|password|credential|connection(?:_?string)?|access[_-]?key)/i;

const IMPORT_RELATIONS = new Set(['imports', 'imports_from', 'dynamic_import', 're_exports']);
const CONFIDENCE_LEVELS = new Set(['EXTRACTED', 'INFERRED', 'AMBIGUOUS']);

export function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export function parsePositiveInteger(value, flag, maximum = Number.MAX_SAFE_INTEGER) {
  if (!/^\d+$/.test(value ?? '')) throw new Error(`${flag} deve receber um inteiro positivo.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error(`${flag} deve receber um inteiro entre 1 e ${maximum}.`);
  }
  return parsed;
}

export function assertExactGraphifyVersion(output, expectedVersion) {
  const found = /^graphify\s+([0-9]+\.[0-9]+\.[0-9]+)\s*$/.exec(output.trim())?.[1];
  if (found !== expectedVersion) {
    throw new Error(`É exigido graphify ${expectedVersion}; versão encontrada: ${found ?? 'indisponível'}.`);
  }
}

export function redactSensitiveText(value, maximumLength = 2000) {
  const compact = Array.from(String(value ?? ''), character => {
    const code = character.codePointAt(0);
    return code !== undefined && code < 32 && ![9, 10, 13].includes(code) ? ' ' : character;
  }).join('');
  const redacted = SECRET_PATTERNS.reduce((text, pattern) => text.replace(pattern, '[REDACTED]'), compact);
  return redacted.slice(0, maximumLength);
}

export function sanitizeMetadata(value, key = '') {
  if (SENSITIVE_KEY.test(key)) return '[REDACTED]';
  if (typeof value === 'string') return redactSensitiveText(value, 500);
  if (Array.isArray(value)) return value.map(item => sanitizeMetadata(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, item]) => [childKey, sanitizeMetadata(item, childKey)]));
  }
  return value ?? null;
}

export function sanitizeError(error) {
  return redactSensitiveText(error instanceof Error ? error.message : String(error));
}

export function findSecretSignals(serialized) {
  return SECRET_PATTERNS.flatMap((pattern, index) => {
    pattern.lastIndex = 0;
    return pattern.test(serialized) ? [`padrão sensível ${index + 1}`] : [];
  });
}

export function assertSafeNewOutputPath(outputRoot, requestedPath) {
  const resolvedRoot = fs.realpathSync(outputRoot);
  const candidate = path.resolve(resolvedRoot, requestedPath);
  if (!isPathInside(resolvedRoot, candidate) || candidate === resolvedRoot) {
    throw new Error('--out deve apontar para um diretório novo dentro de .graphify-local/.');
  }
  const segments = path.relative(resolvedRoot, candidate).split(path.sep);
  let current = resolvedRoot;
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    if (!fs.existsSync(current)) continue;
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error('--out não pode atravessar link simbólico.');
    if (index === segments.length - 1) throw new Error('Já existe conteúdo neste --out; use um destino novo.');
    if (!stat.isDirectory()) throw new Error('--out possui um ancestral que não é diretório.');
  }
  return { resolvedRoot, candidate, relativePath: path.relative(resolvedRoot, candidate) };
}

export function createSafeOutputParents(resolvedRoot, relativePath) {
  let current = resolvedRoot;
  for (const segment of relativePath.split(path.sep).slice(0, -1)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) fs.mkdirSync(current);
    const stat = fs.lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink() || !isPathInside(resolvedRoot, fs.realpathSync(current))) {
      throw new Error('--out não pode atravessar link simbólico ou arquivo.');
    }
  }
}

export function createStagingDirectory(resolvedRoot) {
  const stagingRoot = path.join(resolvedRoot, '.staging');
  if (!fs.existsSync(stagingRoot)) fs.mkdirSync(stagingRoot);
  const stat = fs.lstatSync(stagingRoot);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Diretório de staging inválido.');
  const resolvedStagingRoot = fs.realpathSync(stagingRoot);
  if (!isPathInside(resolvedRoot, resolvedStagingRoot)) throw new Error('Diretório de staging fora de .graphify-local/.');
  const staging = fs.mkdtempSync(path.join(resolvedStagingRoot, 'run-'));
  if (!isPathInside(resolvedStagingRoot, fs.realpathSync(staging))) throw new Error('Diretório de staging inválido.');
  return staging;
}

export function assertSafeRegularTree(root) {
  const resolvedRoot = fs.realpathSync(root);
  const queue = [resolvedRoot];
  while (queue.length > 0) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      const stat = fs.lstatSync(entryPath);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) {
        throw new Error('Árvore contém link simbólico ou entrada especial.');
      }
      if (stat.isDirectory()) queue.push(entryPath);
    }
  }
}

function ignoredSourceEntry(name) {
  return name === 'node_modules' || name === 'graphify-out' || name === '.graphify-local';
}

export function inspectSourceScope(root, { maximumFileBytes = Number.MAX_SAFE_INTEGER, maximumTotalBytes = Number.MAX_SAFE_INTEGER } = {}) {
  const initial = fs.lstatSync(root);
  if (initial.isSymbolicLink()) throw new Error('Escopo não pode ser link simbólico.');
  if (initial.isFile() && SENSITIVE_PATH.test(root)) throw new Error('Escopo contém arquivo sensível e não pode ser analisado.');
  const queue = initial.isDirectory() ? [root] : [];
  const entries = initial.isFile() ? [root] : [];
  let totalBytes = initial.isFile() ? initial.size : 0;
  if (initial.isFile() && initial.size > maximumFileBytes) throw new Error(`Arquivo do escopo excede o limite de ${maximumFileBytes} bytes.`);
  if (!initial.isFile() && !initial.isDirectory()) throw new Error('Escopo deve ser arquivo regular ou diretório.');

  while (queue.length > 0) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (ignoredSourceEntry(entry.name)) continue;
      const entryPath = path.join(current, entry.name);
      const stat = fs.lstatSync(entryPath);
      if (stat.isSymbolicLink()) throw new Error(`Escopo contém link simbólico: ${entryPath}`);
      if (stat.isDirectory()) {
        queue.push(entryPath);
        continue;
      }
      if (!stat.isFile()) throw new Error(`Escopo contém entrada não regular: ${entryPath}`);
      if (SENSITIVE_PATH.test(entryPath)) throw new Error('Escopo contém arquivo sensível e não pode ser analisado.');
      if (stat.size > maximumFileBytes) throw new Error(`Arquivo do escopo excede o limite de ${maximumFileBytes} bytes.`);
      totalBytes += stat.size;
      if (totalBytes > maximumTotalBytes) throw new Error(`Escopo excede o limite total de ${maximumTotalBytes} bytes.`);
      entries.push(entryPath);
    }
  }
  return { files: entries.sort(), fileCount: entries.length, totalBytes };
}

export function digestFiles(root) {
  const digest = crypto.createHash('sha256');
  const { files } = inspectSourceScope(root);
  for (const entryPath of files) {
    digest.update(path.relative(root, entryPath));
    digest.update('\u0000');
    digest.update(fs.readFileSync(entryPath));
    digest.update('\u0000');
  }
  return digest.digest('hex');
}

export function digestValue(value) {
  const canonicalize = current => {
    if (Array.isArray(current)) return current.map(canonicalize);
    if (current && typeof current === 'object') {
      return Object.fromEntries(Object.keys(current).sort().map(key => [key, canonicalize(current[key])]));
    }
    return current;
  };
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function validateGraphShape(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) throw new Error('graph.json não contém um objeto JSON.');
  if (!Array.isArray(document.nodes) || !Array.isArray(document.edges)) throw new Error('graph.json deve conter arrays nodes e edges.');
  if (document.nodes.length === 0) throw new Error('graph.json não pode estar vazio.');
}

function collectNodeIds(nodes) {
  const nodeIds = new Set();
  for (const node of nodes) {
    if (!node || typeof node.id !== 'string' || node.id.trim().length === 0) throw new Error('graph.json contém nó sem id textual.');
    if (nodeIds.has(node.id)) throw new Error(`graph.json contém id de nó duplicado: ${node.id}`);
    nodeIds.add(node.id);
  }
  return nodeIds;
}

function validateEdgeShape(edge) {
  if (!edge || typeof edge.source !== 'string' || typeof edge.target !== 'string' || !edge.source.trim() || !edge.target.trim()) {
    throw new Error('graph.json contém aresta sem source/target textual.');
  }
  if (typeof edge.relation !== 'string' || !edge.relation.trim()) throw new Error('graph.json contém aresta sem relação declarada.');
  if (edge.confidence !== undefined && !CONFIDENCE_LEVELS.has(edge.confidence)) throw new Error('graph.json contém nível de confiança inválido.');
}

function resolveEdgeEndpoint(edge, nodeIds) {
  if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) return 'resolved';
  const isUnresolvedImport = nodeIds.has(edge.source) && IMPORT_RELATIONS.has(edge.relation);
  if (isUnresolvedImport) return 'unresolved-import';
  throw new Error('graph.json contém aresta com endpoint ausente.');
}

function collectEdgeStats(edges, nodeIds) {
  let unresolvedImports = 0;
  const edgeVariantsByEndpoint = new Map();

  for (const edge of edges) {
    validateEdgeShape(edge);
    if (resolveEdgeEndpoint(edge, nodeIds) === 'unresolved-import') {
      unresolvedImports += 1;
      continue;
    }
    const endpointKey = `${edge.source}\u0000${edge.target}`;
    const variantKey = `${edge.relation}\u0000${edge.context ?? ''}`;
    const variants = edgeVariantsByEndpoint.get(endpointKey) ?? new Set();
    variants.add(variantKey);
    edgeVariantsByEndpoint.set(endpointKey, variants);
  }

  return { unresolvedImports, edgeVariantsByEndpoint };
}

export function validateGraphDocument(document) {
  validateGraphShape(document);
  const nodeIds = collectNodeIds(document.nodes);
  const { unresolvedImports, edgeVariantsByEndpoint } = collectEdgeStats(document.edges, nodeIds);

  const multiRelationPairs = [...edgeVariantsByEndpoint.values()].filter(variants => variants.size > 1);
  return {
    nodes: document.nodes.length,
    edges: document.edges.length,
    unresolvedImports,
    multiRelationPairs: multiRelationPairs.length,
    collapseRisk: multiRelationPairs.reduce((total, variants) => total + variants.size - 1, 0),
  };
}
