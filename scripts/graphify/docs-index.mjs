#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeNewOutputPath, createSafeOutputParents, digestFiles, isPathInside } from './graphify-utils.mjs';

function walkMarkdown(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Documentação contém link simbólico: ${entryPath}`);
    if (entry.isDirectory()) files.push(...walkMarkdown(entryPath));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
  }
  return files.sort();
}

function classifyDocument(relativePath, content) {
  if (/\b(hist[oó]ric|legad|arquivad)/i.test(relativePath) || /\b(hist[oó]ric|legad|arquivad)/i.test(content.slice(0, 800))) return 'historico';
  if (relativePath.startsWith('docs/planos/') || /\b(plano execut[aá]vel|proposta)/i.test(content.slice(0, 800))) return 'proposta';
  if (relativePath.startsWith('docs/decisions/')) return 'decisao';
  return 'operacional';
}

function markdownLinks(content) {
  const links = [];
  const expression = /\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  let match;
  while ((match = expression.exec(content)) !== null) links.push({ target: match[1], index: match.index });
  return links;
}

function lineAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function resolveLink(repositoryRoot, sourceFile, rawTarget) {
  if (/^(?:https?:|mailto:|#)/i.test(rawTarget)) return { kind: 'externo', target: rawTarget };
  const [targetPath, fragment] = rawTarget.split('#', 2);
  if (!targetPath) return { kind: 'ancora_local', target: rawTarget };
  const resolved = path.resolve(path.dirname(sourceFile), targetPath);
  if (!isPathInside(repositoryRoot, resolved)) return { kind: 'fora_do_repositorio', target: rawTarget };
  return { kind: fs.existsSync(resolved) ? 'local' : 'ausente', target: path.relative(repositoryRoot, resolved), fragment: fragment ?? null };
}

export function indexDocuments(repositoryRoot, documentsDirectory = path.join(repositoryRoot, 'docs')) {
  const resolvedRoot = fs.realpathSync(repositoryRoot);
  const resolvedDocs = fs.realpathSync(documentsDirectory);
  if (!isPathInside(resolvedRoot, resolvedDocs)) throw new Error('Diretório de documentação fora do repositório.');
  const documents = walkMarkdown(resolvedDocs).map(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(resolvedRoot, file);
    return { id: `documento:${relativePath}`, path: relativePath, classification: classifyDocument(relativePath, content), content, digest: digestFiles(file) };
  });
  const links = documents.flatMap(document => markdownLinks(document.content).map(link => ({
    source: document.id,
    line: lineAt(document.content, link.index),
    ...resolveLink(resolvedRoot, path.join(resolvedRoot, document.path), link.target),
  })));
  return {
    schemaVersion: 1,
    documents: documents.map(({ content, ...document }) => document),
    links,
    limitations: ['O índice representa somente links Markdown explícitos. Texto livre, referências por convenção e links externos não comprovam implementação ou atualidade.'],
  };
}

function argument(flag) {
  const index = process.argv.indexOf(flag);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith('--')) throw new Error(`${flag} é obrigatório.`);
  return value;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const root = fs.realpathSync(process.cwd());
    const docs = path.resolve(root, argument('--docs'));
    const outputRoot = path.join(root, '.graphify-local');
    fs.mkdirSync(outputRoot, { recursive: true });
    const outputPlan = assertSafeNewOutputPath(outputRoot, path.resolve(root, argument('--out')));
    if (!isPathInside(root, outputPlan.resolvedRoot) || path.extname(outputPlan.candidate) !== '.json') throw new Error('--out deve ser JSON novo dentro de .graphify-local/.');
    createSafeOutputParents(outputPlan.resolvedRoot, outputPlan.relativePath);
    const index = indexDocuments(root, docs);
    fs.writeFileSync(outputPlan.candidate, `${JSON.stringify(index, null, 2)}\n`, { mode: 0o600 });
    const missing = index.links.filter(link => link.kind === 'ausente').length;
    console.info(`Índice documental pronto: ${index.documents.length} documentos, ${index.links.length} links e ${missing} referências locais ausentes.`);
  } catch (error) {
    console.error(`Índice documental recusado: ${error.message}`);
    process.exitCode = 1;
  }
}
