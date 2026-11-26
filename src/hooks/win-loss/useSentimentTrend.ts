import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import { parseRows } from '@/lib/supabase/parseRows';
import { isLostSaleStatus, isWonSaleStatus } from '@/constants';
import { winRate } from '@/lib/winRate';

interface SentimentTrendPoint {
  quarter: string;
  avgSentiment: number;
  winRate: number;
  count: number;
}

interface InsightRow {
  sentiment_score: number | null;
  created_at: string;
  call_recordings?: { recorded_at: string | null; sale_id: string | null } | null;
}
interface SaleRow {
  id: string;
  status: string | null;
}

const quarterKey = (d: Date) => `${d.getFullYear()}·Q${Math.floor(d.getMonth() / 3) + 1}`;

export function useSentimentTrend() {
  return useQuery({
    queryKey: ['winloss-sentiment-trend'],
    queryFn: async (): Promise<SentimentTrendPoint[]> => {
      const since = new Date();
      since.setMonth(since.getMonth() - 18);

      // O sentimento numerico (-1..1) vive em call_insights.sentiment_score;
      // call_recordings.sentiment_score nao existe (a consulta antiga falhava
      // com 42703 e a serie ficava sempre vazia).
      const { data: recs } = await supabase
        .from('call_insights')
        .select('sentiment_score, created_at, call_recordings(recorded_at, sale_id)')
        .gte('created_at', since.toISOString())
        .not('sentiment_score', 'is', null);

      const rows = parseRows<InsightRow>(recs);
      if (!rows.length) return [];

      const saleIds = Array.from(
        new Set(
          rows
            .map(r => r.call_recordings?.sale_id)
            .filter((id): id is string => Boolean(id))
        )
      );
      const saleStatus = new Map<string, string>();
      if (saleIds.length) {
        const sales = await chunkedIn<SaleRow>(
          saleIds,
          chunk =>
            supabase
              .from('sales')
              .select('id, status')
              .in('id', chunk as string[]),
          { parallel: true, label: 'sentiment.sales' }
        );
        sales.forEach(s => saleStatus.set(s.id, s.status ?? ''));
      }

      const buckets = new Map<
        string,
        { sum: number; count: number; wins: number; losses: number }
      >();
      rows.forEach(r => {
        const recordedAt = r.call_recordings?.recorded_at ?? r.created_at;
        const q = quarterKey(new Date(recordedAt));
        const b = buckets.get(q) ?? { sum: 0, count: 0, wins: 0, losses: 0 };
        b.sum += Number(r.sentiment_score) || 0;
        b.count += 1;
        const saleId = r.call_recordings?.sale_id;
        const status = saleId ? saleStatus.get(saleId) : undefined;
        if (isWonSaleStatus(status)) b.wins += 1;
        else if (isLostSaleStatus(status)) b.losses += 1;
        buckets.set(q, b);
      });
      return Array.from(buckets.entries())
        .map(([quarter, b]) => ({
          quarter,
          avgSentiment: b.count ? b.sum / b.count : 0,
          winRate: winRate(b.wins, b.losses),
          count: b.count,
        }))
        .sort((a, b) => a.quarter.localeCompare(b.quarter));
    },
    staleTime: 10 * 60_000,
  });
}
