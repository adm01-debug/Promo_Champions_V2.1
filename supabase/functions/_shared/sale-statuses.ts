// Conjuntos canônicos de sales.status para edge functions — espelho de
// src/constants/index.ts (WON_SALE_STATUSES/LOST_SALE_STATUSES) e do CHECK
// sales_status_check (migration 20260224142333): domínio completo =
// ('completed','pending','cancelled','lead','qualified','proposal',
//  'negotiation','closed','prospecting','won','lost').
//
// "Ganha" = 'completed' (entrada manual) + aliases do sync Bitrix24
// ('won','closed'). Filtros devem usar SEMPRE o conjunto completo:
// `.eq('status','completed')` subconta receita/vitórias e vocabulário
// inexistente ('closed_won'/'closed_lost') não casa nenhuma linha — e um
// `.not('status','in',...)` ainda exclui silenciosamente linhas com status
// NULL (NOT IN sobre NULL avalia NULL). Usar `.in('status', OPEN_*)` que
// também exclui NULL, de forma explícita.

export const WON_SALE_STATUSES = ["completed", "won", "closed"] as const;
export const LOST_SALE_STATUSES = ["lost", "cancelled"] as const;
export const OPEN_SALE_STATUSES = [
  "lead",
  "prospecting",
  "qualified",
  "proposal",
  "negotiation",
  "pending",
] as const;

export const isWonSaleStatus = (status: string | null | undefined): boolean =>
  !!status && (WON_SALE_STATUSES as readonly string[]).includes(status);

export const isLostSaleStatus = (status: string | null | undefined): boolean =>
  !!status && (LOST_SALE_STATUSES as readonly string[]).includes(status);

export const isOpenSaleStatus = (status: string | null | undefined): boolean =>
  !!status && !isWonSaleStatus(status) && !isLostSaleStatus(status);
