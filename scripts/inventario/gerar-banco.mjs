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
  const reFrom = /(\bstorage\s*)?\.from\(\s*['"`]([A-Za-z0-9_]+)['"`]/gs;
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
    ? fs.readFileSync(legado, utf8').split(/\s+/).filter((v) => /^\d{8,}$/.test(v)) : [];
  return [...new Set([...versoesDoRepo(raiz), ...legadas])];
}

/** Tabelas de `public` em src/integrations/supabase/types.ts (bloco `public: { Tables: { ... } }`). */
export function tabelasDosTipos(raiz, arquivo = 'src/integrations/supabase/types.ts') {
  const linhas = fs.readFileSync(path.join(raiz, arquivo), 'utf8').split(/\r?\n/);
  const inicio = linhas.findIndex((l, i) => l === '  public: {' && linhas[i + 1] === '    Tables: {')Ó²¢–b†–æ–6–òÓÓÒÓ’F‡&÷ræWrW'&÷"†G¶'V—f÷Ò6VÒò&Æö6òV&Æ–2åF&ÆW6“°¢6öç7BæöÖW2ÒµÓ°¢f÷"†ÆWB’Ò–æ–6–ò²#²’ÂÆ–æ†2æÆVæwF‚bbÆ–æ†5¶•ÒÓÒrÒs²’³Ò’°¢6öç7BÒÒõâ…´Õ¦×£Ó•õÒ²“¢Ç²BòæW†V2†Æ–æ†5¶•Ò“°¢–b†Ò’æöÖW2çW6‚†Õ³Ò“°¢Ğ¢&WGW&âæöÖW3°§Ğ ¢ò¢¢VFvRgVæ7F–öç2Fò&Wò‡7F26öÒ–æFW‚çG2Â6VÒ÷6†&VB’â¢ğ¦W‡÷'BgVæ7F–öâVFvW4æõ&Wò‡&—¢’°¢6öç7BF—"ÒF‚æ¦ö–â‡&—¢Âw7W&6RögVæ7F–öç2r“°¢&WGW&âg2ç&VFF—%7–æ2†F—"Â²v—F„f–ÆUG—W3¢G'VRÒ¢æf–ÇFW"‚†B’ÓâBæ—4F—&V7F÷'’‚’bbBææÖRç7F'G5v—F‚‚uòr’bbg2æW†—7G57–æ2‡F‚æ¦ö–â†F—"ÂBææÖRÂv–æFW‚çG2r’’¢æÖ‚†B’ÓâBææÖR’ç6÷'B‚“°§Ğ ¢ò¢¢VFvW2V&Æ–6F2‡&W7÷7FFRtUBögVæ7F–öç2’‚&WòâV&Æ–6F6çVÆÂÒæò6öç7VÇFFòâ¢ğ¦W‡÷'BgVæ7F–öâ6ö×&$VFvW2‡V&Æ–6F4’Âæõ&Wò’°¢–b‚V&Æ–6F4’’&WGW&â²V&Æ–6F3¢çVÆÂÂæõ÷&Wó¢æõ&WòæÆVæwF‚ÂV&Æ–6F5÷6VÕö6öF–võöæõ÷&Wó¢çVÆÂÂæõ÷&Wõ÷6VÕöFWÆ÷“¢çVÆÂÓ°¢6öç7BV&Æ–6F2ÒV&Æ–6F4’æÖ‚†b’Óâ‡°¢6ÇVs¢bç6ÇVrÀ¢fW'6ó¢bçfW'6–öâÀ¢7FGW3¢bç7FGW2À¢fW&–g•ö§wC¢bçfW&–g•ö§wBÀ¢GVÆ—¦FöVÓ¢bçWFFVEöBòæWrFFR†bçWFFVEöB’çFô•4õ7G&–ær‚’ç6Æ–6RƒÂb’²u¢r¢çVÆÂÀ¢Ò’’ç6÷'B‚†Â"’Óâç6ÇVræÆö6ÆT6ö×&R†"ç6ÇVr’“°¢6öç7B6ÇVw2ÒæWr6WB‡V&Æ–6F2æÖ‚†b’Óâbç6ÇVr’“°¢&WGW&â°¢V&Æ–6F2À¢æõ÷&Wó¢æõ&WòæÆVæwF‚À¢V&Æ–6F5÷6VÕö6öF–võöæõ÷&Wó¢²ââç6ÇVw5Òæf–ÇFW"‚‡2’Óâæõ&Wòæ–æ6ÇVFW2‡2’’ç6÷'B‚’À¢æõ÷&Wõ÷6VÕöFWÆ÷“¢æõ&Wòæf–ÇFW"‚‡2’Óâ6ÇVw2æ†2‡2’’À¢Ó°§Ğ ¢ò¢¢÷&FVæ6†fW2&V7W'6—fÖVçFS¢òF–fbVçG&RW†V7V6öW2f–66òæòVR×VF÷Râ¢ğ¦gVæ7F–öâ÷&FVæ"‡fÆ÷"’°¢–b„'&’æ—4'&’‡fÆ÷"’’&WGW&âfÆ÷"æÖ†÷&FVæ"“°¢–b‡fÆ÷"bbG—VöbfÆ÷"ÓÓÒvö&¦V7Br’°¢&WGW&âö&¦V7Bæg&öÔVçG&–W2„ö&¦V7Bæ¶W—2‡fÆ÷"’ç6÷'B‚’æÖ‚†²’Óâ¶²Â÷&FVæ"‡fÆ÷%¶µÒ•Ò’“°¢Ğ¢&WGW&âfÆ÷#°§Ğ ¢ò¢ ¢¢vVæFFòuö7&öâ&öFòÖVæ÷2VÖfW¢÷"F–òtâ6V6öæG2rÂ÷RF–FòÖW2ÂÖW2RF–F6VÖæ¢¢6ö'&–æFòGVFó¢¦Â¥Âó÷Rf—†–çFV—&ƒÓ3ÂÓ"ÂÓbóÓr’à¢¢ğ¦6öç7B4ÕõõDôDòÒ²õâ…Â§ÅÂ¥ÂóÃÓ3’BòÂõâ…Â§ÅÂ¥ÂóÃÓ"’BòÂõâ…Â§ÅÂ¥ÂóÃÓgÃÓwÃÓr’BõÓ°¦W‡÷'BgVæ7F–öâ&öFFöFôF–†vVæF’°¢6öç7BÒ7G&–ær†vVæFóòrr’çG&–Ò‚“°¢–b‚õåÆBµÇ2·6V6öæG3òBö’çFW7B†’’&WGW&âG'VS°¢6öç7B6×÷2Òç7Æ—B‚õÇ2²ò“°¢&WGW&â6×÷2æÆVæwF‚ÓÓÒRbb4ÕõõDôDòæWfW'’‚‡&RÂ’’Óâ&RçFW7B†6×÷5¶’²%Ò’“°§Ğ ¢ò¢¢§VçF&æ6ò²6öF–vò²VFvW2R6Æ7VÆ÷&f2RÆW'F2âgVæ6òW&‡FW7FFVÒ67&—G2ö6’ò¢â¢ğ¦W‡÷'BgVæ7F–öâÖöçF$–çfVçF&–ò†FFòÂW6òÂVFvW2Ò6ö×&$VFvW2†çVÆÂÂµÒ’’°¢6öç7BF&VÆ2ÒFFòçF&VÆ2æÖ‚‡B’Óâ‡²ââçBÂW6õöæõö6öF–vó¢W6õ·BææöÖUÒóò²7&3¢ÂVFvW3¢ÒÒ’“°¢6öç7B÷&f2ÒF&VÆ0¢æf–ÇFW"‚‡B’ÓâBæÆ–æ†2ÓÓÒbbBæ6—FFöæõö&æ6òbbBçW6õöæõö6öF–vòç7&2²BçW6õöæõö6öF–vòæVFvW2ÓÓÒ¢æÖ‚‡B’ÓâBææöÖR“° ¢6öç7BÆW'F2ÒµÓ°¢6öç7B6VÕ&Ç2ÒF&VÆ2æf–ÇFW"‚‡B’ÓâBç&Ç2’æÖ‚‡B’ÓâBææöÖR“°¢–b‡6VÕ&Ç2æÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢wF&VÆ÷6VÕ÷&Ç2rÂFWFÆ†S¢6VÕ&Ç2Ò“°¢òò$Å2Æ–vFò6VÒæVæ‡VÖöÆ–7’æVvGVFò&WF†VçF–6FVBöæöâ‡6W'f–6U÷&öÆR6V×&R76÷ ¢òò6–ÖÂ&öÆ'—77&Ç2’âöFR6W"FR&÷÷6—Fò‡F&VÆ6òÖ–çFW&æ’ÂÖ2†ö¦Rf–6–çf—6—fVÃ¢æVĞ¢òòF&VÆ÷6VÕ÷&Ç2‡FVÒ$Å2’æVÒæVæ‡VÒ÷WG&òÆW'FöçF)(B–æ6ÇW6—fRF&VÆf¦–†ö¦R†W‚âVĞ¢òò6ög&RFR7&VFVæ6–Â–æF6VÒÆ–æ†’ÖW&V6Ròf—6òFòÖW6Öò¦V—Fòà¢6öç7B&Ç56VÕöÆ–7’ÒF&VÆ2æf–ÇFW"‚‡B’ÓâBç&Ç2bbBçöÆ–6–W2ÓÓÒ’æÖ‚‡B’ÓâBææöÖR“°¢–b‡&Ç56VÕöÆ–7’æÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢w&Ç5÷6VÕ÷öÆ–7’rÂFWFÆ†S¢&Ç56VÕöÆ–7’Ò“°¢6öç7B7&öå'V–ÒÒFFòæ7&öâæ¦ö'0¢æf–ÇFW"‚†¢’Óâ¢æF—fòbb¢çF†öfÆ†óvE÷7BãÒÄ”Ô”$U2çF†fÆ†7&öå7B¢æÖ‚†¢’ÓâG¶¢ææöÖWÒ‚G¶¢çF†öfÆ†óvE÷7GÒRVÒvB–“°¢–b†7&öå'V–ÒæÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢v7&öåöfÆ†æFòrÂFWFÆ†S¢7&öå'V–ÒÒ“°¢òò7&öâR&Fòæòw&fÆ–æ†VÒ¦ö%÷'VåöFWF–Ç3¢6öÖRFR†÷&5÷&F5óvBRF†f–6à¢òò¦ö"F—fòVRFWfW&–&öF"FöFòF–†F–öÖW2÷6VÖæÒ¢’6VÒæVæ‡VÖW†V7V6òVÒ#F‚à¢6öç7B×VF÷2ÒFFòæ7&öâæ¦ö'2æf–ÇFW"‚†¢’Óâ¢æF—fòbb¢æW†V7V6öW5ó#F‚ÓÓÒbb&öFFöFôF–†¢æövVæF’’æÖ‚†¢’Óâ¢ææöÖR“°¢–b†×VF÷2æÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢v7&öå÷6VÕöW†V7V6òrÂFWFÆ†S¢×VF÷2Ò“°¢–b†FFòæ7&öâæ†÷&5÷&F5óvBæÆVæwF‚’°¢ÆW'F2çW6‚‡²F—ó¢v7&öå÷&FòrÂFWFÆ†S¢FFòæ7&öâæ†÷&5÷&F5óvBæÖ‚†‚’Óâ‚æ†÷&’Ò“°¢Ğ¢–b†FFòæ7&öâæ†—7F÷&–6òæÖ—5öFUóuöF–2âÄ”Ô”$U2æ†—7F÷&–6ô7&öäÖ—4FStF–2’°¢ÆW'F2çW6‚‡²F—ó¢v†—7F÷&–6õö7&öå÷6VÕöÆ–×W¦rÂFWFÆ†S¢¶G¶FFòæ7&öâæ†—7F÷&–6òæÖ—5öFUóuöF–7ÒÆ–æ†26öÒÖ—2FRrF–6ÒÒ“°¢Ğ¢òò–çFVw&6öW2„&—G&—ƒ#BÂã„âÂÔ5ÂvV&†öö·2“¢6öæW†òF—f7V¦òVÇF–Öò†VÇF‚6†V6²æòfö’7V6W76òà¢òòVæF–ævRçVÆÆ†çVæ66†V6F’6öçFÓ¢æ–æwVVÒ&÷f÷RVR–çFVw&6ògVæ6–öæà¢6öç7B–çFVw&6õ'V–ÒÒFFòæ–çFVw&6öW2æ6öæW†öW0¢æf–ÇFW"‚†2’Óâ2æF—fbb2ç7FGW2ÓÒw7V66W72r¢æÖ‚†2’ÓâG¶2çF—÷ÒòG¶2ç&÷GVÆ÷Ó¢G¶2ç7FGW2óòvçVæ66†V6FwÖ“°¢–b†–çFVw&6õ'V–ÒæÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢v–çFVw&6õ÷6VÕ÷7V6W76òrÂFWFÆ†S¢–çFVw&6õ'V–ÒÒ“°¢òòFVBÆWGFW'3¢VçG&VvVRfÆ†÷RFRfW¢RW7W&&WÆ’ÖçVÂ‡v–æÆ÷72Â6ÆÆ&6·2cBÂf÷&V67Bâââ’à¢6öç7BFVDÆWGFW'2ÒF&VÆ0¢æf–ÇFW"‚‡B’ÓâöFVEöÆWGFW"òçFW7B‡BææöÖR’bbõöVF—BGÅö†—7F÷'’GÅöÆörBòçFW7B‡BææöÖR’bbBæÆ–æ†2â¢æÖ‚‡B’ÓâG·BææöÖWÓ¢G·BæÆ–æ†7ÒÆ–æ†6“°¢–b†FVDÆWGFW'2æÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢vFVEöÆWGFW'5÷VæFVçFW2rÂFWFÆ†S¢FVDÆWGFW'2Ò“°¢–b†VFvW2ææõ÷&Wõ÷6VÕöFWÆ÷“òæÆVæwF‚’ÆW'F2çW6‚‡²F—ó¢vVFvU÷6VÕöFWÆ÷’rÂFWFÆ†S¢VFvW2ææõ÷&Wõ÷6VÕöFWÆ÷’Ò“°¢–b†VFvW2çV&Æ–6F5÷6VÕö6öF–võöæõ÷&WóòæÆVæwF‚’°¢ÆW'F2çW6‚‡²F—ó¢vVFvU÷V&Æ–6F÷6VÕö6öF–vòrÂFWFÆ†S¢VFvW2çV&Æ–6F5÷6VÕö6öF–võöæõ÷&WòÒ“°¢Ğ¢–b†VFvW2çV&Æ–6F2bbVFvW2çV&Æ–6F2æÆVæwF‚ãÒÄ”Ô”$U2æVFvW5V&Æ–6F4f—6ò’°¢ÆW'F2çW6‚‡²F—ó¢vVFvUöÆ–Ö—FUöFõ÷ÆæòrÂFWFÆ†S¢¶G¶VFvW2çV&Æ–6F2æÆVæwF‡ÒV&Æ–6F2FRG´Ä”Ô”$U2æVFvW5V&Æ–6F4Ö‡ÒW&Ö—F–F6ÒÒ“°¢Ğ ¢&WGW&â÷&FVæ"‡°¢ââæFFòÀ¢föçFS¢w67&—G2ö–çfVçF&–òö&æ6òç7Â²tUBögVæ7F–öç2²æg&öÒ‚’VÒ7&2òR7W&6RögVæ7F–öç2ò‡67&—G2ö–çfVçF&–òövW&"Ö&æ6òæÖ§2’rÀ¢F&VÆ2À¢F&VÆ5ö÷&f3¢°¢7&—FW&–ó¢sÆ–æ†2²æò6—FFVÒgVæ6ò÷f–WrFò&æ6ò²æVæ‡VÒæg&öÒ‚’VÒ7&2ò÷R7W&6RögVæ7F–öç2òrÀ¢Æ—7F¢÷&f2À¢ÒÀ¢VFvUögVæ7F–öç3¢VFvW2À¢ÆW'F2À¢Ò“°§Ğ ¦gVæ7F–öâ&ö¦WFò‚’°¢6öç7B&VbÒ‡&ö6W72æVçbå5U$4Uõ$ô¤T5Eõ$TbÇÂ$ô¤UDõôôd”4”Â’çG&–Ò‚“°¢–b‡&VbÓÒ$ô¤UDõôôd”4”Âbb&ö6W72æVçbä”ådTåD$”õõU$Ô•D•%ôõUE$õõ$ô¤UDòÓÒsr’°¢F‡&÷ræWrW'&÷"†5U$4Uõ$ô¤T5Eõ$TcÒG·&VgÒæòRò&æ6òöf–6–Â‚Gµ$ô¤UDõôôd”4”ÇÒ’æ“°¢Ğ¢&WGW&â&Vc°§Ğ ¦ç–æ2gVæ7F–öâ6†Ö$’†6Ö–æ†òÂ–æ—BÒ·Ò’°¢6öç7BFö¶VâÒ&ö6W72æVçbå5U$4Uô44U55õDô´TãòçG&–Ò‚“°¢6öç7B&W2Òv—BfWF6‚†G´—ÒòG¶Væ6öFUU$”6ö×öæVçB‡&ö¦WFò‚’—ÒG¶6Ö–æ†÷ÖÂ°¢ââæ–æ—BÀ¢†VFW'3¢²WF†÷&—¦F–öã¢&V&W"G·Fö¶VçÖÂt6öçFVçBÕG—Rs¢vÆ–6F–öâö§6öârÂâââ†–æ—Bæ†VFW'2ÇÂ·Ò’ÒÀ¢6–væÃ¢&÷'E6–væÂçF–ÖV÷WBƒ#ó’À¢Ò“°¢òòçVæ6&W76ò6÷'òFòW'&ó¢öFRV6ö"6&V6Æ†ò÷R'FRF6öç7VÇFà¢–b‚&W2æö²’F‡&÷ræWrW'&÷"†ÖævVÖVçB