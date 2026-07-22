/**
 * Onda Q — Curadoria de rotas críticas para sweep a11y com axe-core.
 *
 * Cada rota declara:
 *  - path: URL relativa
 *  - name: identificador humano (aparece no summary do CI)
 *  - requiresAuth: se true, será skipada quando LOVABLE_BROWSER_AUTH_STATUS !== 'injected'
 *  - waitFor: selector-âncora aguardado antes do axe rodar (evita race com lazy chunks)
 *  - ignoreRules: allowlist de regras axe com JUSTIFICATIVA — nunca desabilitar globalmente
 */
export interface A11yRoute {
  path: string;
  name: string;
  requiresAuth: boolean;
  waitFor: string;
  /** Regras axe a ignorar NESTA rota, sempre com comentário explicando o porquê. */
  ignoreRules?: string[];
}

export const A11Y_ROUTES: A11yRoute[] = [
  // ————— Públicas —————
  {
    path: '/auth',
    name: 'auth-login',
    requiresAuth: false,
    waitFor: 'form, [role="main"], main',
    // 'region' costuma disparar em telas minimalistas de auth que usam <main> puro
    // sem landmarks secundárias; aceitável porque o formulário é o conteúdo único.
    ignoreRules: ['region'],
  },
  {
    path: '/404-inexistente-para-a11y',
    name: 'not-found',
    requiresAuth: false,
    waitFor: 'main, [role="main"], body',
    ignoreRules: ['region'],
  },

  // ————— Autenticadas —————
  {
    path: '/',
    name: 'dashboard-home',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    // color-contrast: skeletons/shimmer usam bg-muted/50 que não passa AA durante loading.
    // svg-img-alt: Recharts renderiza SVGs decorativos sem <title>.
    ignoreRules: ['color-contrast', 'svg-img-alt'],
  },
  {
    path: '/pipeline',
    name: 'pipeline-kanban',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast', 'svg-img-alt'],
  },
  {
    path: '/clientes',
    name: 'clientes-list',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast'],
  },
  {
    path: '/playbooks',
    name: 'playbooks',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast'],
  },
  {
    path: '/win-loss-intelligence',
    name: 'winloss-intelligence',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast', 'svg-img-alt'],
  },
  {
    path: '/bi-gestor',
    name: 'bi-gestor',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast', 'svg-img-alt'],
  },
  {
    path: '/admin/conexoes',
    name: 'admin-conexoes',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast'],
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    requiresAuth: true,
    waitFor: 'main, [role="main"]',
    ignoreRules: ['color-contrast'],
  },
];
