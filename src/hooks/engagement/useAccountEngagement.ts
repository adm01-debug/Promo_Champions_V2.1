import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TopAccount {
  id: string;
  name: string;
  tier: string;
  account_score: number;
  coverage: number;
  engaged_contacts: number;
  champion_count: number;
  decision_maker_count: number;
  industry: string | null;
}

export interface AccountSummary {
  account_id: string;
  account_name: string;
  total_contacts: number;
  engaged_contacts: number;
  avg_score: number;
  coverage: number;
  dominant_tier: string | null;
  interactions_30d: number;
}

export function useAccount(accountId?: string) {
  return useQuery({
    queryKey: ["account", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const { data, error } = await supabase.from("accounts").select("*").eq("id", accountId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(accountId),
  });
}

export function useAccountContacts(accountId?: string) {
  return useQuery({
    queryKey: ["account-contacts", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const { data, error } = await supabase
        .from("account_contacts")
        .select("*")
        .eq("account_id", accountId)
        .order("influence_level", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(accountId),
  });
}

export function useAccountSummary(accountId?: string) {
  return useQuery({
    queryKey: ["account-summary", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const { data, error } = await supabase.rpc("get_account_engagement_summary", { _account_id: accountId });
      if (error) throw error;
      return (data?.[0] ?? null) as AccountSummary | null;
    },
    enabled: Boolean(accountId),
  });
}

export function useTopAccounts(limit = 20) {
  return useQuery({
    queryKey: ["top-accounts", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_accounts", { _limit: limit });
      if (error) throw error;
      return (data ?? []) as TopAccount[];
    },
    staleTime: 120_000,
  });
}

export function useRecomputeAccountEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { account_ids?: string[]; recompute_all?: boolean }) => {
      const { data, error } = await supabase.functions.invoke("account-engagement-aggregator", {
        body: params ?? { recompute_all: true },
      });
      if (error) throw error;
      return data as { ok: boolean; updated: number; by_tier: Record<string, number> };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["top-accounts"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["account-summary"] });
      toast.success(`Contas recalculadas: ${res.updated}`);
    },
    onError: (e: Error) => toast.error(`Falha: ${e.message}`),
  });
}
