#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import {
  assertExactGraphifyVersion,
  assertSafeNewOutputPath,
  createSafeOutputParents,
  createStagingDirectory,
  digestFiles,
  digestValue,
  isPathInside,
  parsePositiveInteger,
  redactSensitiveText,
} from './graphify-utils.mjs';
import { createMultiGraphDocument, validateMultiGraphDocument } from './multigraph.mjs';

const DEFAULT_VERSION = '0.9.48';
const LARGE_SCOPE_LIMIT = 500;
const MAX_WORKERS = 8;
const COMMAND_TIMEOUT_MS = 120_000;

function fail(message) {
  throw new Error(message);
}

function optionValue(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) fail(`${flag} exige um valor.`);
  return value;
}

function assertKnownOptions(args) {
  const optionsWithValue = new Set(['--scope', '--out', '--max-workers', '--expected-version']);
  const optionsWithoutValue = new Set(['--allow-large-scope']);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (optionsWithValue.has(argument)) {
      index += 1;
      continue;
    }
    if (!optionsWithoutValue.has(argument)) fail(`Opção não reconhecida: ${argument}`);
  }
}

function findRepositoryRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: process.cwd(), encoding: 'utf8' });
  if (result.status !== 0) fail('Execute o comando dentro de um repositório Git.');
  return fs.realpathSync(result.stdout.trim());
}

function gitHead(repositoryRoot) {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.status !== 0) fail('Não foi possível identificar o commit atual.');
  return result.stdout.trim();
}

function countFiles(directory) {
  let total = 0;
  const queue = [directory];
  while (queue.length > 0) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'graphify-out' || entry.name === '.graphify-local') continue;
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(entryPath);
      if (entry.isFile()) total += 1;
    }
  }
  return total;
}

function run(command, args, label) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    timeout: COMMAND_TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
  });
  if (result.error) {
    if (result.error.code === 'ETIMEDOUT') fail(`${label} excedeu o limite de ${COMMAND_TIMEOUT_MS / 1000}s.`);
    fail(`Não foi possível executar ${label}: ${redactSensitiveText(result.error.message)}.`);
  }
  if (result.status !== 0) {
    const detail = redactSensitiveText(`${result.stdout ?? ''}\n${result.stderr ?? ''}`).trim();
    fail(`${label} terminou com código ${result.status}.${detail ? ` Detalhe sanitizado: ${detail}` : ''}`);
  }
  return result;
}

function removeStaging(stagingPath, outputRoot) {
  if (!stagingPath || !fs.existsSync(stagingPath)) return;
  const resolvedRoot = fs.realpathSync(outputRoot);
  const resolvedStaging = fs.realpathSync(stagingPath);
  if (isPathInside(path.join(resolvedRoot, '.staging'), resolvedStaging)) {
    fs.rmSync(resolvedStaging, { recursive: true, force: true });
  }
}

let stagingPath;
let outputRoot;
try {
  const args = process.argv.slice(2);
  assertKnownOptions(args);
  const scopeArgument = optionValue(args, '--scope');
  if (!scopeArgument) fail('Informe --scope <diretório-ou-arquivo-relativo>.');

  const repositoryRoot = findRepositoryRoot();
  const scopePath = path.resolve(repositoryRoot, scopeArgument);
  if (!isPathInside(repositoryRoot, scopePath) || !fs.existsSync(scopePath)) {
    fail('--scope deve existir e permanecer dentro do repositório.');
  }
  const resolvedScope = fs.realpathSync(scopePath);
  if (!isPathInside(repositoryRoot, resolvedScope)) fail('--scope não pode atravessar link simbólico para fora do repositório.');

  const outputArgument = optionValue(args, '--out') ?? `.graphify-local/${path.basename(resolvedScope)}`;
  const requestedOutputPath = path.resolve(repositoryRoot, outputArgument);
  outputRoot = path.join(repositoryRoot, '.graphify-local');
  fs.mkdirSync(outputRoot, { recursive: true });
  const outputPlan = assertSafeNewOutputPath(outputRoot, requestedOutputPath);
  if (!isPathInside(repositoryRoot, outputPlan.resolvedRoot)) {
    fail('.graphify-local não pode ser link simbólico para fora do repositório.');
  }
  outputRoot = outputPlan.resolvedRoot;

  const maxWorkers = parsePositiveInteger(optionValue(args, '--max-workers') ?? '1', '--max-workers', MAX_WORKERS);
  const fileCount = fs.statSync(resolvedScope).isDirectory() ? countFiles(resolvedScope) : 1;
  if (fileCount > LARGE_SCOPE_LIMIT && !args.includes('--allow-large-scope')) {
    fail(`Escopo possui ${fileCount} arquivos; particione-o ou confirme --allow-large-scope.`);
  }

  const graphifyBinary = process.env.GRAPHIFY_BIN || 'graphify';
  const expectedVersion = optionValue(args, '--expected-version') ?? DEFAULT_VERSION;
  const version = run(graphifyBinary, ['--version'], 'verificação de versão do Graphify');
  assertExactGraphifyVersion(version.stdout, expectedVersion);

  createSafeOutputParents(outputPlan.resolvedRoot, outputPlan.relativePath);
  stagingPath = createStagingDirectory(outputPlan.resolvedRoot);
  const graphPath = path.join(stagingPath, 'graphify-out', 'graph.json');
  run(graphifyBinary, [
    'extract', resolvedScope, '--code-only', '--no-cluster', '--out', stagingPath,
    '--max-workers', String(maxWorkers),
  ], 'extração Graphify');
  run(process.execPath, [path.join(repositoryRoot, 'scripts/graphify/verify-output.mjs'), '--graph', graphPath], 'validação do snapshot');
  const multigraph = createMultiGraphDocument(JSON.parse(fs.readFileSync(graphPath, 'utf8')));
  validateMultiGraphDocument(multigraph);
  fs.writeFileSync(path.join(stagingPath, 'multigraph.json'), `${JSON.stringify(multigraph, null, 2)}\n`, { mode: 0o600 });

  const metadata = {
    schemaVersion: 1,
    source: {
      commit: gitHead(repositoryRoot),
      scope: path.relative(repositoryRoot, resolvedScope),
      fileCount,
      digest: digestFiles(resolvedScope),
    },
    extractor: { name: 'graphify', version: expectedVersion, mode: 'code-only' },
    multigraph: { schemaVersion: multigraph.schemaVersion, edges: multigraph.edges.length, digest: digestValue(multigraph) },
    configurationDigest: digestValue({ expectedVersion, maxWorkers, largeScopeLimit: LARGE_SCOPE_LIMIT }),
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(stagingPath, 'snapshot.json'), `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(stagingPath, outputPlan.candidate);
  stagingPath = undefined;
  console.info(`Snapshot estrutural pronto em ${path.relative(repositoryRoot, path.join(outputPlan.candidate, 'graphify-out', 'graph.json'))}.`);
} catch (error) {
  console.error(`Extração Graphify recusada: ${redactSensitiveText(error.message)}.`);
  process.exitCode = 1;
} finally {
  if (outputRoot) removeStaging(stagingPath, outputRoot);
}
