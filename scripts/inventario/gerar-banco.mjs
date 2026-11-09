#!/usr/bin/env node
/**
 * Inventario do banco oficial -> inventario/estado/banco.json (fonte de consulta dos agentes).
 *
 * Tudo sai de comando: o SQL de leitura `scripts/inventario/banco.sql`, a lista de edge
 * functions publicadas e o uso de cada tabela no codigo (`.from('tabela')` em src/ e
 * supabase/functions/). Nada escrito a mao. Mesmo padrao do Zapp_Web_V2 e do Promo_Gifts_V4.
 *
 * Dois jeitos de rodar:
 *   1) Com token (CI semanal / maquina com acesso):
 *        SUPABASE_ACCESS_TOKEN=... node scripts/inventario/gerar-banco.mjs
 *      Le pela Management API: POST /database/query/read-only (transacao so leitura) e
 *      GET /functions. Projeto fixo: usyxfpqlsspldubptrdl (SUPABASE_PROJECT_REF so troca
 *      para teste; qualquer outro valor exige INVENTARIO_PERMITIR_OUTRO_PROJETO=1).
 *   2) Sessao de agente sem token: rodar banco.sql no MCP oficial (gateway
 *      supabase-promo-champions-v2-mcp, rotulo "...LOVABLE CLOUD - PROMO CHAMPIONS V2", db_query),
 *      salvar a resposta num arquivo e
 *        node scripts/inventario/gerar-banco.mjs --entrada /caminho/resposta.json
 *      Aceita a resposta crua do MCP ({"rows":[{"inventario":{...}}]}) ou o objeto direto.
 *      Sem token, as edges publicadas ficam de fora (`edge_functions.publicadas: null`).
 *
 * Antes de gravar, recusa saida com cara de credencial (Bearer, JWT, sb_secret_).
 * Exit: 0 = gravado; 2 = entrada invalida, consulta falhou ou saida com credencial.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SQL_PATH = path.join(RAIZ, 'scripts/inventario/banco.sql');
const SAIDA = path.join(RAIZ, 'inventario/estado/banco.json');
const PASTAS_CODIGO = ['src', 'supabase/functions'];
const EXTENSOES = /\.(ts|tsx|js|jsx|mjs)$/;
export const PROJETO_OFICIAL = 'usyxfpqlsspldubptrdl';
// SUPABASE_API_URL so existe para o teste apontar um servidor local.
const API = `${(process.env.SUPABASE_API_URL || 'https://api.supabase.com').replace(/\/$/, '')}/v1/projects`;

// Limiares dos alertas: o que um agente precisa saber antes de mexer no sistema.
export const LIMIARES = {
  taxaFalhaCronPct: 5,
  historicoCronMaisDe7Dias: 50000,
  // Plano Supabase deste projeto aceita 100 edge functions publicadas (AGENTS.md secao 7); o repo
  // tem mais pastas que isso. Avisa a partir de 95 para o proximo deploy nao falhar no limite.
  edgesPublicadasMax: 100,
  edgesPublicadasAviso: 95,
};

/** Algo com cara de credencial no texto? (mesma regra do Promo_Gifts_V4) */
export const PARECE_CREDENCIAL = /Bearer\s+[A-Za-z0-9._-]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.|sb_secret_/;

/** Extrai o objeto do inventario da Management API, do MCP (resposta ou envelope tools/call) ou do objeto direto. */
export function extrairInventario(bruto) {
  let dado = typeof bruto === 'string' ? JSON.parse(bruto.trim()) : bruto;
  // Envelope cru de tools/call do MCP: { result: { content: [{ type: 'text', text: '<json>' }] } }.
  const conteudo = dado?.result?.content ?? dado?.content;
  if (Array.isArray(conteudo) && typeof conteudo[0]?.text === 'string') dado = JSON.parse(conteudo[0].text);
  if (dado && Array.isArray(dado.rows)) dado = dado.rows[0];
  if (Array.isArray(dado)) dado = dado[0];
  if (dado && dado.inventario) dado = dado.inventario;
  if (typeof dado === 'string') dado = JSON.parse(dado);
  const faltando = ['format_version', 'medido_em', 'resumo', 'tabelas', 'cron', 'integracoes']
    .filter((chave) => !(dado && chave in dado));
  if (faltando.length) throw new Error(`entrada sem as chaves: ${faltando.join(', ')}`);
  if (dado.format_version !== 1) throw new Error(`format_version ${dado.format_version} desconhecido (esperado 1)`);
  if (!Array.isArray(dado.tabelas) || dado.tabelas.length === 0) throw new Error('entrada sem tabelas');
  return dado;
}

