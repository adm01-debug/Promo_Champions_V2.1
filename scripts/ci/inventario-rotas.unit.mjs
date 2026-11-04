// Contrato de scripts/inventario/gerar-rotas.mjs (Promo): URLs de AppRoutes.tsx + lazyPages.ts, menu
// de sidebarMenuData.ts e, por pagina, os hooks/edges/RPCs/tabelas alcancados pelos imports.
// Repo de brinquedo para o comportamento; repo real para o contrato com o codigo de verdade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { gerarRotas, extrairChamadas, extrairImports, casa, lerMenu, ARQ_MENU } from '../inventario/gerar-rotas.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function repoDeBrinquedo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-rotas-'));
  const escrever = (rel, texto) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), texto);
  };
  escrever('src/routes/lazyPages.ts', [
    "const lazyWithPrefetch = (f) => f;",
    "export const Auth = lazyWithPrefetch(() => import('@/pages/Auth'));",
    "export const Clientes = lazyWithPrefetch(() => import('@/pages/Clientes'));",
    "export const Detalhe = lazyWithPrefetch(\n  () => import('@/pages/Detalhe'),\n);",
    "export const Painel = lazyWithPrefetch(() => import('@/pages/admin/Painel'));",
    "export const Equipe = lazyWithPrefetch(() => import('@/pages/Equipe'));",
    "export const Sumida = lazyWithPrefetch(() => import('@/pages/NaoExiste'));",
    "export const NotFound = lazyWithPrefetch(() => import('@/pages/NotFound'));",
  ].join('\n'));
  escrever('src/routes/AppRoutes.tsx', `import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Auth, Clientes, Detalhe, Painel, Equipe, Sumida, NotFound } from './lazyPages';
const Admin = ({ children }) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
const Manager = ({ children }) => <ProtectedRoute requireAdminOrManager>{children}</ProtectedRoute>;
const Velha = () => <Navigate to="/clientes" replace />;
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Navigate to="/clientes" replace />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:id" element={<Detalhe />} />
              <Route
                path="/admin/painel"
                element={
                  <Admin>
                    <Painel />
                  </Admin>
                }
              />
              <Route path="/equipe" element={<Manager><Equipe /></Manager>} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/sumida" element={<Sumida />} />
              <Route path="/velha" element={<Velha />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
`);
  escrever('src/components/layout/sidebar/sidebarMenuData.ts', `
const sdrMainItems: MenuItem[] = [
  { title: 'Clientes', url: '/clientes', icon: Users },
];
const gestaoGroupedItems: MenuGroup[] = [
  {
    label: 'Gestão de Equipe',
    icon: Users,
    items: [
      { title: 'Equipe', url: '/equipe', icon: Users },
      { title: 'Fantasma', url: '/nao-tem-rota', icon: Users },
    ],
  },
];
export const adminOnlyItems: MenuItem[] = [
  { title: 'Painel', url: '/admin/painel?aba=1', icon: Shield },
];
`);
  escrever('src/pages/Auth.tsx', "export default function Auth() { return supabase.rpc('login_lockout'); }");
  escrever('src/pages/Clientes.tsx', "import { useClientes } from '@/hooks/useClientes';\nimport { Lista } from '@/components/clientes/Lista';\nimport './x.css';\nimport { Q } from './nao-existe';\nexport default function Clientes() { useClientes(); return <Lista />; }");
  escrever('src/hooks/useClientes.ts', "import { svc } from '@/services/clientes';\nexport const useClientes = () => supabase.from('clients').select();");
  escrever('src/services/clientes.ts', "export const svc = () => supabase.functions.invoke('lead-scoring');");
  escrever('src/components/clientes/Lista.tsx', "import { A } from './A';\nexport const Lista = () => supabase.from('nivel1');");
  escrever('src/components/clientes/A.tsx', "import { B } from './B';\nexport const A = () => supabase.from('nivel2');");
  escrever('src/components/clientes/B.tsx', "import { C } from './C';\nexport const B = () => supabase.from('nivel3');");
  escrever('src/components/clientes/C.tsx', "export const C = () => supabase.from('alem_do_limite');");
  escrever('src/pages/Detalhe.tsx', "export default function D() { return supabase.from('clients'); }");
  escrever('src/pages/admin/Painel.tsx', "export default function P() { return supabase.rpc('admin_rpc'); }");
  escrever('src/pages/Equipe.tsx', "export default function E() { return null; }");
  escrever('src/pages/NotFound.tsx', "export default function N() { return null; }");
  return dir;
}

