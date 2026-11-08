import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const origem = path.resolve(process.argv[2] ?? process.cwd());
const graphifyReal = path.join(origem, 'tools/graphify/.venv/bin/graphify');
const versaoReal = spawnSync(graphifyReal, ['--version'], {encoding: 'utf8', timeout: 10000});
if (versaoReal.status !== 0 || versaoReal.stdout.trim() !== 'graphify 0.9.48') {
  throw new Error('Esta reprodução exige o runtime real Graphify 0.9.48 instalado na raiz informada.');
}
const { validateGraphDocument } = await import(pathToFileURL(path.join(origem, 'scripts/graphify/graphify-utils.mjs')));
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-graphify-audit-'));
const repo = path.join(base, 'repo');
fs.mkdirSync(path.join(repo, 'scripts/graphify'), { recursive: true });
for (const nome of ['extract-code-only.mjs', 'verify-output.mjs', 'graphify-utils.mjs']) {
  fs.copyFileSync(path.join(origem, 'scripts/graphify', nome), path.join(repo, 'scripts/graphify', nome));
}
spawnSync('git', ['init', '--quiet', repo]);
fs.mkdirSync(path.join(repo, 'src'));
fs.writeFileSync(path.join(repo, 'src/exemplo.ts'), 'export const exemplo = 1;\n');
const bin = path.join(base, 'graphify-simulado');
fs.writeFileSync(bin, `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
if (args.includes('--version')) {
  console.log('graphify ' + (process.env.AUDIT_VERSION || '0.9.48'));
  process.exit(0);
}
if (process.env.AUDIT_PRINT === '1') console.error('sb' + 'p_' + 'a'.repeat(40));
const out = args[args.indexOf('--out') + 1];
fs.mkdirSync(path.join(out, 'graphify-out'), { recursive: true });
fs.writeFileSync(path.join(out, 'graphify-out/graph.json'), JSON.stringify({nodes:[{id:'exemplo'}],edges:[]}));
`, { mode: 0o700 });
function executar(args, env = {}) {
  return spawnSync(process.execPath, [path.join(repo, 'scripts/graphify/extract-code-only.mjs'), '--scope', 'src', ...args], {
    cwd: repo, encoding: 'utf8', timeout: 10000,
    env: { ...process.env, GRAPHIFY_BIN: bin, ...env },
  });
}
const resultados = [];
function registrar(cenario, observado, esperado) {
  resultados.push({ cenario, observado, esperado, conforme: observado === esperado });
}
registrar('extração mínima simulada', executar(['--out', '.graphify-local/normal']).status, 0);
registrar('reutilização de snapshot completo', executar(['--out', '.graphify-local/normal']).status, 1);
registrar('versão 0.9.480 aceita por comparação parcial', executar(['--out', '.graphify-local/versao'], { AUDIT_VERSION: '0.9.480' }).status, 1);
const fora = path.join(base, 'destino-externo');
fs.mkdirSync(fora);
fs.symlinkSync(fora, path.join(repo, '.graphify-local/atalho'));
const escape = executar(['--out', '.graphify-local/atalho/geracao']);
registrar('link simbólico intermediário permite escrita externa', fs.existsSync(path.join(fora, 'geracao/graphify-out/graph.json')), false);
registrar('saída por link intermediário deve falhar', escape.status, 1);
fs.mkdirSync(path.join(repo, '.graphify-local/incompleto/graphify-out'), { recursive: true });
fs.writeFileSync(path.join(repo, '.graphify-local/incompleto/graphify-out/manifest.json'), '{}');
registrar('destino preexistente incompleto deve ser recusado', executar(['--out', '.graphify-local/incompleto']).status, 1);
for (const [cenario, grafo] of [
  ['grafo vazio', { nodes: [], edges: [] }],
  ['importação com destino vazio', { nodes: [{ id: 'a' }], edges: [{ source: 'a', target: '', relation: 'imports' }] }],
  ['aresta sem relação ou proveniência', { nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }] }],
]) {
  let aceito = true;
  try { validateGraphDocument(grafo); } catch { aceito = false; }
  registrar(cenario, aceito, false);
}
const saida = executar(['--out', '.graphify-local/saida'], { AUDIT_PRINT: '1' });
registrar('segredo sintético do subprocesso alcança stderr', saida.stderr.includes('sb' + 'p_' + 'a'.repeat(40)), false);
const jsonInvalido = path.join(base, 'invalido.json');
fs.writeFileSync(jsonInvalido, '{"dado":"SENTINELA_PRIVADA_AUDITORIA", invalido}');
const invalido = spawnSync(process.execPath, [path.join(repo, 'scripts/graphify/verify-output.mjs'), '--graph', jsonInvalido], { encoding: 'utf8' });
registrar('erro JSON reproduz conteúdo privado sintético no log', invalido.stderr.includes('SENTINELA_PRIVADA_AUDITORIA'), false);
const unicode = path.join(base, 'unicode.json');
fs.writeFileSync(unicode, JSON.stringify({nodes:[{id:'sb' + 'p_' + 'a'.repeat(40)}],edges:[]}).replace('sb' + 'p_', '\\u0073b' + 'p_'));
const codificado = spawnSync(process.execPath, [path.join(repo, 'scripts/graphify/verify-output.mjs'), '--graph', unicode], { encoding: 'utf8' });
registrar('segredo sintético codificado em escape Unicode deve ser recusado', codificado.status, 1);
const real = executar(['--out', '.graphify-local/atalho/extracao-real'], {GRAPHIFY_BIN: graphifyReal});
registrar('extração com Graphify real escreve além da raiz via link', fs.existsSync(path.join(fora, 'extracao-real/graphify-out/graph.json')), false);
registrar('wrapper com Graphify real deveria recusar link externo', real.status, 1);
console.log(JSON.stringify({ baseTemporaria: base, resultados }, null, 2));
process.exitCode = resultados.some(resultado => !resultado.conforme) ? 1 : 0;