function listarArquivos(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === 'node_modules' || entrada.name.startsWith('.')) continue;
    const p = path.join(dir, entrada.name);
    if (entrada.isDirectory()) listarArquivos(p, acc);
    else if (EXTENSOES.test(entrada.name)) acc.push(p);
  }
  return acc;
}

/**
 * Uso de cada tabela no codigo de producao (testes fora): `.from('tabela')` do cliente
 * Supabase (sem `storage.from`, que e bucket) e acesso direto ao PostgREST `/rest/v1/tabela`.
 * Limite conhecido: `.from(variavel)` nao e resolvido.
 */
export function contarUsoNoCodigo(raiz, nomes) {
  const uso = Object.fromEntries(nomes.map((n) => [n, { src: 0, edges: 0 }]));
  const reFrom = /(\bstorage\s*)?\.from\(\s*['"`]([A-Za-z0-9_]+)['"`]/g;
  const reRest = /\/rest\/v1\/([A-Za-z0-9_]+)/g;
  for (const pasta of PASTAS_CODIGO) {
    const chave = pasta === 'src' ? 'src' : 'edges';
    for (const arquivo of listarArquivos(path.join(raiz, pasta))) {
      if (/(\.(test|spec)\.|__tests__)/.test(arquivo)) continue;
      const texto = fs.readFileSync(arquivo, 'utf8');
      for (const m of texto.matchAll(reFrom)) if (!m[1] && uso[m[2]]) uso[m[2]][chave] += 1;
      for (const m of texto.matchAll(reRest)) if (m[1] !== 'rpc' && uso[m[1]]) uso[m[1]][chave] += 1;
    }
  }
  return uso;
}

/**
 * A resposta e mesmo do banco oficial? Confere contra as tabelas de `public` em
 * src/integrations/supabase/types.ts (gerado do banco oficial e mantido pelo types-sync.yml), fonte
 * independente do arquivo de entrada: pelo menos 90% das tabelas dos tipos tem de estar na
 * resposta, e vice-versa. Com `versoesRepo` (versoes dos .sql de supabase/migrations/ + as legadas de
 * scripts/db-audit/legacy-ledger-versions.txt) confere tambem o ledger: um banco irmao com quase as
 * mesmas tabelas (ex.: o ref antigo rapjswienfhkobhlamxb) passa no criterio das tabelas, mas nao tem
 * as migrations recentes.
 */
export const LEDGER_TOLERANCIA = { versoesRecentes: 20, registrosPct: 10 };
export function conferirOrigem(dado, tabelasManifesto, versoesRepo = null) {
  const resposta = new Set(dado.tabelas.map((t) => t.nome));
  const manifesto = new Set(tabelasManifesto);
  const comuns = [...manifesto].filter((t) => resposta.has(t)).length;
  const cobreManifesto = manifesto.size ? comuns / manifesto.size : 0;
  const cobreResposta = resposta.size ? comuns / resposta.size : 0;
  if (cobreManifesto < 0.9 || cobreResposta < 0.9) {
    throw new Error(`a resposta nao parece ser do banco oficial: ${comuns} tabelas em comum com src/integrations/supabase/types.ts `
      + `(${Math.round(cobreManifesto * 100)}% dos tipos, ${Math.round(cobreResposta * 100)}% da resposta). `
      + 'Confira se o MCP/projeto usado e o usyxfpqlsspldubptrdl.');
  }
  const origem = { tabelas_em_comum_com_manifesto: comuns, tabelas_no_manifesto: manifesto.size };
  if (!versoesRepo?.length) return origem;
  const { ledger_versao_max: max, ledger_registros: registros } = dado.resumo ?? {};
  if (!max || !Number.isFinite(registros)) {
    throw new Error('a resposta nao traz resumo.ledger_versao_max/ledger_registros; rode o banco.sql atual.');
  }
  const recentes = [...versoesRepo].sort().reverse();
  const limite = recentes[Math.min(LEDGER_TOLERANCIA.versoesRecentes, recentes.length) - 1];
  if (String(max) < limite) {
    throw new Error(`a resposta nao parece ser do banco oficial: ledger com ${registros} registros e maior versao ${max}; `
      + `o repo tem ${versoesRepo.length} migrations e a ${LEDGER_TOLERANCIA.versoesRecentes}a mais recente e ${limite}. `
      + 'Confira se o MCP/projeto usado e o usyxfpqlsspldubptrdl.');
  }
  const topo = recentes[0];
  if (String(max) >= topo) {
    const esperados = versoesRepo.length;
    const minimo = Math.floor(esperados * (1 - LEDGER_TOLERANCIA.registrosPct / 100));
    if (registros < minimo) {
      throw new Error(`a resposta nao parece ser do banco oficial: ledger com ${registros} registros; `
        + `o repo tem ${esperados} migrations, mas a contagem nao pode variar mais que ${LEDGER_TOLERANCIA.registrosPct}% (minimo ${minimo}). `
        + 'Confira se o MCP/projeto usado e o usyxfpqlsspldubptrdl.');
    }
  }
  return { ...origem, ledger_registros: registros, migrations_no_repo: versoesRepo.length };
}

/** Versoes (prefixo numerico) dos .sql do topo de supabase/migrations/. */
export const versoesDoRepo = (raiz) => fs.readdirSync(path.join(raiz, 'supabase/migrations'))
  .filter((f) => /^\d+_.*\.sql$/.test(f)).map((f) => f.split('_')[0]);

/**
 * Versoes que o ledger deve ter: arquivos do repo + legadas reconciliadas (era Lovable/dashboard,
 * aplicadas antes da disciplina de migrations; mesma lista que o migrations-drift.yml aceita).
 */
export function versoesEsperadasNoLedger(raiz) {
  const legado = path.join(raiz, 'scripts/db-audit/legacy-ledger-versions.txt');
  const legadas = fs.existsSync(legado)
    ? fs.readFileSync(legado, 'utf8').split(/\s+/).filter((v) => /^\d{8,}$/.test(v)) : [];
  return [...new Set([...versoesDoRepo(raiz), ...legadas])];
}

/** Tabelas de `public` em src/integrations/supabase/types.ts (bloco `public: { Tables: { ... } }`). */
export function tabelasDosTipos(raiz, arquivo = 'src/integrations/supabase/types.ts') {
  const linhas = fs.readFileSync(path.join(raiz, arquivo), 'utf8').split(/\r?\n/);
  const inicio = linhas.findIndex((l, i) => l === '  public: {' && linhas[i + 1] === '    Tables: {');
  if (inicio === -1) throw new Error(`${arquivo} sem o bloco public.Tables`);
  const nomes = [];
  for (let i = inicio + 2; i < linhas.length && linhas[i] !== '    }'; i += 1) {
    const m = /^      ([A-Za-z0-9_]+): \{$/.exec(linhas[i]);
    if (m) nomes.push(m[1]);
  }
  return nomes;
}

/** Edge functions do repo (pastas com index.ts, sem _shared). */
export function edgesNoRepo(raiz) {
  const dir = path.join(raiz, 'supabase/functions');
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && fs.existsSync(path.join(dir, d.name, 'index.ts')))
    .map((d) => d.name).sort();
}

/** Edges publicadas (resposta de GET /functions) x repo. `publicadas` null = nao consultado. */
export function compararEdges(publicadasApi, noRepo) {
  if (!publicadasApi) return { publicadas: null, no_repo: noRepo.length, publicadas_sem_codigo_no_repo: null, no_repo_sem_deploy: null };
  const publicadas = publicadasApi.map((f) => ({
    slug: f.slug,
    versao: f.version,
    status: f.status,
    verify_jwt: f.verify_jwt,
    atualizada_em: f.updated_at ? new Date(f.updated_at).toISOString().slice(0, 16) + 'Z' : null,
  })).sort((a, b) => a.slug.localeCompare(b.slug));
  const slugs = new Set(publicadas.map((f) => f.slug));
  return {
    publicadas,
    no_repo: noRepo.length,
    publicadas_sem_codigo_no_repo: [...slugs].filter((s) => !noRepo.includes(s)).sort(),
    no_repo_sem_deploy: noRepo.filter((s) => !slugs.has(s)),
  };
}

/** Ordena chaves recursivamente: o diff entre execucoes fica so no que mudou. */
function ordenar(valor) {
  if (Array.isArray(valor)) return valor.map(ordenar);
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.keys(valor).sort().map((k) => [k, ordenar(valor[k])]));
  }
  return valor;
}

