import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRetryMutation } from "@/hooks/useRetryMutation";

export interface Team {
  id: string;
  name: string;
  sdr_id: string | null;
  is_active: boolean;
  inactivity_days: number;
  created_at: string;
  updated_at: string;
  sdr?: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  closers?: {
    id: string;
    closer_id: string;
    salesperson: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  }[];
}

export interface CreateTeamInput {
  name: string;
  sdr_id: string | null;
  inactivity_days?: number;
  closer_ids?: string[];
}

export interface UpdateTeamInput {
  id: string;
  name?: string;
  sdr_id?: string | null;
  is_active?: boolean;
  inactivity_days?: number;
  closer_ids?: string[];
}

// Fetch all teams with SDR and Closers
export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      // Fetch teams with SDR info
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select(`
          *,
          sdr:salespeople!teams_sdr_id_fkey(id, name, avatar_url)
        `)
        .order("name");

      if (teamsError) throw teamsError;

      // Fetch team closers separately
      const { data: closers, error: closersError } = await supabase
        .from("team_closers")
        .select(`
          id,
          team_id,
          closer_id,
          salesperson:salespeople!team_closers_closer_id_fkey(id, name, avatar_url)
        `);

      if (closersError) throw closersError;

      // Combine data
      return (teams || []).map((team) => ({
        ...team,
        closers: closers?.filter((c) => c.team_id === team.id) || [],
      })) as Team[];
    },
    staleTime: 60000,
  });
}

// Fetch available SDRs (role = 'sdr' and not assigned to any team)
export function useAvailableSDRs() {
  return useQuery({
    queryKey: ["available-sdrs"],
    queryFn: async () => {
      const { data: assignedSDRs } = await supabase
        .from("teams")
        .select("sdr_id")
        .not("sdr_id", "is", null);

      const assignedIds = assignedSDRs?.map((t) => t.sdr_id).filter(Boolean) || [];

      let query = supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true)
        .in("role", ["sdr", "hybrid"]);

      if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });
}

// Fetch available Closers (role = 'closer' and not assigned to 2 teams)
export function useAvailableClosers() {
  return useQuery({
    queryKey: ["available-closers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true)
        .in("role", ["closer", "hybrid"])
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });
}

// Create team
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useRetryMutation(
    async (input: CreateTeamInput) => {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([{
          name: input.name,
          sdr_id: input.sdr_id,
          inactivity_days: input.inactivity_days || 365,
        }])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add closers if provided
      if (input.closer_ids && input.closer_ids.length > 0) {
        const closerInserts = input.closer_ids.map((closer_id) => ({
          team_id: team.id,
          closer_id,
        }));

        const { error: closerError } = await supabase
          .from("team_closers")
          .insert(closerInserts);

        if (closerError) throw closerError;
      }

      return team;
    },
    {
      retryConfig: { maxRetries: 2, baseDelay: 1000 },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["available-sdrs"] });
        queryClient.invalidateQueries({ queryKey: ["available-closers"] });
        toast.success("Time criado com sucesso!");
      },
      onError: (error) => {
        console.error("Error creating team:", error);
        toast.error("Erro ao criar time");
      },
    }
  );
}

// Update team
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useRetryMutation(
    async (input: UpdateTeamInput) => {
      const { id, closer_ids, ...updateData } = input;

      // Update team
      const { error: teamError } = await supabase
        .from("teams")
        .update(updateData)
        .eq("id", id);

      if (teamError) throw teamError;

      // Update closers if provided
      if (closer_ids !== undefined) {
        // Remove existing closers
        await supabase
          .from("team_closers")
          .delete()
          .eq("team_id", id);

        // Add new closers
        if (closer_ids.length > 0) {
          const closerInserts = closer_ids.map((closer_id) => ({
            team_id: id,
            closer_id,
          }));

          const { error: closerError } = await supabase
            .from("team_closers")
            .insert(closerInserts);

          if (closerError) throw closerError;
        }
      }

      return id;
    },
    {
      retryConfig: { maxRetries: 2, baseDelay: 1000 },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["available-sdrs"] });
        queryClient.invalidateQueries({ queryKey: ["available-closers"] });
        toast.success("Time atualizado com sucesso!");
      },
      onError: (error) => {
        console.error("Error updating team:", error);
        toast.error("Erro ao atualizar time");
      },
    }
  );
}

// Delete team
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useRetryMutation(
    async (teamId: string) => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;
      return teamId;
    },
    {
      retryConfig: { maxRetries: 2, baseDelay: 1000 },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["available-sdrs"] });
        queryClient.invalidateQueries({ queryKey: ["available-closers"] });
        toast.success("Time excluído com sucesso!");
      },
      onError: (error) => {
        console.error("Error deleting team:", error);
        toast.error("Erro ao excluir time");
      },
    }
  );
}
