import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

export interface ActivityGoal {
  id: string;
  salesperson_id: string;
  calls_goal: number;
  emails_goal: number;
  meetings_goal: number;
  linkedin_goal: number;
  whatsapp_goal: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityGoalProgress {
  salesperson_id: string;
  salesperson_name: string;
  avatar_url: string | null;
  role: string;
  goals: {
    calls: number;
    emails: number;
    meetings: number;
    linkedin: number;
    whatsapp: number;
  };
  current: {
    calls: number;
    emails: number;
    meetings: number;
    linkedin: number;
    whatsapp: number;
  };
  progress: {
    calls: number;
    emails: number;
    meetings: number;
    linkedin: number;
    whatsapp: number;
    overall: number;
  };
  hasGoals: boolean;
}

export function useActivityGoals() {
  return useQuery({
    queryKey: ["activity-goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_goals")
        .select("*");

      if (error) throw error;
      return data as ActivityGoal[];
    },
  });
}

export function useActivityGoalProgress() {
  return useQuery({
    queryKey: ["activity-goal-progress"],
    queryFn: async () => {
      const today = new Date();
      const dayStart = startOfDay(today).toISOString();
      const dayEnd = endOfDay(today).toISOString();

      // Fetch salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from("activity_goals")
        .select("*");

      if (goalsError) throw goalsError;

      // Fetch today's activities
      const { data: activities, error: actError } = await supabase
        .from("activities")
        .select("salesperson_id, activity_type")
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd);

      if (actError) throw actError;

      // Calculate progress for each salesperson
      const progressData: ActivityGoalProgress[] = (salespeople || []).map(sp => {
        const spGoals = (goals || []).find(g => g.salesperson_id === sp.id);
        const spActivities = (activities || []).filter(a => a.salesperson_id === sp.id);

        const currentCalls = spActivities.filter(a => a.activity_type === 'call').length;
        const currentEmails = spActivities.filter(a => a.activity_type === 'email').length;
        const currentMeetings = spActivities.filter(a => a.activity_type === 'meeting').length;
        const currentLinkedin = spActivities.filter(a => a.activity_type === 'linkedin').length;
        const currentWhatsapp = spActivities.filter(a => a.activity_type === 'whatsapp').length;

        const goalCalls = spGoals?.calls_goal || 0;
        const goalEmails = spGoals?.emails_goal || 0;
        const goalMeetings = spGoals?.meetings_goal || 0;
        const goalLinkedin = spGoals?.linkedin_goal || 0;
        const goalWhatsapp = spGoals?.whatsapp_goal || 0;

        const calcProgress = (current: number, goal: number) => 
          goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

        const progressCalls = calcProgress(currentCalls, goalCalls);
        const progressEmails = calcProgress(currentEmails, goalEmails);
        const progressMeetings = calcProgress(currentMeetings, goalMeetings);
        const progressLinkedin = calcProgress(currentLinkedin, goalLinkedin);
        const progressWhatsapp = calcProgress(currentWhatsapp, goalWhatsapp);

        const totalGoals = [goalCalls, goalEmails, goalMeetings, goalLinkedin, goalWhatsapp].filter(g => g > 0).length;
        const overallProgress = totalGoals > 0
          ? (progressCalls + progressEmails + progressMeetings + progressLinkedin + progressWhatsapp) / totalGoals
          : 0;

        return {
          salesperson_id: sp.id,
          salesperson_name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          goals: {
            calls: goalCalls,
            emails: goalEmails,
            meetings: goalMeetings,
            linkedin: goalLinkedin,
            whatsapp: goalWhatsapp,
          },
          current: {
            calls: currentCalls,
            emails: currentEmails,
            meetings: currentMeetings,
            linkedin: currentLinkedin,
            whatsapp: currentWhatsapp,
          },
          progress: {
            calls: progressCalls,
            emails: progressEmails,
            meetings: progressMeetings,
            linkedin: progressLinkedin,
            whatsapp: progressWhatsapp,
            overall: overallProgress,
          },
          hasGoals: !!spGoals,
        };
      });

      return progressData.sort((a, b) => b.progress.overall - a.progress.overall);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useUpsertActivityGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<ActivityGoal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("activity_goals")
        .upsert(input, { onConflict: 'salesperson_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-goals"] });
      queryClient.invalidateQueries({ queryKey: ["activity-goal-progress"] });
      toast.success("Metas de atividades atualizadas!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar metas");
      if (import.meta.env.DEV) {
        console.error("Error saving activity goals:", error);
      }
    },
  });
}
