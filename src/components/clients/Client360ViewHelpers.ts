/**
 * Pure helpers for Client360View.
 * Extracted to keep the main component below the 400-LoC limit.
 */
import type { Client360Data } from '@/hooks/crm/useClient360';

export interface SelectedOrder {
  id?: string | number;
  status?: string;
  sdr?: { name?: string };
  salesperson?: { name?: string };
  closer?: { name?: string };
  source?: string;
  is_first_sale?: boolean;
  created_at?: string;
  version?: string;
  product_name?: string;
  sku?: string;
  amount?: number | string;
  [key: string]: unknown;
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function extractCategories(orders: Client360Data['orders'] | undefined): string[] {
  if (!orders) return [];
  const cats = new Set<string>();
  orders.forEach(o => {
    if (o.product_name) cats.add(String(o.product_name).split(' ')[0]);
  });
  return Array.from(cats);
}

export interface FilterArgs {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  valueRange: [number, number];
}

export function filterOrders(
  orders: Client360Data['orders'] | undefined,
  { searchTerm, statusFilter, categoryFilter, valueRange }: FilterArgs
): Client360Data['orders'] {
  if (!orders) return [];
  const terms = searchTerm.toLowerCase().split(' ').filter(Boolean);
  return orders.filter(order => {
    const productName = String(order.product_name || '').toLowerCase();
    const sku = String(order.sku || '').toLowerCase();
    const status = String(order.status || '').toLowerCase();

    const matchesSearch =
      terms.length === 0 ||
      terms.every(t => productName.includes(t) || sku.includes(t) || status.includes(t));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || productName.startsWith(categoryFilter.toLowerCase());
    const amount = Number(order.amount || 0);
    const matchesValue = amount >= valueRange[0] && amount <= valueRange[1];

    return matchesSearch && matchesStatus && matchesCategory && matchesValue;
  });
}

export function computeSegmentDiff(value: number, segmentAverage: number): number {
  if (!segmentAverage) return 0;
  return ((value - segmentAverage) / segmentAverage) * 100;
}
