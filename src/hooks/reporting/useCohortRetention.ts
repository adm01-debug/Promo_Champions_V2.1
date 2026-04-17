import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, startOfMonth } from "date-fns";
import { buildCohortMatrix, type CohortRow } from "@/components/reporting/cohortHelpers";

export type CohortMetric = "orders" | "revenue";

interface UseCohortRetentionOptions {
  periods?: number;       // window of cohort months to consider (also column count)
  metric?: CohortMetric;
}

export function useCohortRetention({ periods = 12, metric = "orders" }: UseCohortRetentionOptions = {}) {
  return useQuery<CohortRow[]>({
    queryKey: ["cohort-retention", periods, metric],
    queryFn: async () => {
      const start = subMonths(startOfMonth(new Date()), periods - 1);

      const [clientsRes, salesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name, created_at")
          .gte("created_at", start.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("sales")
          .select("client_name, created_at, amount")
          .gte("created_at", start.toISOString()),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (salesRes.error) throw salesRes.error;

      const clients = (clientsRes.data ?? []).map((c) => ({ id: c.id, created_at: c.created_at }));
      const nameToId = new Map<string, string>(
        (clientsRes.data ?? []).map((c) => [c.name, c.id])
      );
      const sales = (salesRes.data ?? []).map((s) => ({
        client_name: s.client_name,
        created_at: s.created_at,
        final_value: s.amount,
      }));

      return buildCohortMatrix(clients, sales, nameToId, periods, metric);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
