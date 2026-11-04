#!/usr/bin/env node
/**
 * Inventario das rotas do front -> inventario/estado/rotas.json (fonte de consulta dos agentes).
 *
 * Le o codigo, nao documentacao:
 *  - URLs:  src/routes/AppRoutes.tsx (path, componente, <Admin>/<Manager>/ProtectedRoute, Navigate)
 *           + src/routes/lazyPages.ts (arquivo de cada pagina)
 *  - Menu:  src/components/layout/sidebar/sidebarMenuData.ts (rotulo, perfil SDR/Closer/Gestao,
 *           grupo, itens de sistema e de admin)
 *  - Para cada pagina: segue os imports a partir do arquivo da pagina (src/hooks/, src/services/,
 *    src/lib/, src/contexts/ e componentes ate MAX_SALTOS_FEATURE saltos) e lista hooks, edge
 *    functions invocadas, RPCs, tabelas (.from e /rest/v1) e buckets de storage (storage.from).
 *  - `problemas`: item de menu sem rota, rota sem arquivo, rota duplicada e import local que nao resolve.
 *
 * Mesmo padrao do Zapp_Web_V2 (scripts/inventario/gerar-rotas.mjs), adaptado ao roteamento do
 * Promo (URLs reais em vez de ?view=).
 *
 * Uso:
 *   node scripts/inventario/gerar-rotas.mjs           grava inventario/estado/rotas.json
 *   node scripts/inventario/gerar-rotas.mjs --check   exit 1 se o arquivo commitado esta desatualizado
 * Saida deterministica (sem data): o mesmo codigo gera o mesmo arquivo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ_PADRAO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA_REL = 'inventario/estado/rotas.json';
const EXTENSOES = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
export const ARQ_ROTAS = 'src/routes/AppRoutes.tsx';
export const ARQ_LAZY = 'src/routes/lazyPages.ts';
export const ARQ_MENU = 'src/components/layout/sidebar/sidebarMenuData.ts';

const ler = (raiz, rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');
const rel = (raiz, abs) => path.relative(raiz, abs).split(path.sep).join('/');
const unico = (lista) => [...new Set(lista)].sort();

/** Resolve um especificador de import para um arquivo do repo (ou null se externo/inexistente). */
export function resolverImport(raiz, deArquivoAbs, especificador) {
  let base;
  if (especificador.startsWith('@/')) base = path.join(raiz, 'src', especificador.slice(2));
  else if (especificador.startsWith('.')) base = path.resolve(path.dirname(deArquivoAbs), especificador);
  else return null;
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of EXTENSOES) if (fs.existsSync(base + ext)) return base + ext;
  return undefined; // local, mas nao existe
}

