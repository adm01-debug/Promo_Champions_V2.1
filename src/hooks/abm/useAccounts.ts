import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { insertPayload } from "@/lib/supabase/typed-payloads";

export type AccountTier = "strategic" | "enterprise" | "mid_market" | "smb";
export type HealthStatus = "healthy" | "at_risk" | "critical" | "unknown";
export type BuyingRole = "decision_maker" | "champion" | "influencer" | "blocker" | "user" | "technical";

export interface Account {
  id: string;
  name: string;
  parent_account_id: string | null;
  industry: string | null;
  tier: AccountTier;
  annual_revenue: number | null;
  employee_count: number | null;
  website: string | null;
  country: string | null;
  account_score: number;
  health_status: HealthStatus;
  owner_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountContact {
  id: string;
  account_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  department: string | null;
  buying_role: BuyingRole;
  influence_level: number;
  sentiment: "positive" | "neutral" | "negative";
  linkedin_url: string | null;
  last_contacted_at: string | null;
  notes: string | null;
}

export const useAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("account_score", { ascending: false });
      if (error) throw error;
      return data as Account[];
    },
  });
};

export const useAccountContacts = (accountId: string | null) => {
  return useQuery({
    queryKey: ["account-contacts", accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_contacts")
        .select("*")
        .eq("account_id", accountId!)
        .order("influence_level", { ascending: false });
      if (error) throw error;
      return data as AccountContact[];
    },
  });
};

export const useAccountActivities = (accountId: string | null) => {
  return useQuery({
    queryKey: ["account-activities", accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_activities")
        .select("*")
        .eq("account_id", accountId!)
        .order("occurred_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Account> & { name: string }) => {
      const { data, error } = await supabase.from("accounts").insert(payload as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta criada com sucesso");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useCreateContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AccountContact> & { account_id: string; name: string }) => {
      const { data, error } = await supabase.from("account_contacts").insert(payload as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["account-contacts", vars.account_id] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Contato adicionado");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useRecalculateAccountScore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.rpc("calculate_account_score", { p_account_id: accountId });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Score recalculado");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};
