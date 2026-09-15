import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const scriptsRoot = path.dirname(new URL(import.meta.url).pathname);

function createFixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-graphify-test-'));
  const repository = path.join(base, 'repo');
  fs.mkdirSync(path.join(repository, 'scripts', 'graphify'), { recursive: true });
  fs.mkdirSync(path.join(repository, 'src'));
  fs.writeFileSync(path.join(repository, 'src', 'exemplo.ts'), 'export const exemplo = 1;\n');
  for (const file of ['extract-code-only.mjs', 'graphify-utils.mjs', 'multigraph.mjs', 'verify-output.mjs']) {
    fs.copyFileSync(path.join(scriptsRoot, file), path.join(repository, 'scripts', 'graphify', file));
  }
  execFileSync('git', ['init', '--quiet'], { cwd: repository });
  execFileSync('git', ['add', '.'], { cwd: repository });
  execFileSync('git', ['-c', 'user.name=Teste', '-c', 'user.email=teste@example.invalid', 'commit', '--quiet', '-m', 'teste'], { cwd: repository });
  const binary = path.join(base, 'graphify-simulado.mjs');
  fs.writeFileSync(binary, `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
if (args.includes('--version')) {
  console.log('graphify ' + (process.env.GRAPHIFY_FIXTURE_VERSION || '0.9.48'));
  process.exit(0);
}
if (process.env.GRAPHIFY_FIXTURE_ERROR === '1') {
  console.error('sb' + 'p_' + 'a'.repeat(40));
  process.exit(2);
}
if (process.env.GRAPHIFY_FIXTURE_MUTATE_SOURCE === '1') {
  fs.appendFileSync(path.join(args[1], 'exemplo.ts'), '// alteração concorrente\\n');
}
const output = args[args.indexOf('--out') + 1];
fs.mkdirSync(path.join(output, 'graphify-out'), { recursive: true });
fs.writeFileSync(path.join(output, 'graphify-out', 'graph.json'), process.env.GRAPHIFY_FIXTURE_GRAPH || JSON.stringify({ nodes: [{ id: 'modulo' }], edges: [] }));
`);
  fs.chmodSync(binary, 0o700);
  return { base, repository, binary };
}

function execute(fixture, args, extraEnvironment = {}) {
  return spawnSync(process.execPath, [path.join(fixture.repository, 'scripts/graphify/extract-code-only.mjs'), '--scope', 'src', ...args], {
    cwd: fixture.repository,
    encoding: 'utf8',
    env: { ...process.env, GRAPHIFY_BIN: fixture.binary, ...extraEnvironment },
  });
}

test('publica somente snapshot validado com metadados de origem', () => {
  const fixture = createFixture();
  const result = execute(fixture, ['--out', '.graphify-local/normal']);
  assert.equal(result.status, 0, result.stderr);
  const destination = path.join(fixture.repository, '.graphify-local', 'normal');
  assert.equal(fs.existsSync(path.join(destination, 'graphify-out', 'graph.json')), true);
  assert.equal(fs.existsSync(path.join(destination, 'multigraph.json')), true);
  const snapshot = JSON.parse(fs.readFileSync(path.join(destination, 'snapshot.json'), 'utf8'));
  assert.equal(snapshot.extractor.version, '0.9.48');
  assert.equal(snapshot.source.scope, 'src');
  assert.equal(snapshot.source.totalBytes, Buffer.byteLength('export const exemplo = 1;\n'));
  assert.match(snapshot.source.digest, /^[a-f0-9]{64}$/);
  assert.equal(snapshot.multigraph.edges, 0);
});

test('aceita escopo de arquivo regular e registra uma única entrada', () => {
  const fixture = createFixture();
  const result = spawnSync(process.execPath, [path.join(fixture.repository, 'scripts/graphify/extract-code-only.mjs'), '--scope', 'src/exemplo.ts', '--out', '.graphify-local/arquivo'], {
    cwd: fixture.repository,
    encoding: 'utf8',
    env: { ...process.env, GRAPHIFY_BIN: fixture.binary },
  });
  assert.equal(result.status, 0, result.stderr);
  const snapshot = JSON.parse(fs.readFileSync(path.join(fixture.repository, '.graphify-local', 'arquivo', 'snapshot.json'), 'utf8'));
  assert.equal(snapshot.source.fileCount, 1);
});

