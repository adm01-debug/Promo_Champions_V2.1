/** Seções válidas do dashboard (URL slug → chave interna).
 *  Exportado de um lugar só para Index.tsx e useDashboardRedirect usarem a mesma lista. */
export const DASHBOARD_SECTION_MAP: Record<string, string> = {
  performance: 'performance',
  analises: 'analytics',
  competicao: 'competition',
  inteligencia: 'intelligence',
  engajamento: 'engagement',
};

export const VALID_DASHBOARD_SECTIONS = Object.keys(DASHBOARD_SECTION_MAP);