/** Imports de um arquivo: [{ especificador, nomes[] }] (estaticos e import() dinamico). */
export function extrairImports(texto) {
  const out = [];
  for (const m of texto.matchAll(/import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
    if (m[1]) continue;
    const nomes = [...m[2].matchAll(/\b([A-Za-z_$][\w$]*)\b(?!\s*as\b)/g)].map((x) => x[1])
      .filter((n) => !['type', 'as', 'default'].includes(n));
    out.push({ especificador: m[3], nomes });
  }
  for (const m of texto.matchAll(/(?:import|export)\s*(?:\*\s*from\s*)?['"]([^'"]+)['"]/g)) out.push({ especificador: m[1], nomes: [] });
  for (const m of texto.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push({ especificador: m[1], nomes: [] });
  for (const m of texto.matchAll(/export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g)) out.push({ especificador: m[1], nomes: [] });
  return out;
}

/**
 * Mapa nome -> valor dos `const NOME = 'literal'` (ou `export const`) de nivel de modulo no texto.
 * So resolve o caso mais comum do repo: identificador passado direto pra `.from`/`fromTable`/
 * `storage.from`/`rpc`/`invoke` que e, no mesmo arquivo, uma constante de string (ex.:
 * `TALKX_MEDIA_BUCKET`, `ACL_ALERTS_TABLE`). Nao resolve parametro de funcao nem ternario.
 * Coluna zero sozinha nao basta (achado do Qodo na revisao desta correcao): um `const` dentro
 * de funcao tambem pode estar em coluna zero se o arquivo nao passou pelo Prettier (o repo nao
 * tem `prettier --check` no CI). Por isso conta profundidade de `{`/`}` linha a linha e so
 * aceita o `const` quando a profundidade, ANTES de processar a linha, e zero (nivel de modulo
 * de verdade). Contagem ingenua (nao ignora chave dentro de string/template) e de proposito:
 * na duvida, prefere nao resolver a resolver errado.
 */
function constantesDeString(texto) {
  const mapa = new Map();
  let profundidade = 0;
  for (const linha of texto.split('\n')) {
    if (profundidade === 0) {
      const m = linha.match(/^(?:export\s+)?const\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[^=]+)?=\s*['"`]([A-Za-z0-9_.-]+)['"`]\s*[;,]?\s*$/);
      if (m) mapa.set(m[1], m[2]);
    }
    for (const ch of linha) {
      if (ch === '{') profundidade++;
      else if (ch === '}') profundidade--;
    }
  }
  return mapa;
}

/**
 * Chamadas ao Supabase num texto: tabelas (`.from` do cliente, `fromTable(...)` e
 * `/rest/v1/<tabela>`), buckets (`storage.from`), RPCs (`.rpc`) e edges (`functions.invoke`,
 * `invokeEdge`, `/functions/v1/<edge>`). Mesmo extrator do Zapp_Web_V2.
 */
export function extrairChamadas(texto) {
  const pegar = (re) => [...texto.matchAll(re)].map((m) => m[1]);
  const consts = constantesDeString(texto);
  const tabelas = [];
  const buckets = [];
  for (const m of texto.matchAll(/(\bstorage\s*)?\.from\(\s*['"`]([A-Za-z0-9_-]+)['"`]/g)) (m[1] ? buckets : tabelas).push(m[2]);
  for (const m of texto.matchAll(/(\bstorage\s*)?\.from\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g)) {
    if (consts.has(m[2])) (m[1] ? buckets : tabelas).push(consts.get(m[2]));
  }
  // `fromTable('x')` / `fromTable(CONST)` — atalho tipado de src/lib/supabaseHelpers.ts, sempre tabela.
  for (const m of texto.matchAll(/\bfromTable\(\s*['"`]([A-Za-z0-9_-]+)['"`]/g)) tabelas.push(m[1]);
  for (const m of texto.matchAll(/\bfromTable\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g)) {
    if (consts.has(m[1])) tabelas.push(consts.get(m[1]));
  }
  tabelas.push(...pegar(/\/rest\/v1\/([A-Za-z0-9_]+)/g).filter((t) => t !== 'rpc'));
  return {
    tabelas,
    buckets,
    // `.rpc('x')` e o apelido `const rpc = supabase.rpc.bind(...)` + `rpc('x')`.
    rpcs: [...pegar(/(?:\.|\b)rpc\(\s*['"`]([A-Za-z0-9_]+)['"`]/g), ...pegar(/\/rest\/v1\/rpc\/([A-Za-z0-9_]+)/g)],
    // `functions.invoke` (inclusive quebrado em linha) e o atalho `invokeEdge<T>(...)` de
    // src/lib/invokeEdge.ts; `invoke('evolution-api/connect')` conta como a edge `evolution-api`.
    // `fetch(`${SUPABASE_URL}/functions/v1/get-call-recording`)` (chamada direta pela URL): so dentro
    // de string/template; a URL mostrada como texto em JSX (ex.: GmailWebhookMonitor) nao e chamada.
    edges: [
      ...pegar(/(?:functions\s*\.\s*invoke|\binvokeEdge)(?:<[^>()]*>)?\(\s*['"`]([A-Za-z0-9_-]+)(?:\/[^'"`]*)?['"`]/g),
      ...pegar(/['"`][^'"`\n]*\/functions\/v1\/([A-Za-z0-9_-]+)/g),
    ],
  };
}

const ehTeste = (p) => /(\.test\.|\.spec\.|__tests__|\.stories\.)/.test(p);

/**
 * Fecho de imports a partir do arquivo da tela. Segue sem limite a pasta da tela, src/hooks/,
 * src/services/, src/lib/, src/features/ e src/contexts/; componentes de src/components/ entram ate
 * MAX_SALTOS_FEATURE saltos. Fica de fora so o kit de UI (src/components/ui/) e teste. Import
 * local que nao resolve vira problema.
 */
export const MAX_SALTOS_FEATURE = 3; // paginas do Promo sao cascas finas: o conteudo mora em src/components/<dominio>/
export function fechoDaTela(raiz, arquivoTelaAbs) {
  const pastaFeature = path.dirname(arquivoTelaAbs);
  const dentro = (abs, rel_) => abs.startsWith(path.join(raiz, rel_) + path.sep);
  const livre = (abs) => abs.startsWith(pastaFeature + path.sep) || ['src/hooks', 'src/services', 'src/lib', 'src/features', 'src/contexts'].some((d) => dentro(abs, d));
  const outraFeature = (abs) => dentro(abs, 'src/components') && !dentro(abs, 'src/components/ui');
  const saltosVistos = new Map(); // arquivo -> menor numero de saltos com que foi visitado
  const hooks = new Map();
  const quebrados = new Set();
  const chamadas = { tabelas: [], buckets: [], rpcs: [], edges: [] };
  const fila = [[arquivoTelaAbs, 0]];
  while (fila.length) {
    const [atual, saltos] = fila.shift();
    if (saltosVistos.has(atual) && saltosVistos.get(atual) <= saltos) continue;
    const primeiraVez = !saltosVistos.has(atual);
    saltosVistos.set(atual, saltos);
    const texto = fs.readFileSync(atual, 'utf8');
    if (primeiraVez) {
      const c = extrairChamadas(texto);
      for (const k of Object.keys(chamadas)) chamadas[k].push(...c[k]);
    }
    for (const imp of extrairImports(texto)) {
      const alvo = resolverImport(raiz, atual, imp.especificador);
      if (alvo === undefined && !/\.(css|scss|svg|png|jpe?g|webp|gif|json)(\?.*)?$|\?/.test(imp.especificador)) {
        quebrados.add(`${rel(raiz, atual)} -> ${imp.especificador}`);
      }
      if (!alvo || ehTeste(alvo)) continue;
      for (const nome of imp.nomes) if (/^use[A-Z]/.test(nome) && !hooks.has(nome)) hooks.set(nome, rel(raiz, alvo));
      if (livre(alvo)) fila.push([alvo, saltos]);
      else if (outraFeature(alvo) && saltos < MAX_SALTOS_FEATURE) fila.push([alvo, saltos + 1]);
    }
  }
  return {
    arquivos_lidos: saltosVistos.size,
    hooks: [...hooks.entries()].map(([nome, arquivo]) => ({ nome, arquivo })).sort((a, b) => a.nome.localeCompare(b.nome)),
    buckets: unico(chamadas.buckets),
    edges: unico(chamadas.edges),
    rpcs: unico(chamadas.rpcs),
    tabelas: unico(chamadas.tabelas),
    imports_quebrados: [...quebrados].sort(),
  };
}

/** Tags que embrulham a pagina e nao sao a pagina. */
const EMBRULHOS = new Set(['ProtectedRoute', 'Navigate', 'Route', 'Routes', 'Suspense', 'ErrorBoundary', 'MainLayout',
  'PageTransition', 'Admin', 'Manager', 'RaceTransitionWrapper', 'React']);

/** Componentes importados/declarados em AppRoutes.tsx -> arquivo do repo. */
function mapaDeComponentes(raiz) {
  const absRotas = path.join(raiz, ARQ_ROTAS);
  const absLazy = path.join(raiz, ARQ_LAZY);
  const texto = ler(raiz, ARQ_ROTAS);
  const mapa = {};
  if (fs.existsSync(absLazy)) {
    const lazyTexto = fs.readFileSync(absLazy, 'utf8');
    for (const m of lazyTexto.matchAll(/export\s+const\s+(\w+)\s*=\s*\w+\(\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const alvo = resolverImport(raiz, absLazy, m[2]);
      if (alvo && !(m[1] in mapa)) mapa[m[1]] = rel(raiz, alvo);
    }
  }
  for (const m of texto.matchAll(/const\s+(\w+)\s*=\s*lazy\w*\(\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const alvo = resolverImport(raiz, absRotas, m[2]);
    if (alvo) mapa[m[1]] = rel(raiz, alvo);
  }
  for (const imp of extrairImports(texto)) {
    const alvo = resolverImport(raiz, absRotas, imp.especificador);
    if (!alvo || alvo === absLazy) continue;
    for (const nome of imp.nomes) if (/^[A-Z]/.test(nome) && !(nome in mapa)) mapa[nome] = rel(raiz, alvo);
  }
  for (const m of texto.matchAll(/^const\s+([A-Z]\w*)\s*=/gm)) if (!(m[1] in mapa)) mapa[m[1]] = ARQ_ROTAS;
  return mapa;
}

/** URLs do react-router em AppRoutes.tsx, com nivel de acesso. */
export function lerUrls(raiz) {
  const texto = ler(raiz, ARQ_ROTAS);
  const componentes = mapaDeComponentes(raiz);
  const corpo = texto.slice(texto.indexOf('<Routes>'), texto.lastIndexOf('</Routes>'));
  let dentroDoLayout = false; // rotas depois de path="/*" herdam o ProtectedRoute global do MainLayout
  const urls = [];
  for (const pedaco of corpo.split(/<Route\b/).slice(1)) {
    const caminho = (pedaco.match(/path=["']([^"']+)["']/) || [])[1];
    if (!caminho) continue;
    if (caminho === '/*') { dentroDoLayout = true; continue; }
    const redireciona = (pedaco.match(/<Navigate\s+to=["']([^"']+)["']/) || [])[1] ?? null;
    const componente = [...pedaco.matchAll(/<([A-Z]\w*)/g)].map((m) => m[1]).find((n) => !EMBRULHOS.has(n)) ?? null;
    const papel = (pedaco.match(/requiredRole=["']([^"']+)["']/) || [])[1];
    const protegida = dentroDoLayout || pedaco.includes('<ProtectedRoute');
    const acesso = /<Admin>/.test(pedaco) || papel === 'admin' ? 'admin'
      : /<Manager>|requireAdminOrManager/.test(pedaco) ? 'admin_ou_gestor'
        : papel ? papel : protegida ? 'autenticado' : 'publica';
    urls.push({ caminho, componente, arquivo: componente ? (componentes[componente] ?? null) : null, protegida, acesso, redireciona });
  }
  return urls;
}

/** Itens do menu lateral: [{ url, rotulo, perfil, grupo }] (perfil = sdr | closer | gestao | sistema | admin). */
export function lerMenu(raiz) {
  if (!fs.existsSync(path.join(raiz, ARQ_MENU))) return [];
  const texto = ler(raiz, ARQ_MENU);
  const blocos = [...texto.matchAll(/(?:export\s+)?const\s+(\w+)\s*:\s*Menu(?:Item|Group)\[\]\s*=\s*\[/g)]
    .map((m) => ({ nome: m[1], inicio: m.index }));
  const perfilDe = (nome) => (/^sdr/.test(nome) ? 'sdr' : /^closer/.test(nome) ? 'closer' : /^gestao/.test(nome) ? 'gestao'
    : /^system/.test(nome) ? 'sistema' : /^admin/i.test(nome) ? 'admin' : nome);
  const itens = [];
  for (let i = 0; i < blocos.length; i += 1) {
    const bloco = texto.slice(blocos[i].inicio, blocos[i + 1]?.inicio ?? texto.length);
    const grupos = [...bloco.matchAll(/label:\s*'([^']+)',\s*\n\s*icon:\s*\w+,\s*\n\s*items:/g)].map((m) => ({ label: m[1], pos: m.index }));
    for (const m of bloco.matchAll(/\{\s*title:\s*'([^']+)',\s*url:\s*'([^']+)'/g)) {
      itens.push({ url: m[2], rotulo: m[1], perfil: perfilDe(blocos[i].nome), grupo: grupos.filter((g) => g.pos < m.index).pop()?.label ?? null });
    }
  }
  return itens;
}

/** O caminho do react-router casa com a URL concreta do menu? (`:param` = um segmento; `*` = o resto) */
export function casa(caminho, url) {
  const alvo = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const padrao = caminho.replace(/\/+$/, '') || '/';
  if (padrao === '*') return false; // catch-all (NotFound) nao conta como rota da URL
  const re = new RegExp(`^${padrao.split('/').map((s) => (s === '*' ? '.*' : s.startsWith(':') ? '[^/]+' : s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('/')}$`);
  return re.test(alvo);
}

/** Monta o inventario inteiro a partir de uma raiz de repo. */
export function gerarRotas(raiz = RAIZ_PADRAO) {
  const urlsBase = lerUrls(raiz);
  const menu = lerMenu(raiz);
  const cache = new Map();
  const vazio = { arquivos_lidos: 0, hooks: [], buckets: [], edges: [], rpcs: [], tabelas: [], imports_quebrados: [] };
  const fecho = (arquivo) => {
    if (!arquivo || arquivo === ARQ_ROTAS) return vazio;
    if (!cache.has(arquivo)) cache.set(arquivo, fechoDaTela(raiz, path.join(raiz, arquivo)));
    return cache.get(arquivo);
  };
  const urls = urlsBase.map((u) => ({
    ...u,
    menu: menu.filter((m) => casa(u.caminho, m.url)).map(({ rotulo, perfil, grupo }) => ({ rotulo, perfil, grupo }))
      .sort((a, b) => `${a.perfil}${a.grupo}${a.rotulo}`.localeCompare(`${b.perfil}${b.grupo}${b.rotulo}`)),
    ...(u.redireciona ? vazio : fecho(u.arquivo)),
  })).sort((a, b) => a.caminho.localeCompare(b.caminho));

  const hooks = {};
  for (const u of urls) for (const h of u.hooks) {
    hooks[h.nome] ??= { arquivo: h.arquivo, urls: [] };
    hooks[h.nome].urls.push(u.caminho);
  }

  const contagem = urlsBase.reduce((acc, u) => { acc[u.caminho] = (acc[u.caminho] || 0) + 1; return acc; }, {});
  const quebrados = new Map();
  for (const u of urls) for (const q of u.imports_quebrados) if (!quebrados.has(q)) quebrados.set(q, u.caminho);
  const problemas = [
    ...[...new Set(menu.map((m) => m.url))].filter((url) => !urlsBase.some((u) => casa(u.caminho, url))).sort()
      .map((url) => ({ tipo: 'menu_sem_rota', id: url, detalhe: `item "${menu.find((m) => m.url === url).rotulo}" do menu sem <Route> em ${ARQ_ROTAS} (cai no NotFound)` })),
    ...urls.filter((u) => u.componente && !u.arquivo && !u.redireciona)
      .map((u) => ({ tipo: 'rota_sem_arquivo', id: u.caminho, detalhe: `${u.componente} nao resolve em ${ARQ_LAZY}/${ARQ_ROTAS}` })),
    ...Object.entries(contagem).filter(([, n]) => n > 1).map(([c]) => c).sort()
      .map((c) => ({ tipo: 'rota_duplicada', id: c, detalhe: `path declarado ${contagem[c]} vezes; o react-router usa so um` })),
    ...[...quebrados.entries()].sort().map(([q, c]) => ({ tipo: 'import_quebrado', id: c, detalhe: q })),
  ];
  const foraDoMenu = urls.filter((u) => !u.redireciona && u.arquivo && !u.menu.length && !u.caminho.includes(':') && u.caminho !== '*')
    .map((u) => u.caminho);

  return {
    format_version: 1,
    fonte: `scripts/inventario/gerar-rotas.mjs (le ${ARQ_ROTAS}, ${ARQ_LAZY}, ${ARQ_MENU} e os imports de cada pagina)`,
    resumo: {
      urls: urls.length,
      paginas_distintas: new Set(urls.map((u) => u.arquivo).filter(Boolean)).size,
      itens_de_menu: menu.length,
      urls_fora_do_menu: foraDoMenu.length,
      hooks_distintos: Object.keys(hooks).length,
      problemas: problemas.length,
    },
    urls,
    fora_do_menu: { criterio: 'URL sem parametro, com pagina e sem item no menu lateral (acesso so por link/atalho)', lista: foraDoMenu },
    hooks: Object.fromEntries(Object.keys(hooks).sort().map((k) => [k, { arquivo: hooks[k].arquivo, urls: unico(hooks[k].urls) }])),
    problemas,
  };
}

export const serializar = (inv) => JSON.stringify(inv, null, 2) + '\n';

function main(argv) {
  const saida = path.join(RAIZ_PADRAO, SAIDA_REL);
  const conteudo = serializar(gerarRotas(RAIZ_PADRAO));
  if (argv.includes('--check')) {
    const atual = fs.existsSync(saida) ? fs.readFileSync(saida, 'utf8') : '';
    if (atual !== conteudo) {
      console.error(`${SAIDA_REL} desatualizado: rode node scripts/inventario/gerar-rotas.mjs e commite o resultado.`);
      process.exit(1);
    }
    console.log(`${SAIDA_REL} em dia.`);
    return;
  }
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, conteudo);
  const r = JSON.parse(conteudo).resumo;
  console.log(`rotas.json: ${r.urls} URLs, ${r.paginas_distintas} paginas, ${r.itens_de_menu} itens de menu, ${r.hooks_distintos} hooks, ${r.problemas} problemas.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
