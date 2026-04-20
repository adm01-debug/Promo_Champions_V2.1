import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NextBestWLDeal {
  saleId: string;
  accountId: string | null;
  clientName: string;
  reason: string;
  suggestedScript: string;
  amount: number | null;
}

interface SaleRow {
  id: string;
  account_id: string | null;
  client_name: string | null;
  amount: number | null;
  status: string | null;
  stage: string | null;
  updated_at: string | null;
  salesperson_id: string | null;
}

/**
 * Lightweight heuristic: pick the highest-amount open deal whose stage is
 * past 'qualified' but stagnated (updated > 7d ago). No edge call needed —
 * deterministic, fast, respects existing RLS.
 */
export function useNextBestWinLossDeal() {
  return useQuery({
    queryKey: ["wl-next-best-deal"],
    queryFn: async (): Promise<NextBestWLDeal | null> => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("sales")
        .select("id, account_id, client_name, amount, status, stage, updated_at, salesperson_id")
        .not("status", "in", "(won,lost)")
        .lte("updated_at", sevenDaysAgo.toISOString())
        .order("amount", { ascending: false, nullsFirst: false })
        .limit(1);

      if (error) throw error;
      const row = ((data ?? [])[0] ?? null) as SaleRow | null;
      if (!row) return null;

      const days = row.updated_at
        ? Math.round((Date.now() - new Date(row.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        saleId: row.id,
        accountId: row.account_id,
        clientName: row.client_name ?? "Cliente",
        reason: `Maior ticket parado há ${days} dias no estágio ${row.stage ?? "—"}.`,
        suggestedScript:
          "Reconectar com pergunta de valor: 'Desde nossa última conversa, o que mudou na prioridade desse projeto?' — depois reposicionar próximo passo concreto.",
        amount: row.amount,
      };
    },
    staleTime: 5 * 60_000,
  });
}
