import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CoachingSessionStatus = "scheduled" | "completed" | "canceled";

export interface CoachingSession {
  id: string;
  salesperson_id: string;
  coach_id: string;
  scheduled_at: string;
  duration_min: number;
  status: CoachingSessionStatus;
  focus_skills: string[];
  agenda: Record<string, unknown>;
  notes: string | null;
  action_items: Array<{ text: string; due?: string; done?: boolean }>;
  outcome_rating: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  salesperson?: { name: string; avatar_url: string | null };
}

export interface SessionPrep {
  salesperson: { id: string; name: string; avatar_url: string | null } | null;
  top_gaps: Array<{ skill: string; score: number; label: string }>;
  at_risk_deals: Array<{ id: string; name: string; amount: number; stage: string }>;
  recent_scorecards: Array<{ overall_score: number; calculated_at: string }>;
  ai_talking_points: string[];
  suggested_focus_skills: string[];
}

// Types are already provided by the auto-generated Supabase client

export const useCoachingSessions = () => {
  return useQuery<CoachingSession[]>({
    queryKey: ["coaching-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*, salesperson:salespeople!coaching_sessions_salesperson_id_fkey(name, avatar_url)")
        .order("scheduled_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as CoachingSession[];
    },
    staleTime: 60_000,
  });
};

export const useSessionPrep = (salespersonId: string | null) => {
  return useQuery<SessionPrep>({
    queryKey: ["coaching-session-prep", salespersonId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("coaching-session-prep", {
        body: { salesperson_id: salespersonId },
      });
      if (error) throw error;
      return data as SessionPrep;
    },
    enabled: !!salespersonId,
    staleTime: 5 * 60 * 1000,
  });
};

interface CreateSessionInput {
  salesperson_id: string;
  scheduled_at: string;
  duration_min: number;
  focus_skills: string[];
  agenda?: Record<string, unknown>;
}

export const useCreateCoachingSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("coaching_sessions")
        .insert({ ...input, coach_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coaching-sessions"] });
      toast.success("Sessão agendada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

interface UpdateSessionInput {
  id: string;
  status?: CoachingSessionStatus;
  notes?: string;
  action_items?: Array<{ text: string; due?: string; done?: boolean }>;
  outcome_rating?: number;
  completed_at?: string;
}

export const useUpdateCoachingSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSessionInput) => {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coaching-sessions"] });
      toast.success("Sessão atualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