test('recusa link simbólico intermediário antes de criar saída externa', () => {
  const fixture = createFixture();
  const external = path.join(fixture.base, 'externo');
  fs.mkdirSync(external);
  fs.mkdirSync(path.join(fixture.repository, '.graphify-local'));
  fs.symlinkSync(external, path.join(fixture.repository, '.graphify-local', 'atalho'));
  const result = execute(fixture, ['--out', '.graphify-local/atalho/saida']);
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(path.join(external, 'saida', 'graphify-out', 'graph.json')), false);
});

test('recusa link simbólico aninhado no escopo antes de chamar o extrator', () => {
  const fixture = createFixture();
  const external = path.join(fixture.base, 'externo.ts');
  fs.writeFileSync(external, 'export const externo = 1;\n');
  fs.symlinkSync(external, path.join(fixture.repository, 'src', 'atalho.ts'));
  const result = execute(fixture, ['--out', '.graphify-local/symlink-aninhado']);
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(path.join(fixture.repository, '.graphify-local', 'symlink-aninhado')), false);
});

test('não publica snapshot se o escopo muda durante a extração', () => {
  const fixture = createFixture();
  const result = execute(fixture, ['--out', '.graphify-local/concorrente'], { GRAPHIFY_FIXTURE_MUTATE_SOURCE: '1' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /mudou durante a extração/);
  assert.equal(fs.existsSync(path.join(fixture.repository, '.graphify-local', 'concorrente')), false);
});

test('recusa quando a própria raiz de saídas é link simbólico externo', () => {
  const fixture = createFixture();
  const external = path.join(fixture.base, 'externo');
  fs.mkdirSync(external);
  fs.symlinkSync(external, path.join(fixture.repository, '.graphify-local'));
  const result = execute(fixture, ['--out', '.graphify-local/saida']);
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(path.join(external, 'saida', 'graphify-out', 'graph.json')), false);
});

test('recusa destino incompleto e versão apenas parcialmente igual', () => {
  const fixture = createFixture();
  fs.mkdirSync(path.join(fixture.repository, '.graphify-local', 'incompleto', 'graphify-out'), { recursive: true });
  fs.writeFileSync(path.join(fixture.repository, '.graphify-local', 'incompleto', 'graphify-out', 'manifest.json'), '{}');
  assert.notEqual(execute(fixture, ['--out', '.graphify-local/incompleto']).status, 0);
  assert.notEqual(execute(fixture, ['--out', '.graphify-local/versao'], { GRAPHIFY_FIXTURE_VERSION: '0.9.480' }).status, 0);
});

test('não publica grafo vazio e redige erro sensível do subprocesso', () => {
  const fixture = createFixture();
  const empty = execute(fixture, ['--out', '.graphify-local/vazio'], { GRAPHIFY_FIXTURE_GRAPH: JSON.stringify({ nodes: [], edges: [] }) });
  assert.notEqual(empty.status, 0);
  assert.equal(fs.existsSync(path.join(fixture.repository, '.graphify-local', 'vazio')), false);
  const failed = execute(fixture, ['--out', '.graphify-local/falha'], { GRAPHIFY_FIXTURE_ERROR: '1' });
  assert.notEqual(failed.status, 0);
  assert.doesNotMatch(failed.stderr, /sbp_[A-Za-z0-9]{20,}/);
  assert.match(failed.stderr, /\[REDACTED\]/);
});

test('verificador detecta segredo que só aparece após decodificar JSON', () => {
  const fixture = createFixture();
  const graph = path.join(fixture.base, 'codificado.json');
  fs.writeFileSync(graph, '{"nodes":[{"id":"\\u0073bp_abcdefghijklmnopqrstuv"}],"edges":[]}');
  const result = spawnSync(process.execPath, [path.join(fixture.repository, 'scripts/graphify/verify-output.mjs'), '--graph', graph], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stderr, /sbp_[A-Za-z0-9]{20,}/);
});