test('repo de brinquedo: URLs, acesso, menu, fecho e problemas saem do codigo', () => {
  const dir = repoDeBrinquedo();
  const inv = gerarRotas(dir);
  const urls = Object.fromEntries(inv.urls.map((u) => [u.caminho, u]));
  assert.equal(urls['/auth'].acesso, 'publica');
  assert.equal(urls['/auth'].protegida, false);
  assert.deepEqual(urls['/auth'].rpcs, ['login_lockout']);
  assert.equal(urls['/clientes'].acesso, 'autenticado', 'dentro do path="/*" herda o ProtectedRoute global');
  assert.equal(urls['/clientes'].arquivo, 'src/pages/Clientes.tsx');
  assert.deepEqual(urls['/clientes'].menu, [{ rotulo: 'Clientes', perfil: 'sdr', grupo: null }]);
  assert.deepEqual(urls['/clientes'].hooks, [{ nome: 'useClientes', arquivo: 'src/hooks/useClientes.ts' }]);
  assert.deepEqual(urls['/clientes'].edges, ['lead-scoring'], 'segue hook -> service');
  assert.deepEqual(urls['/clientes'].tabelas, ['clients', 'nivel1', 'nivel2', 'nivel3'], 'componentes ate 3 saltos; o quarto fica de fora');
  assert.deepEqual(urls['/clientes'].imports_quebrados, ['src/pages/Clientes.tsx -> ./nao-existe'], 'css nao conta como quebrado');
  assert.equal(urls['/clientes/:id'].arquivo, 'src/pages/Detalhe.tsx', 'import() quebrado em linha resolve');
  assert.equal(urls['/admin/painel'].acesso, 'admin');
  assert.deepEqual(urls['/admin/painel'].menu, [{ rotulo: 'Painel', perfil: 'admin', grupo: null }], 'query string do menu nao atrapalha');
  assert.deepEqual(inv.urls.filter((u) => u.caminho === '/equipe').map((u) => u.acesso).sort(), ['admin_ou_gestor', 'autenticado'],
    '<Manager> = admin ou gestor; a segunda declaracao duplicada fica sem guarda');
  assert.equal(urls['/'].redireciona, '/clientes');
  assert.equal(urls['/velha'].arquivo, 'src/routes/AppRoutes.tsx', 'componente declarado no proprio AppRoutes');
  assert.equal(inv.hooks.useClientes.urls[0], '/clientes');
  const problemas = inv.problemas.map((p) => `${p.tipo}:${p.id}`).sort();
  assert.deepEqual(problemas, ['import_quebrado:/clientes', 'menu_sem_rota:/nao-tem-rota', 'rota_duplicada:/equipe', 'rota_sem_arquivo:/sumida']);
  assert.ok(!inv.fora_do_menu.lista.includes('/clientes'));
  assert.ok(inv.fora_do_menu.lista.includes('/auth'));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('casa: :param casa um segmento, * casa o resto e o catch-all nunca casa', () => {
  assert.equal(casa('/vendedor/:id', '/vendedor/123'), true);
  assert.equal(casa('/vendedor/:id', '/vendedor'), false);
  assert.equal(casa('/dashboard/*', '/dashboard/x/y'), true);
  assert.equal(casa('*', '/qualquer'), false);
  assert.equal(casa('/a', '/a?x=1#h'), true);
  assert.equal(casa('/a', '/a/'), true);
});

test('extratores: imports nomeados/dinamicos e chamadas ao Supabase', () => {
  const imps = extrairImports("import { useA, type T, useB as apelido } from '@/hooks/x';\nimport type { Z } from './z';\nconst m = import('./lazy');");
  assert.ok(imps.some((i) => i.especificador === '@/hooks/x' && i.nomes.includes('useA')));
  assert.ok(!imps.some((i) => i.especificador === './z' && i.nomes.length), 'import type nao conta');
  assert.ok(imps.some((i) => i.especificador === './lazy'));
  assert.deepEqual(extrairChamadas("db.from(`t1`); db.rpc('r1'); supabase.functions.invoke(\"e-1\", {})"),
    { tabelas: ['t1'], buckets: [], rpcs: ['r1'], edges: ['e-1'] });
  assert.deepEqual(
    extrairChamadas("supabase.storage.from('stickers').upload(); supabase.storage\n  .from('fotos'); db.from('stickers');"
      + " fetch(`${u}/rest/v1/so_rest?x=1`); fetch(`${u}/rest/v1/rpc/fn_rest`)"),
    { tabelas: ['stickers', 'so_rest'], buckets: ['stickers', 'fotos'], rpcs: ['fn_rest'], edges: [] },
    'storage.from e bucket, nao tabela; /rest/v1 conta tabela e rpc');
  assert.deepEqual(
    extrairChamadas("invokeEdge('message-delivery', {}); invokeEdge<{ ok: boolean }>(\"generico\"); supabase.functions\n  .invoke('quebrada');"
      + " invokeMultiplixDispatch('acao_nao_e_edge')").edges,
    ['message-delivery', 'generico', 'quebrada'], 'atalho invokeEdge (com generico) e invoke quebrado em linha');
});

test('repo real: toda URL com componente resolve para arquivo existente e todo item do menu entrou', () => {
  const inv = gerarRotas(raiz);
  assert.ok(inv.urls.length >= 100, `poucas URLs: ${inv.urls.length}`);
  for (const u of inv.urls.filter((x) => !x.redireciona && x.componente)) {
    assert.ok(u.arquivo && fs.existsSync(path.join(raiz, u.arquivo)), `URL ${u.caminho} sem arquivo`);
  }
  const menu = fs.readFileSync(path.join(raiz, ARQ_MENU), 'utf8');
  assert.equal(lerMenu(raiz).length, (menu.match(/\{\s*title:\s*'/g) || []).length, 'todo item do sidebarMenuData entrou');
  assert.ok(inv.urls.find((u) => u.caminho === '/clientes').hooks.length > 3, 'fecho de /clientes achou hooks');
});

test('rotas.json commitado esta em dia (rode node scripts/inventario/gerar-rotas.mjs)', () => {
  const commitado = JSON.parse(fs.readFileSync(path.join(raiz, 'inventario/estado/rotas.json'), 'utf8'));
  const estrutura = (inv) => ({ urls: inv.urls.map(({ caminho, componente, arquivo, acesso, redireciona, menu }) => ({ caminho, componente, arquivo, acesso, redireciona, menu })), problemas: inv.problemas });
  assert.deepEqual(estrutura(commitado), estrutura(gerarRotas(raiz)),
    'inventario/estado/rotas.json desatualizado: rode node scripts/inventario/gerar-rotas.mjs e commite');
});

test('extrairChamadas resolve fromTable literal e const de string do mesmo arquivo', () => {
  const texto = `
export const ACL_ALERTS_TABLE = 'security_acl_alerts';
const TALKX_MEDIA_BUCKET = 'talkx-media';
export function f() {
  fromTable('user_sessions').select('id');
  fromTable(ACL_ALERTS_TABLE).select('*');
  supabase.storage.from(TALKX_MEDIA_BUCKET).remove(['x']);
  supabase.storage.from(NAO_EXISTE).remove(['y']);
}`;
  const c = extrairChamadas(texto);
  assert.deepEqual(c.tabelas.sort(), ['security_acl_alerts', 'user_sessions']);
  assert.deepEqual(c.buckets, ['talkx-media']);
});

test('constantesDeString ignora const de bloco/funcao: nao mistura valor entre duas funcoes do mesmo arquivo', () => {
  const texto = `
export function handlerA() {
  const TABELA = 'tabela_a';
  return supabase.from(TABELA).select();
}
export function handlerB() {
  const TABELA = 'tabela_b';
  return supabase.from(TABELA).select();
}`;
  // Antes do fix, `^\s*const` casava a const indentada dentro da funcao como se fosse de
  // nivel de modulo; a ULTIMA declaracao do arquivo (tabela_b) sobrescrevia o mapa e as DUAS
  // chamadas resolviam para 'tabela_b' (falso positivo silencioso: handlerA nunca usa tabela_a
  // no inventario, e tabela_a nem aparece). Com `^` exigindo coluna zero, nenhuma das duas
  // consts de bloco resolve — o inventario corretamente nao finge saber a tabela.
  assert.deepEqual(extrairChamadas(texto).tabelas, [],
    'const declarada dentro de funcao nao e nivel de modulo: nao deve resolver nem misturar valor entre escopos');
});

test('constantesDeString nao trata const de funcao em coluna zero (sem Prettier) como nivel de modulo', () => {
  const texto = `
export function handlerA() {
const TABELA = 'tabela_a';
return supabase.from(TABELA).select();
}
export function handlerB() {
const TABELA = 'tabela_b';
return supabase.from(TABELA).select();
}`;
  // Achado do Qodo na revisao desta mesma correcao: coluna zero sozinha nao prova nivel de
  // modulo, porque o repo nao roda `prettier --check` no CI -- um arquivo sem Prettier pode ter
  // `const` de funcao sem indentacao nenhuma. Com o tracking de profundidade de chaves, nenhuma
  // das duas resolve (mesmo veredito do teste de const indentada acima).
  assert.deepEqual(extrairChamadas(texto).tabelas, [],
    'const de funcao em coluna zero nao deve ser tratada como nivel de modulo');
});
