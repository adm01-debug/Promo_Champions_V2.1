#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { isPathInside, parsePositiveInteger } from './graphify-utils.mjs';

const DEFAULT_VERSION = '0.9.48';
const LARGE_SCOPE_LIMIT = 500;

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
    if (!optionsWithoutValue.has(argument)) {
      fail(`Opção não reconhecida: ${argument}`);
    }
  }
}

function findRepositoryRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  if (result.status !== 0) fail('Execute o comando dentro de um repositório Git.');
  return fs.realpathSync(result.stdout.trim());
}

function countFiles(directory) {
  let total = 0;
  const queue = [directory];
  while (queue.length > 0) {
    const current = queue.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'graphify-out' || entry.name === '.graphify-local') {
        continue;
      }
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(entryPath);
      if (entry.isFile()) total += 1;
    }
  }
  return total;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) fail(`Não foi possível executar ${command}: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} terminou com código ${result.status}.`);
}

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
  if (!isPathInside(repositoryRoot, resolvedScope)) {
    fail('--scope não pode atravessar link simbólico para fora do repositório.');
  }

  const outputArgument = optionValue(args, '--out') ?? `.graphify-local/${path.basename(resolvedScope)}`;
  const requestedOutputPath = path.resolve(repositoryRoot, outputArgument);
  const allowedOutputRoot = path.join(repositoryRoot, '.graphify-local');
  if (!isPathInside(allowedOutputRoot, requestedOutputPath)) {
    fail('--out deve ficar dentro de .graphify-local/.');
  }

  fs.mkdirSync(allowedOutputRoot, { recursive: true });
  const resolvedOutputRoot = fs.realpathSync(allowedOutputRoot);
  if (!isPathInside(repositoryRoot, resolvedOutputRoot)) {
    fail('.graphify-local não pode ser link simbólico para fora do repositório.');
  }
  const outputPath = path.resolve(resolvedOutputRoot, path.relative(allowedOutputRoot, requestedOutputPath));
  if (!isPathInside(resolvedOutputRoot, outputPath)) {
    fail('--out não pode atravessar .graphify-local/.');
  }
  const graphPath = path.join(outputPath, 'graphify-out', 'graph.json');
  if (fs.existsSync(graphPath)) {
    fail('Já existe snapshot neste --out; use um destino novo. Atualização incremental será habilitada somente após o gate de integridade.');
  }

  const maxWorkers = parsePositiveInteger(optionValue(args, '--max-workers') ?? '1', '--max-workers');
  const fileCount = fs.statSync(resolvedScope).isDirectory() ? countFiles(resolvedScope) : 1;
  if (fileCount > LARGE_SCOPE_LIMIT && !args.includes('--allow-large-scope')) {
    fail(`Escopo possui ${fileCount} arquivos; particione-o ou confirme --allow-large-scope.`);
  }

  const graphifyBinary = process.env.GRAPHIFY_BIN || 'graphify';
  const expectedVersion = optionValue(args, '--expected-version') ?? DEFAULT_VERSION;
  const version = spawnSync(graphifyBinary, ['--version'], { encoding: 'utf8' });
  if (version.status !== 0 || !version.stdout.includes(`graphify ${expectedVersion}`)) {
    fail(`É exigido graphify ${expectedVersion}; versão encontrada: ${(version.stdout || version.stderr || 'indisponível').trim()}`);
  }

  fs.mkdirSync(outputPath, { recursive: true });
  run(graphifyBinary, [
    'extract',
    resolvedScope,
    '--code-only',
    '--no-cluster',
    '--out',
    outputPath,
    '--max-workers',
    String(maxWorkers),
  ]);

  run(process.execPath, [path.join(repositoryRoot, 'scripts/graphify/verify-output.mjs'), '--graph', graphPath]);
  console.info(`Snapshot estrutural pronto em ${path.relative(repositoryRoot, graphPath)}.`);
} catch (error) {
  console.error(`Extração Graphify recusada: ${error.message}`);
  process.exitCode = 1;
}
