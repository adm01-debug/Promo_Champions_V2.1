import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { toast } from "sonner";
import { useMemo } from "react";

export interface NPSSurvey {
  id: string;
  sale_id: string | null;
  client_name: string;
  salesperson_id: string | null;
  survey_type: "nps" | "csat";
  score: number | null;
  comment: string | null;
  status: "pending" | "sent" | "responded";
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export const useNPSSurveys = () => {
  return useQuery<NPSSurvey[]>({
    queryKey: ["nps-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nps_surveys")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as NPSSurvey[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });
};

export const useNPSStats = () => {
  const { data: surveys } = useNPSSurveys();

  return useMemo(() => {
    if (!surveys) return null;
    const responded = surveys.filter((s) => s.status === "responded" && s.score !== null);
    if (responded.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0, avgScore: 0 };

    const promoters = responded.filter((s) => (s.score ?? 0) >= 9).length;
    const passives = responded.filter((s) => (s.score ?? 0) >= 7 && (s.score ?? 0) <= 8).length;
    const detractors = responded.filter((s) => (s.score ?? 0) <= 6).length;
    const nps = Math.round(((promoters - detractors) / responded.length) * 100);
    const avgScore = responded.reduce((sum, s) => sum + (s.score ?? 0), 0) / responded.length;

    return { nps, promoters, passives, detractors, total: responded.length, avgScore };
  }, [surveys]);
};

export const useCreateNPSSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { client_name: string; sale_id?: string; salesperson_id?: string; survey_type?: "nps" | "csat" }) => {
      const { error } = await supabase.from("nps_surveys").insert([{
        client_name: data.client_name,
        sale_id: data.sale_id || null,
        salesperson_id: data.salesperson_id || null,
        survey_type: data.survey_type || "nps",
        status: "sent" as const,
        sent_at: new Date().toISOString(),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pesquisa NPS enviada!");
      queryClient.invalidateQueries({ queryKey: ["nps-surveys"] });
    },
    onError: () => toast.error("Erro ao enviar pesquisa"),
  });
};

export const useRespondNPSSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, score, comment }: { id: string; score: number; comment?: string }) => {
      const { error } = await supabase
        .from("nps_surveys")
        .update({ score, comment: comment || null, status: "responded" as const, responded_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resposta registrada!");
      queryClient.invalidateQueries({ queryKey: ["nps-surveys"] });
    },
    onError: () => toast.error("Erro ao registrar resposta"),
  });
};
