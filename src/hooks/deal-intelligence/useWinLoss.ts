import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WinLossAnalysis {
  id: string;
  sale_id: string;
  outcome: "won" | "lost";
  primary_reason: string | null;
  secondary_reasons: string[];
  competitor: string | null;
  lost_stage: string | null;
  cycle_days: number | null;
  amount: number | null;
  segment: string | null;
  analyzed_at: string;
}

export interface WinLossPattern {
  id: string;
  pattern_type: "win_factor" | "loss_factor" | "stuck_stage" | "competitor" | "icp_match";
  label: string;
  outcome: string | null;
  frequency: number;
  win_rate: number;
  avg_cycle_days: number;
  avg_amount: number;
  confidence: number;
  computed_at: string;
}

export interface WinLossInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: "info" | "opportunity" | "risk";
  evidence: Record<string, unknown>;
  created_at: string;
}

export const useWinLossAnalyses = (filters?: { outcome?: "won" | "lost" }) =>
  useQuery({
    queryKey: ["win-loss-analyses", filters],
    queryFn: async () => {
      let q = supabase.from("win_loss_analyses").select("*").order("analyzed_at", { ascending: false });
      if (filters?.outcome) q = q.eq("outcome", filters.outcome);
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as WinLossAnalysis[];
    },
    staleTime: 60_000,
  });

export const useWinLossPatterns = (type?: WinLossPattern["pattern_type"]) =>
  useQuery({
    queryKey: ["win-loss-patterns", type],
    queryFn: async () => {
      let q = supabase.from("win_loss_patterns").select("*").order("frequency", { ascending: false });
      if (type) q = q.eq("pattern_type", type);
      const { data, error } = await q.limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as WinLossPattern[];
    },
    staleTime: 60_000,
  });

export const useWinLossInsights = () =>
  useQuery({
    queryKey: ["win-loss-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("win_loss_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as WinLossInsight[];
    },
    staleTime: 60_000,
  });

export const useWinLossSummary = () =>
  useQuery({
    queryKey: ["win-loss-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("win_loss_analyses")
        .select("outcome,primary_reason,competitor,cycle_days,amount");
      if (error) throw error;
      const rows = (data ?? []) as Array<{ outcome: string; primary_reason: string | null; competitor: string | null; cycle_days: number | null; amount: number | null }>;
      const wins = rows.filter(r => r.outcome === "won");
      const losses = rows.filter(r => r.outcome === "lost");
      const total = rows.length || 1;
      const avg = (arr: Array<number | null>) => {
        const v = arr.filter((x): x is number => x != null);
        return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
      };
      const top = (arr: Array<string | null>) => {
        const m = new Map<string, number>();
        arr.forEach(x => { if (x) m.set(x, (m.get(x) ?? 0) + 1); });
        return Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      };
      return {
        winRate: (wins.length / total) * 100,
        totalAnalyzed: rows.length,
        avgCycleWon: avg(wins.map(w => w.cycle_days)),
        avgCycleLost: avg(losses.map(l => l.cycle_days)),
        avgAmountWon: avg(wins.map(w => w.amount)),
        topWinReason: top(wins.map(w => w.primary_reason)),
        topLossReason: top(losses.map(l => l.primary_reason)),
        topCompetitor: top(rows.map(r => r.competitor)),
      };
    },
    staleTime: 60_000,
  });

export const useAnalyzeWinLoss = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("analyze-win-loss", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      toast.success(`${d?.processed ?? 0} deals analisados`);
      qc.invalidateQueries({ queryKey: ["win-loss-analyses"] });
      qc.invalidateQueries({ queryKey: ["win-loss-summary"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao analisar"),
  });
};

export const useMinePatterns = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("mine-win-loss-patterns", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      toast.success(`${d?.patterns ?? 0} padrões e ${d?.insights ?? 0} insights gerados`);
      qc.invalidateQueries({ queryKey: ["win-loss-patterns"] });
      qc.invalidateQueries({ queryKey: ["win-loss-insights"] });
      qc.invalidateQueries({ queryKey: ["win-loss-summary"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao minerar padrões"),
  });
};
