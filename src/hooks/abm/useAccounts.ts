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
export interface AccountPlan {
  id: string;
  account_id: string;
  fiscal_year: string | null;
  revenue_target: number | null;
  executive_summary: string | null;
  key_objectives: string[] | null;
  main_challenges: string[] | null;
  swot_strengths: string[] | null;
  swot_weaknesses: string[] | null;
  swot_opportunities: string[] | null;
  swot_threats: string[] | null;
  account_strategy: string | null;
  action_plan: any;
  created_at: string;
  updated_at: string;
}

export const useAccountPlan = (accountId: string | null) => {
  return useQuery({
    queryKey: ["account-plan", accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_plans")
        .select("*")
        .eq("account_id", accountId!)
        .maybeSingle();
      if (error) throw error;
      return data as AccountPlan | null;
    },
  });
};

export const useUpdateAccountPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AccountPlan> & { account_id: string }) => {
      const { account_id, ...rest } = payload;
      
      // Check if plan exists
      const { data: existing } = await supabase
        .from("account_plans")
        .select("id")
        .eq("account_id", account_id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("account_plans")
          .update(rest)
          .eq("account_id", account_id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("account_plans")
          .insert({ account_id, ...rest })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["account-plan", vars.account_id] });
      toast.success("Plano de conta atualizado");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};


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
      const { data, error } = await supabase.from("accounts").insert(insertPayload("accounts", payload)).select().single();
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
      const { data, error } = await supabase.from("account_contacts").insert(insertPayload("account_contacts", payload)).select().single();
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
