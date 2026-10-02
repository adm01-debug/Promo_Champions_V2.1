/**
 * Mapa rota → import dinâmico da página, usado pela sidebar para prefetch
 * no hover. Módulo neutro de propósito: só declara `import()` dinâmicos,
 * sem nenhum import estático de pages/components — assim quem o consome
 * (AppSidebar) não puxa o grafo inteiro de páginas para dentro do seu
 * próprio grafo de dependências, que era o que fechava o ciclo
 * MainLayout ↔ lazyPages.
 *
 * Manter em sincronia com `lazyPages.ts` (o caminho `@/pages/X` é o mesmo
 * que o lazy component correspondente importa).
 */
export type RoutePrefetcher = () => Promise<unknown>;

export const routePrefetchMap: Record<string, RoutePrefetcher> = {
  '/sdr': () => import('@/pages/SDRDashboard'),
  '/closer': () => import('@/pages/CloserDashboard'),
  '/pipeline': () => import('@/pages/Pipeline'),
  '/atividades': () => import('@/pages/Atividades'),
  '/clientes': () => import('@/pages/Clientes'),
  '/agenda': () => import('@/pages/Agenda'),
  '/ranking': () => import('@/pages/RankingCompetitivo'),
  '/arena': () => import('@/pages/ArenaCompetitiva'),
  '/race-arena': () => import('@/pages/RaceArenaHub'),
  '/orcamentos': () => import('@/pages/Orcamentos'),
  '/cadencias-orcamentos': () => import('@/pages/QuoteCadencesPage'),
  '/vendas': () => import('@/pages/Vendas'),
  '/comissoes': () => import('@/pages/Comissoes'),
  '/vendedores': () => import('@/pages/Vendedores'),
  '/metas': () => import('@/pages/Metas'),
  '/analytics': () => import('@/pages/Analytics'),
  '/relatorios': () => import('@/pages/Relatorios'),
  '/configuracoes': () => import('@/pages/Configuracoes'),
  '/notificacoes': () => import('@/pages/Notificacoes'),
  '/admin': () => import('@/pages/AdminDashboard'),
  '/bi-gestor': () => import('@/pages/BIGestor'),
  '/bi-sdr': () => import('@/pages/BISDR'),
  '/bi-closer': () => import('@/pages/BICloser'),
  '/funil': () => import('@/pages/FunnelAnalysis'),
  '/nps': () => import('@/pages/NPSDashboard'),
  '/assistente': () => import('@/pages/Assistente'),
};