/**
 * A agenda do pg_cron roda ao menos uma vez por dia? 'N seconds', ou dia do mes, mes e dia da semana
 * cobrindo tudo: `*`, `*\/1` ou a faixa inteira (1-31, 1-12, 0-6/0-7).
 */
const CAMPO_TODO = [/^(\*|\*\/1|1-31)$/, /^(\*|\*\/1|1-12)$/, /^(\*|\*\/1|0-6|0-7|1-7)$/];
export function rodaTodoDia(agenda) {
  const a = String(agenda ?? '').trim();
  if (/^\d+\s+seconds?$/i.test(a)) return true;
  const campos = a.split(/\s+/);
  return campos.length === 5 && CAMPO_TODO.every((re, i) => re.test(campos[i + 2]));
}

/** Junta banco + codigo + edges e calcula orfas e alertas. Funcao pura (testada em scripts/ci/*. */
export function montarInventario(dado, uso, edges = compararEdges(null, [])) {
  const tabelas = dado.tabelas.map((t) => ({ ...t, uso_no_codigo: uso[t.nome] ?? { src: 0, edges: 0 } }));
  const orfas = tabelas
    .filter((t) => t.linhas === 0 && !t.citada_no_banco && t.uso_no_codigo.src + t.uso_no_codigo.edges === 0)
    .map((t) => t.nome);

  const alertas = [];
  const semRls = tabelas.filter((t) => !t.rls).map((t) => t.nome);
  if (semRls.length) alertas.push({ tipo: 'tabela_sem_rls', detalhe: semRls });
  // RLS ligado sem nenhuma policy nega tudo pra authenticated/anon (service_role sempre passa por
  // cima, rolbypassrls). Pode ser de proposito (tabela so-interna), mas hoje fica invisivel: nem
  // tabela_sem_rls (tem RLS) nem nenhum outro alerta aponta ⒄ inclusive tabela vazia hoje (ex. um
  // cofre de credencial ainda sem linha) merece o aviso do mesmo jeito.
  const rlsSemPolicy = tabelas.filter((t) => t.rls && t.policies === 0).map((t) => t.nome);
  if (rlsSemPolicy.length) alertas.push({ tipo: 'rls_sem_policy', detalhe: rlsSemPolicy });
  const cronRuim = dado.cron.jobs
    .filter((j) => j.ativo && j.taxa_falha_7d_pct >= LIMIARES.taxaFalhaCronPct)
    .map((j) => `${j.nome} (${j.taxa_falha_7d_pct}% em 7d)`);
  if (cronRuim.length) alertas.push({ tipo: 'cron_falhando', detalhe: cronRuim });
  // Cron 100% parado nao grava linha em job_run_details: some de horas_paradas_7d e a taxa fica 0.
  // Job ativo que deveria rodar todo dia (dia/mes/semana = *) sem nenhuma execucao em 24 h.
  const mudos = dado.cron.jobs.filter((j) => j.ativo && j.execucoes_24h === 0 && rodaTodoDia(j.agenda)).map((j) => j.nome);
  if (mudos.length) alertas.push({ tipo: 'cron_sem_execucao', detalhe: mudos });
  if (dado.cron.horas_paradas_7d.length) {
    alertas.push({ tipo: 'cron_parado', detalhe: dado.cron.horas_paradas_7d.map((h) => h.hora) });
  }
  if (dado.cron.historico.mais_de_7_dias > LIMIARES.historicoCronMaisDe7Dias) {
    alertas.push({ tipo: 'historico_cron_sem_limpeza', detalhe: [`${dado.cron.historico.mais_de_7_dias} linhas com mais de 7 dias`] });
  }
  // Integracoes (Bitrix24, N8N, MCP, webhooks): conexao ativa cujo ultimo health check nao foi sucesso.
  // `pending` e `null` (nunca checada) contam: ninguem provou que a integracao funciona.
  const integracaoRuim = dado.integracoes.conexoes
    .filter((c) => c.ativa && c.status !== 'success')
    .map((c) => `${c.tipo}/${c.rotulo}: ${c.status ?? 'nunca checada'}`);
  if (integracaoRuim.length) alertas.push({ tipo: 'integracao_sem_sucesso', detalhe: integracaoRuim });
  // Dead letters: entrega que falhou de vez e espera replay manual (winloss, callbacks V4, forecast...).
  const deadLetters = tabelas
    .filter((t) => /dead_letter/.test(t.nome) && !/_audit$|_history$|_log$/.test(t.nome) && t.linhas > 0)
    .map((t) => `${t.nome}: ${t.linhas} linhas`);
  if (deadLetters.length) alertas.push({ tipo: 'dead_letters_pendentes', detalhe: deadLetters });
  if (edges.no_repo_sem_deploy?.length) alertas.push({ tipo: 'edge_sem_deploy', detalhe: edges.no_repo_sem_deploy });
  if (edges.publicadas_sem_codigo_no_repo?.length) {
    alertas.push({ tipo: 'edge_publicada_sem_codigo', detalhe: edges.publicadas_sem_codigo_no_repo });
  }
  if (edges.publicadas && edges.publicadas.length >= LIMIARES.edgesPublicadasAviso) {
    alertas.push({ tipo: 'edge_limite_do_plano', detalhe: [`${edges.publicadas.length} publicadas de ${LIMIARES.edgesPublicadasMax} permitidas`] });
  }

  return ordenar({
    ...dado,
    fonte: 'scripts/inventario/banco.sql + GET /functions + .from() em src/ e supabase/functions/ (scripts/inventario/gerar-banco.mjs)',
    tabelas,
    tabelas_orfas: {
      criterio: '0 linhas + nao citada em funcao/view do banco + nenhum .from() em src/ ou supabase/functions/',
      lista: orfas,
    },
    edge_functions: edges,
    alertas,
  });
}

