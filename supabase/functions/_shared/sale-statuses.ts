// Status canônicos de public.sales.status (espelho de src/constants/index.ts —
// edge functions Deno não importam o src do front).
// Enum real (CHECK constraint): completed, pending, cancelled, lead, qualified,
// proposal, negotiation, closed, prospecting, won, lost.

export const WON_SALE_STATUSES = ['completed', 'won', 'closed'] as const;
export const LOST_SALE_STATUSES = ['lost', 'cancelled'] as const;
export const OPEN_SALE_STATUSES = [
  'lead',
  'pending',
  'qualified',
  'proposal',
  'negotiation',
  'prospecting',
] as const;

// União de decididos — para filtros "todos exceto decididos" ou exclusão .not/.in.
export const DECIDED_SALE_STATUSES = [
  ...WON_SALE_STATUSES,
  ...LOST_SALE_STATUSES,
] as const;

export function isWonSaleStatus(status: string | null | undefined): boolean {
  return !!status && (WON_SALE_STATUSES as readonly string[]).includes(status);
}

export function isLostSaleStatus(status: string | null | undefined): boolean {
  return !!status && (LOST_SALE_STATUSES as readonly string[]).includes(status);
}

export function isDecidedSaleStatus(status: string | null | undefined): boolean {
  return isWonSaleStatus(status) || isLostSaleStatus(status);
}

export function isOpenSaleStatus(status: string | null | undefined): boolean {
  return !!status && (OPEN_SALE_STATUSES as readonly string[]).includes(status);
}
