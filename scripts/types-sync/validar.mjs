#!/usr/bin/env node
/**
 * Confere o types.ts recém-gerado do banco oficial antes de ele substituir
 * src/integrations/supabase/types.ts (usado pelo .github/workflows/types-sync.yml).
 *
 *   node scripts/types-sync/validar.mjs <candidato.ts> [--atual <types.ts>] [--resumo <saida.md>]
 *
 * Recusa (exit 2) candidato pequeno demais, sem o bloco `public.Tables` ou com menos de 90% das
 * tabelas atuais (cara de outro projeto ou de geração quebrada). Válido: exit 0 e imprime uma
 * linha JSON { mudou, tabelas, funcoes }; com --resumo grava o Markdown do corpo do PR.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const TAMANHO_MINIMO = 100 * 1024;
export const COBERTURA_MINIMA = 0.9;

/** Chaves de primeiro nível de um bloco `    <Bloco>: {` dentro de `  public: {`. */
export function chavesDoBloco(texto, bloco) {
  const linhas = texto.split('\n');
  const publico = linhas.findIndex((l) => l === '  public: {');
  if (publico === -1) return null;
  const inicio = linhas.findIndex((l, i) => i > publico && l === `    ${bloco}: {`);
  if (inicio === -1) return null;
  const nomes = [];
  for (let i = inicio + 1; i < linhas.length && linhas[i] !== '    }'; i += 1) {
    const m = /^      ([A-Za-z0-9_]+):(?: |$)/.exec(linhas[i]);
    if (m) nomes.push(m[1]);
  }
  return nomes;
}

const diferenca = (a, b) => a.filter((x) => !b.includes(x)).sort();

/** Compara candidato x atual. Lança Error quando o candidato não pode substituir o atual. */
export function comparar(candidato, atual) {
  if (Buffer.byteLength(candidato) < TAMANHO_MINIMO) {
    throw new Error(`candidato com ${Buffer.byteLength(candidato)} bytes (< ${TAMANHO_MINIMO}): geração vazia ou quebrada`);
  }
  const tabNovas = chavesDoBloco(candidato, 'Tables');
  if (!tabNovas || tabNovas.length === 0) throw new Error('candidato sem o bloco public.Tables');
  const tabAtuais = chavesDoBloco(atual, 'Tables') ?? [];
  const comuns = tabAtuais.filter((t) => tabNovas.includes(t)).length;
  if (tabAtuais.length && comuns / tabAtuais.length < COBERTURA_MINIMA) {
    throw new Error(`candidato tem só ${comuns} de ${tabAtuais.length} tabelas atuais: parece outro projeto, nada substituído`);
  }
  const fnNovas = chavesDoBloco(candidato, 'Functions') ?? [];
  const fnAtuais = chavesDoBloco(atual, 'Functions') ?? [];
  return {
    mudou: candidato.trimEnd() !== atual.trimEnd(),
    tabelas: { antes: tabAtuais.length, depois: tabNovas.length, novas: diferenca(tabNovas, tabAtuais), removidas: diferenca(tabAtuais, tabNovas) },
    funcoes: { antes: fnAtuais.length, depois: fnNovas.length, novas: diferenca(fnNovas, fnAtuais), removidas: diferenca(fnAtuais, fnNovas) },
  };
}

export function resumoMarkdown(r) {
  const lista = (titulo, itens) => (itens.length ? `- ${titulo} (${itens.length}): ${itens.map((x) => `\`${x}\``).join(', ')}` : `- ${titulo}: nenhuma`);
  return [
    `Tabelas em \`public\`: ${r.tabelas.antes} → ${r.tabelas.depois}`,
    lista('tabelas novas', r.tabelas.novas),
    lista('tabelas removidas', r.tabelas.removidas),
    `Funções (RPC) em \`public\`: ${r.funcoes.antes} → ${r.funcoes.depois}`,
    lista('funções novas', r.funcoes.novas),
    lista('funções removidas', r.funcoes.removidas),
    '',
    'Mudanças de coluna/tipo/enum aparecem no diff do arquivo.',
  ].join('\n') + '\n';
}

function main(argv) {
  const candidatoArq = argv.find((a) => !a.startsWith('--'));
  const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
  if (!candidatoArq) throw new Error('uso: validar.mjs <candidato.ts> [--atual <types.ts>] [--resumo <saida.md>]');
  const atualArq = opt('--atual', 'src/integrations/supabase/types.ts');
  const r = comparar(fs.readFileSync(candidatoArq, 'utf8'), fs.existsSync(atualArq) ? fs.readFileSync(atualArq, 'utf8') : '');
  const resumo = opt('--resumo', null);
  if (resumo) fs.writeFileSync(resumo, resumoMarkdown(r));
  console.log(JSON.stringify(r));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(`ERRO: ${error.message}`); process.exit(2); }
}
