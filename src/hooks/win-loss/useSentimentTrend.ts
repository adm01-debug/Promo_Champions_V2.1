import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SentimentTrendPoint {
  quarter: string;
  avgSentiment: number;
  winRate: number;
  count: number;
}

interface RecRow { recorded_at: string; sentiment_score: number | null; sale_id: string | null }
interface SaleRow { id: string; status: string | null }

const quarterKey = (d: Date) => `${d.getFullYear()}·Q${Math.floor(d.getMonth() / 3) + 1}`;

export function useSentimentTrend() {
  return useQuery({
    queryKey: ["winloss-sentiment-trend"],
    queryFn: async (): Promise<SentimentTrendPoint[]> => {
      const since = new Date();
      since.setMonth(since.getMonth() - 18);
      const { data: recs } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            gte: (c: string, v: string) => { not: (c: string, op: string, v: unknown) => Promise<{ data: RecRow[] | null }> };
          };
        };
      })
        .from("call_recordings")
        .select("recorded_at, sentiment_score, sale_id")
        .gte("recorded_at", since.toISOString())
        .not("sentiment_score", "is", null);
      const rows = recs ?? [];
      if (!rows.length) return [];

      const saleIds = Array.from(new Set(rows.map(r => r.sale_id).filter(Boolean) as string[]));
      let saleStatus = new Map<string, string>();
      if (saleIds.length) {
        const { data: sales } = await supabase.from("sales").select("id, status").in("id", saleIds);
        ((sales as SaleRow[] | null) ?? []).forEach(s => saleStatus.set(s.id, s.status ?? ""));
      }

      const buckets = new Map<string, { sum: number; count: number; wins: number; deals: number }>();
      rows.forEach(r => {
        const q = quarterKey(new Date(r.recorded_at));
        const b = buckets.get(q) ?? { sum: 0, count: 0, wins: 0, deals: 0 };
        b.sum += Number(r.sentiment_score) || 0;
        b.count += 1;
        if (r.sale_id) {
          b.deals += 1;
          if (saleStatus.get(r.sale_id) === "won") b.wins += 1;
        }
        buckets.set(q, b);
      });
      return Array.from(buckets.entries())
        .map(([quarter, b]) => ({
          quarter,
          avgSentiment: b.count ? b.sum / b.count : 0,
          winRate: b.deals ? (b.wins / b.deals) * 100 : 0,
          count: b.count,
        }))
        .sort((a, b) => a.quarter.localeCompare(b.quarter));
    },
    staleTime: 10 * 60_000,
  });
}