function projeto() {
  const ref = (process.env.SUPABASE_PROJECT_REF || PROJETO_OFICIAL).trim();
  if (ref !== PROJETO_OFICIAL && process.env.INVENTARIO_PERMITIR_OUTRO_PROJETO !== '1') {
    throw new Error(`SUPABASE_PROJECT_REF=${ref} nao e o banco oficial (${PROJETO_OFICIAL}).`);
  }
  return ref;
}

async function chamarApi(caminho, init = {}) {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const res = await fetch(`${API}/${encodeURIComponent(projeto())}${caminho}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    signal: AbortSignal.timeout(120_000),
  });
  // Nunca repassa o corpo do erro: pode ecoar cabecalho ou parte da consulta.
  if (!res.ok) throw new Error(`Management API ${caminho} respondeu HTTP ${res.status}`);
  return res.json();
}

async function main(argv) {
  const iEntrada = argv.indexOf('--entrada');
  const iFunctions = argv.indexOf('--functions');
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  let bruto;
  let publicadasApi = null;
  if (iEntrada !== -1) {
    const arquivo = argv[iEntrada + 1];
    if (!arquivo) throw new Error('--entrada exige o caminho do arquivo com a resposta do banco.sql');
    bruto = fs.readFileSync(arquivo, 'utf8');
    if (iFunctions !== -1) publicadasApi = JSON.parse(fs.readFileSync(argv[iFunctions + 1], 'utf8'));
  } else {
    if (!token) throw new Error('sem --entrada e sem SUPABASE_ACCESS_TOKEN: nada para ler (veja o cabecalho do script).');
    bruto = await chamarApi('/database/query/read-only', {
      method: 'POST',
      body: JSON.stringify({ query: fs.readFileSync(SQL_PATH, 'utf8') }),
    });
  }
  if (!publicadasApi && token) publicadasApi = await chamarApi('/functions');

  const dado = extrairInventario(bruto);
  const origemInfo = conferirOrigem(dado, tabelasDosTipos(RAIZ), versoesEsperadasNoLedger(RAIZ));
  Object.assign(dado.resumo, { ...origemInfo, migrations_no_repo: versoesDoRepo(RAIZ).length });
  const uso = contarUsoNoCodigo(RAIZ, dado.tabelas.map((t) => t.nome));
  const inventario = montarInventario(dado, uso, compararEdges(publicadasApi, edgesNoRepo(RAIZ)));
  const texto = JSON.stringify(inventario, null, 2) + '\n';
  if (PARECE_CREDENCIAL.test(texto)) {
    throw new Error('a saida tem algo com cara de credencial; nada foi gravado. Revise banco.sql.');
  }
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, texto);
  const ed = inventario.edge_functions;
  console.log(`banco.json: ${inventario.tabelas.length} tabelas, ${inventario.cron.jobs.length} cron jobs, `
    + `${inventario.tabelas_orfas.lista.length} orfas, ${inventario.alertas.length} alertas, `
    + `edges ${ed.publicadas ? `${ed.publicadas.length} publicadas/${ed.no_repo} no repo` : `${ed.no_repo} no repo (publicadas nao consultadas)`} `
    + `(medido_em ${inventario.medido_em}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`ERRO: ${error.message}`);
    process.exit(2);
  });
}
