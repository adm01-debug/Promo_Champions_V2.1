import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, eachDayOfInterval } from "date-fns";

export interface ConversionPoint {
  date: string;
  label: string;
  enrolled: number;
  approved: number;
}

export function useQuoteCadenceConversion(days: 30 | 60 | 90) {
  return useQuery({
    queryKey: ["quote-cadence-conversion", days],
    queryFn: async (): Promise<ConversionPoint[]> => {
      const end = new Date();
      const start = subDays(end, days - 1);
      const startIso = `${format(start, "yyyy-MM-dd")}T00:00:00`;

      const { data, error } = await supabase
        .from("prospect_cadences")
        .select("started_at, completed_at, quote:quotes(status, updated_at)")
        .not("quote_id", "is", null)
        .gte("started_at", startIso);

      if (error) throw error;

      const buckets = new Map<string, ConversionPoint>();
      eachDayOfInterval({ start, end }).forEach((d) => {
        const key = format(d, "yyyy-MM-dd");
        buckets.set(key, { date: key, label: format(d, "dd/MM"), enrolled: 0, approved: 0 });
      });

      (data ?? []).forEach((row) => {
        const startedKey = row.started_at ? format(new Date(row.started_at), "yyyy-MM-dd") : null;
        if (startedKey && buckets.has(startedKey)) {
          buckets.get(startedKey)!.enrolled += 1;
        }
        const q = row.quote as { status?: string; updated_at?: string } | null;
        if (q?.status === "approved" && q.updated_at) {
          const approvedKey = format(new Date(q.updated_at), "yyyy-MM-dd");
          if (buckets.has(approvedKey)) {
            buckets.get(approvedKey)!.approved += 1;
          }
        }
      });

      return Array.from(buckets.values());
    },
    staleTime: 60_000,
  });
}
