import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WON_SALE_STATUSES, CACHE_TIMES } from '@/constants';
import { differenceInDays, parseISO } from 'date-fns';

export type ContactUrgency = 'critical' | 'high' | 'medium' | 'low';

export interface ClientContactAlert {
  clientId: string | null;
  clientName: string;
  phone: string | null;
  email: string | null;
  daysSinceLastPurchase: number;
  averageIntervalDays: number;
  purchaseCount: number;
  totalRevenue: number;
  lastPurchaseDate: string;
  churnRisk: number; // 0-100
  urgency: ContactUrgency;
  reasons: string[];
}

interface Options {
  salespersonId?: string;
  limit?: number;
}

const urgencyFrom = (risk: number, daysSince: number): ContactUrgency => {
  if (risk >= 70 || daysSince >= 90) return 'critical';
  if (risk >= 45 || daysSince >= 45) return 'high';
  if (risk >= 20 || daysSince >= 21) return 'medium';
  return 'low';
};

export const useClientsNeedingContact = ({ salespersonId, limit = 10 }: Options = {}) => {
  return useQuery<ClientContactAlert[]>({
    queryKey: ['clients-needing-contact', salespersonId, limit],
    enabled: !!salespersonId,
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    queryFn: async () => {
      if (!salespersonId) return [];

      const { data: sales, error } = await supabase
        .from('sales')
        .select('client_id, client_name, amount, created_at, status')
        .or(
          `salesperson_id.eq.${salespersonId},sdr_id.eq.${salespersonId},closer_id.eq.${salespersonId}`
        )
        .in('status', [...WON_SALE_STATUSES])
        .order('created_at', { ascending: true });

      if (error) throw error;

      const grouped = new Map<
        string,
        {
          clientId: string | null;
          clientName: string;
          dates: Date[];
          total: number;
        }
      >();

      (sales || []).forEach((s) => {
        const key = (s.client_id as string | null) || `name:${s.client_name}`;
        if (!key) return;
        const entry = grouped.get(key) ?? {
          clientId: (s.client_id as string | null) ?? null,
          clientName: s.client_name,
          dates: [],
          total: 0,
        };
        entry.dates.push(parseISO(s.created_at));
        entry.total += Number(s.amount || 0);
        grouped.set(key, entry);
      });

      const clientIds = Array.from(grouped.values())
        .map((g) => g.clientId)
        .filter((id): id is string => !!id);

      const contactMap = new Map<string, { phone: string | null; email: string | null }>();
      if (clientIds.length > 0) {
        const { data: clients } = await supabase
          .from('clients')
          .select('id, phone, email')
          .in('id', clientIds);
        (clients || []).forEach((c) =>
          contactMap.set(c.id, { phone: c.phone ?? null, email: c.email ?? null })
        );
      }

      const now = new Date();
      const results: ClientContactAlert[] = [];

      grouped.forEach((entry) => {
        const dates = entry.dates.sort((a, b) => a.getTime() - b.getTime());
        const last = dates[dates.length - 1];
        const daysSince = differenceInDays(now, last);

        let avgInterval = 0;
        if (dates.length >= 2) {
          const intervals: number[] = [];
          for (let i = 1; i < dates.length; i++) {
            intervals.push(differenceInDays(dates[i], dates[i - 1]));
          }
          avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        }

        let churnRisk = 0;
        const reasons: string[] = [];

        if (avgInterval > 0 && daysSince > avgInterval * 1.2) {
          churnRisk = Math.min(
            100,
            Math.round(((daysSince - avgInterval) / avgInterval) * 60)
          );
          reasons.push(
            `Compra a cada ~${Math.round(avgInterval)}d, atrasado ${daysSince - Math.round(avgInterval)}d`
          );
        } else if (daysSince >= 30) {
          churnRisk = Math.min(100, daysSince);
          reasons.push(`Sem comprar há ${daysSince} dias`);
        }

        const contact = entry.clientId ? contactMap.get(entry.clientId) : undefined;
        if (!contact?.phone) reasons.push('Sem telefone cadastrado');

        // Only surface clients that actually need attention
        if (daysSince < 14 && churnRisk < 20) return;

        results.push({
          clientId: entry.clientId,
          clientName: entry.clientName,
          phone: contact?.phone ?? null,
          email: contact?.email ?? null,
          daysSinceLastPurchase: daysSince,
          averageIntervalDays: Math.round(avgInterval),
          purchaseCount: dates.length,
          totalRevenue: entry.total,
          lastPurchaseDate: last.toISOString(),
          churnRisk,
          urgency: urgencyFrom(churnRisk, daysSince),
          reasons,
        });
      });

      const urgencyRank: Record<ContactUrgency, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      return results
        .sort((a, b) => {
          const u = urgencyRank[a.urgency] - urgencyRank[b.urgency];
          if (u !== 0) return u;
          if (b.churnRisk !== a.churnRisk) return b.churnRisk - a.churnRisk;
          return b.daysSinceLastPurchase - a.daysSinceLastPurchase;
        })
        .slice(0, limit);
    },
  });
};
