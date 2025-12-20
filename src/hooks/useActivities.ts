import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInvalidateCache } from "@/hooks/useInvalidateCache";
import { updateChallengeProgressForActivity } from "@/hooks/useChallengeProgressUpdater";

export type ActivityType = 'call' | 'email' | 'meeting' | 'linkedin' | 'whatsapp' | 'other';
export type ActivityOutcome = 'connected' | 'no_answer' | 'scheduled' | 'voicemail' | 'busy' | 'callback' | 'not_interested' | 'qualified';

export interface Activity {
  id: string;
  sale_id: string | null;
  salesperson_id: string | null;
  activity_type: ActivityType;
  outcome: ActivityOutcome;
  notes: string | null;
  duration_minutes: number | null;
  contact_name: string | null;
  created_at: string;
}

export interface CreateActivityInput {
  sale_id?: string;
  salesperson_id?: string;
  activity_type: ActivityType;
  outcome: ActivityOutcome;
  notes?: string;
  duration_minutes?: number;
  contact_name?: string;
}

export function useActivities(saleId?: string, salespersonId?: string) {
  return useQuery({
    queryKey: ["activities", saleId, salespersonId],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (saleId) {
        query = query.eq("sale_id", saleId);
      }
      if (salespersonId) {
        query = query.eq("salesperson_id", salespersonId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data as Activity[];
    },
  });
}

export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: ["recent-activities", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Activity[];
    },
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: ["activity-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayActivities, error: todayError } = await supabase
        .from("activities")
        .select("activity_type, outcome")
        .gte("created_at", today.toISOString());

      if (todayError) throw todayError;

      const stats = {
        totalToday: todayActivities?.length || 0,
        callsToday: todayActivities?.filter(a => a.activity_type === 'call').length || 0,
        emailsToday: todayActivities?.filter(a => a.activity_type === 'email').length || 0,
        meetingsToday: todayActivities?.filter(a => a.activity_type === 'meeting').length || 0,
        connectedToday: todayActivities?.filter(a => a.outcome === 'connected').length || 0,
        scheduledToday: todayActivities?.filter(a => a.outcome === 'scheduled').length || 0,
      };

      return stats;
    },
  });
}

export function useCreateActivity() {
  const { invalidateDomain } = useInvalidateCache();

  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const { data, error } = await supabase
        .from("activities")
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      // Update challenge progress if salesperson is set
      if (input.salesperson_id) {
        try {
          const challengeResults = await updateChallengeProgressForActivity(
            input.salesperson_id,
            input.activity_type
          );
          
          // Notify if a challenge was just completed
          if (challengeResults) {
            const completed = challengeResults.filter(r => r.justCompleted);
            for (const c of completed) {
              toast.success(`🎯 Desafio completado: ${c.title}! Resgate +${c.xpReward} XP`);
            }
          }
        } catch (e) {
          console.error("Error updating challenge progress:", e);
        }
      }

      return data;
    },
    onSuccess: () => {
      invalidateDomain("activities");
      invalidateDomain("challenge-progress");
      toast.success("Atividade registrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao registrar atividade");
      console.error("Error creating activity:", error);
    },
  });
}
