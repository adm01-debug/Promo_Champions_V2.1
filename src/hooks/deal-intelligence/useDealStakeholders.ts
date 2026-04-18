import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DMURole, InfluenceLevel, Sentiment } from "@/components/deal-intelligence/committeeHelpers";

export interface DealStakeholder {
  id: string;
  sale_id: string;
  owner_id: string;
  name: string;
  role_title: string | null;
  dmu_role: DMURole;
  influence_level: InfluenceLevel;
  engagement_score: number;
  sentiment: Sentiment;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  signals: string[];
  last_interaction_at: string | null;
  source: "manual" | "ai_extracted" | "email" | "call";
  evidence_quote: string | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

export const useDealStakeholders = (saleId: string | null | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!saleId) return;
    const ch = supabase
      .channel(`stakeholders-${saleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_stakeholders", filter: `sale_id=eq.${saleId}` },
        () => qc.invalidateQueries({ queryKey: ["deal-stakeholders", saleId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [saleId, qc]);

  return useQuery({
    queryKey: ["deal-stakeholders", saleId],
    queryFn: async (): Promise<DealStakeholder[]> => {
      if (!saleId) return [];
      const { data, error } = await supabase
        .from("deal_stakeholders")
        .select("*")
        .eq("sale_id", saleId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as DealStakeholder[];
    },
    enabled: !!saleId,
  });
};

export const useUpsertStakeholder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<DealStakeholder> & { sale_id: string; name: string; owner_id: string }) => {
      if (input.id) {
        const { data, error } = await supabase
          .from("deal_stakeholders")
          .update(input)
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("deal_stakeholders")
        .insert({ ...input, source: "manual" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["deal-stakeholders", vars.sale_id] });
      qc.invalidateQueries({ queryKey: ["committee-coverage", vars.sale_id] });
      toast.success("Stakeholder salvo");
      // trigger coverage recalc
      supabase.functions.invoke("calculate-committee-coverage", { body: { sale_id: vars.sale_id } }).catch(() => {});
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useDeleteStakeholder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, sale_id }: { id: string; sale_id: string }) => {
      const { error } = await supabase.from("deal_stakeholders").delete().eq("id", id);
      if (error) throw error;
      return { id, sale_id };
    },
    onSuccess: ({ sale_id }) => {
      qc.invalidateQueries({ queryKey: ["deal-stakeholders", sale_id] });
      supabase.functions.invoke("calculate-committee-coverage", { body: { sale_id } }).catch(() => {});
      toast.success("Stakeholder removido");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useExtractStakeholders = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { recording_id?: string; sale_id?: string; manual_text?: string }) => {
      const { data, error } = await supabase.functions.invoke("extract-deal-stakeholders", { body: input });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      const saleId = data?.stakeholders?.[0]?.sale_id;
      if (saleId) {
        qc.invalidateQueries({ queryKey: ["deal-stakeholders", saleId] });
        qc.invalidateQueries({ queryKey: ["committee-coverage", saleId] });
      }
      toast.success(`${data?.count ?? 0} stakeholder(s) extraído(s) por IA`);
    },
    onError: (e: Error) => toast.error(`Erro na extração: ${e.message}`),
  });
};
