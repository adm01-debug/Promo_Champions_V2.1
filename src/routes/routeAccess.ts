/**
 * Nível de acesso das rotas, derivado de `AppRoutes.tsx`.
 *
 * O menu e a paleta de comandos precisam saber quais rotas o papel atual pode abrir
 * para não oferecer um caminho que termina em "Acesso Negado". As listas abaixo
 * acompanham os wrappers `<Admin>` (só admin) e `<Manager>` (admin ou gestor) do
 * roteador; `src/routes/routeAccess.test.ts` falha se elas divergirem.
 */

/** Rotas que exigem papel `admin`. */
export const adminOnlyRoutes: readonly string[] = [
  '/admin',
  '/admin/race-arena',
  '/admin/conexoes',
  '/admin/v4-callbacks',
  '/admin/quote-sync-inbound',
  '/admin/design-inbound',
  '/admin/quote-conversions',
  '/admin/platform-slo',
  '/admin/web-vitals',
  '/admin/tarefas',
  '/admin/webhooks-dead-letters',
  '/admin/webhooks-timeline',
  '/admin/webhooks-alert-history',
  '/admin/webhooks-alert-settings',
  '/admin/retry-test-status',
  '/usage-analytics',
  '/feature-flags',
  '/seguranca',
];

/** Rotas que exigem `admin` ou `manager`. */
export const managerOnlyRoutes: readonly string[] = [
  '/portfolio',
  '/icp',
  '/fonte-leads',
  '/playbooks',
  '/follow-up/audit',
  '/revenue-intelligence',
  '/revenue-forecast',
  '/revenue-forecast-v2',
  '/workflow-builder',
  '/automacao-inteligente',
  '/coaching-inteligente',
  '/assinatura-digital',
  '/fornecedores',
  '/comparador-precos',
  '/admin/comissoes',
  '/admin/regras-comissao',
  '/admin/premiacoes',
  '/admin/premiacoes/auditoria',
  '/admin/fila-tarefas-automaticas',
  '/admin/regras-inatividade',
  '/admin/alertas-churn',
  '/admin/alertas-churn/historico',
  '/admin/supressao-emails',
  '/admin/solicitacoes-titular',
  '/webhooks',
  '/audit-logs',
  '/sla-tracking',
  '/lead-routing',
  '/workflows',
  '/analytics',
  '/analytics/abc',
  '/analytics/closing-time',
  '/analytics/deal-velocity',
  '/analytics/evolution',
  '/analytics/objections',
  '/analytics/win-loss',
  '/relatorios',
  '/bi-gestor',
  '/relatorio-atividades',
  '/analytics/emails',
  '/relatorios-executivos',
  '/relatorios-agendados',
  '/roi',
  '/forecast',
  '/previsao-demanda',
  '/revops',
  '/ferramentas/bi',
  '/relatorios/funil',
  '/relatorios/cohort',
  '/evolucao-precos',
  '/customer-success',
  '/pricing-intelligence',
  '/territory-optimization',
  '/customer-success-360',
  '/competitive-seasons',
  '/vendedores',
  '/metas',
  '/times',
  '/estoque',
  '/deduplicacao',
  '/importar-exportar',
  '/gatilhos-inatividade',
  '/bitrix24',
  '/admin/telemetria',
  '/admin/comercial',
];

export interface RouteAccess {
  isAdmin: boolean;
  isManager: boolean;
}

function descendantOf(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + '/');
}

/**
 * Nível exigido por uma rota; `null` quando ela é aberta a qualquer autenticado.
 * O prefixo mais longo vence, para que `/admin/comissoes` (gestor) não seja
 * capturado por `/admin` (exclusivo de admin).
 */
export function requiredRoleFor(path: string): 'admin' | 'manager' | null {
  const clean = (path.split('?')[0] ?? '').replace(/\/+$/, '') || '/';
  const adminHit = adminOnlyRoutes
    .filter(route => descendantOf(clean, route))
    .sort(byLength)[0];
  const managerHit = managerOnlyRoutes
    .filter(route => descendantOf(clean, route))
    .sort(byLength)[0];
  if (!adminHit && !managerHit) return null;
  if (!managerHit) return 'admin';
  if (!adminHit) return 'manager';
  return adminHit.length >= managerHit.length ? 'admin' : 'manager';
}

function byLength(a: string, b: string): number {
  return b.length - a.length;
}

/** Indica se o papel atual pode abrir a rota. */
export function canAccessPath(path: string, access: RouteAccess): boolean {
  const required = requiredRoleFor(path);
  if (required === 'admin') return access.isAdmin;
  if (required === 'manager') return access.isAdmin || access.isManager;
  return true;
}

interface RoutedItem {
  url: string;
}

/** Mantém só os itens cujo destino o papel atual pode abrir. */
export function filterItemsByAccess<T extends RoutedItem>(
  items: readonly T[],
  access: RouteAccess
): T[] {
  return items.filter(item => canAccessPath(item.url, access));
}

/** Filtra os itens de cada grupo e descarta os grupos que ficaram vazios. */
export function filterGroupsByAccess<G extends { items: RoutedItem[] }>(
  groups: readonly G[],
  access: RouteAccess
): G[] {
  const kept: G[] = [];
  for (const group of groups) {
    const items = filterItemsByAccess(group.items, access);
    if (items.length === 0) continue;
    kept.push(Object.assign({}, group, { items }));
  }
  return kept;
}
