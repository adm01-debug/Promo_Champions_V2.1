#!/usr/bin/env node
// Todo pin de Action (`owner/repo@<sha40> # vX.Y.Z`) precisa ser o commit REAL da tag
// declarada no comentário.
//
// Este check confere se o SHA EXISTE e é o commit da tag declarada; o formato do pin
// (40 hex, repositório autorizado) não é coberto por nenhum guard neste repo ainda. Em 15/10/2026 o scorecard.yml estava com dois pins
// inexistentes desde o lote #1942: `ossf/scorecard-action@f49aabe0…75b3f07db4`
// (o real da v2.4.1 é `f49aabe0…75731b0186` — 32 caracteres iguais, 8 inventados)
// e `github/codeql-action@60168efe…`. O workflow falhava no "Set up job" em todo
// push e nunca produziu um score. Este check fecha essa classe de erro.
//
// Verificação: `git ls-remote --tags https://github.com/<owner>/<repo> vX.Y.Z vX.Y.Z^{}`
// (sem token, um processo por pin único). O SHA tem de ser o commit apontado pela
// tag (o `^{}` quando a tag é anotada). Pin sem comentário de versão reprova: sem
// ele não há o que conferir.

import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolverExecutavel } from '../lib/seguranca-processo.mjs';

// Ancorado na linha e no escalar YAML: um `uses:` citado dentro de `run: |`, de uma
// string `name:` ou de uma linha inteiramente comentada NAO e um pin do workflow, e
// contar esses casos reprovaria o CI por um pin que nao existe. O valor pode vir entre
// aspas (YAML valido que o Actions aceita), e o SHA pode estar em maiusculas.
const LINHA_USES = /^\s*(?:-\s*)?(?:uses|["']uses["'])\s*:\s*(.*)$/u;
const ESCALAR = /^(?:'([^']*)'|"([^"]*)"|([^\s#'"]+))\s*(?:#\s*(.*?)\s*)?$/u;
const REF = /^([\w.-]+\/[\w.-]+)(?:\/[^@\s]+)?@([0-9a-fA-F]{40})$/u;

/** Pin de um `uses:`, ou null quando a linha nao e um pin por SHA. */
export function lerPinDaLinha(linha) {
  const uses = linha.match(LINHA_USES);
  if (!uses) return null;
  const escalar = uses[1].trim().match(ESCALAR);
  if (!escalar) return null;
  const referencia = escalar[1] ?? escalar[2] ?? escalar[3];
  const comentario = (escalar[4] ?? '').trim();
  if (!referencia || referencia.startsWith('./') || referencia.startsWith('docker://')) return null;
  const ref = referencia.match(REF);
  if (!ref) return null;
  const tag = comentario ? comentario.split(/\s+/u)[0] : null;
  return { repo: ref[1], sha: ref[2].toLowerCase(), tag: tag || null };
}

export function coletarPins(arquivos) {
  const unicos = new Map();
  for (const [nome, texto] of arquivos) {
    for (const linha of texto.replace(/\r\n?/gu, '\n').split('\n')) {
      // Linha 100% comentada nao define um `uses:` do workflow.
      if (/^\s*#/u.test(linha)) continue;
      const pin = lerPinDaLinha(linha);
      if (!pin) continue;
      const chave = `${pin.repo}@${pin.sha}#${pin.tag ?? ''}`;
      if (!unicos.has(chave)) unicos.set(chave, { ...pin, arquivos: new Set() });
      unicos.get(chave).arquivos.add(nome);
    }
  }
  return [...unicos.values()];
}

// Saída do ls-remote → SHA do commit da tag (peeled se anotada; o próprio se leve).
export function commitDaTag(saida, tag) {
  let leve = null;
  let peeled = null;
  for (const linha of saida.split('\n')) {
    const [sha, ref] = linha.trim().split(/\s+/);
    if (ref === `refs/tags/${tag}^{}`) peeled = sha;
    else if (ref === `refs/tags/${tag}`) leve = sha;
  }
  return peeled ?? leve;
}

export async function verificarPins(pins, lsRemote) {
  const problemas = [];
  for (const pin of pins) {
    const onde = [...pin.arquivos].sort((a, b) => a.localeCompare(b)).join(', ');
    if (!pin.tag) {
      problemas.push(`${pin.repo}@${pin.sha} (${onde}): pin sem comentário "# vX.Y.Z" — não há tag para conferir`);
      continue;
    }
    let saida;
    try {
      saida = await lsRemote(pin.repo, pin.tag);
    } catch (erro) {
      problemas.push(`${pin.repo} ${pin.tag} (${onde}): não foi possível consultar a tag (${erro.message})`);
      continue;
    }
    const real = commitDaTag(saida, pin.tag);
    if (!real) problemas.push(`${pin.repo} ${pin.tag} (${onde}): a tag não existe no repositório da Action`);
    else if (real !== pin.sha) problemas.push(`${pin.repo} ${pin.tag} (${onde}): pin ${pin.sha} ≠ commit real da tag ${real}`);
  }
  return problemas;
}

function lsRemoteGit(repo, tag) {
  const args = ['ls-remote', '--tags', `https://github.com/${repo}`, `refs/tags/${tag}`, `refs/tags/${tag}^{}`];
  let ultimoErro;
  for (let tentativa = 1; tentativa <= 2; tentativa += 1) {
    try {
      return execFileSync(resolverExecutavel('git'), args, { encoding: 'utf8', timeout: 10_000, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (erro) {
      ultimoErro = erro;
    }
  }
  throw new Error(String(ultimoErro?.stderr || ultimoErro?.message || 'falha').trim().split('\n')[0]);
}

async function main() {
  const dir = new URL('../../.github/workflows/', import.meta.url);
  const arquivos = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort().map((f) => [f, readFileSync(new URL(f, dir), 'utf8')]);
  const pins = coletarPins(arquivos);
  const problemas = await verificarPins(pins, async (repo, tag) => lsRemoteGit(repo, tag));
  if (problemas.length) {
    for (const p of problemas) console.error(`::error::${p}`);
    console.error(`FALHA: ${problemas.length} de ${pins.length} pins não correspondem ao commit real da tag declarada.`);
    process.exit(1);
  }
  console.log(`OK: ${pins.length} pins conferidos — cada SHA é o commit real da tag do comentário.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
