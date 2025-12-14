import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface CircuitBreakerEvent {
  id: string;
  circuit_name: string;
  event_type: string;
  previous_state: string | null;
  new_state: string | null;
  failure_count: number;
  details: Json;
  created_at: string;
}

// Fetch circuit breaker events history
export function useCircuitBreakerHistory(circuitName?: string, limit = 50) {
  return useQuery({
    queryKey: ["circuit-breaker-history", circuitName, limit],
    queryFn: async () => {
      let query = supabase
        .from("circuit_breaker_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (circuitName) {
        query = query.eq("circuit_name", circuitName);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching circuit breaker history:", error);
        throw error;
      }

      return (data || []) as CircuitBreakerEvent[];
    },
    staleTime: 30000,
  });
}

// Log a circuit breaker event to the database
export function useLogCircuitBreakerEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      circuit_name: string;
      event_type: string;
      previous_state?: string;
      new_state?: string;
      failure_count?: number;
      details?: Json;
    }) => {
      const { error } = await supabase.from("circuit_breaker_events").insert([{
        circuit_name: event.circuit_name,
        event_type: event.event_type,
        previous_state: event.previous_state || null,
        new_state: event.new_state || null,
        failure_count: event.failure_count || 0,
        details: event.details || {},
      }]);

      if (error) {
        console.error("Error logging circuit breaker event:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circuit-breaker-history"] });
    },
  });
}

// Delete old events (cleanup)
export function useDeleteOldCircuitBreakerEvents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (olderThanDays: number = 30) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { error } = await supabase
        .from("circuit_breaker_events")
        .delete()
        .lt("created_at", cutoffDate.toISOString());

      if (error) {
        console.error("Error deleting old circuit breaker events:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circuit-breaker-history"] });
    },
  });
}

// Get event statistics
export function useCircuitBreakerStats() {
  return useQuery({
    queryKey: ["circuit-breaker-stats"],
    queryFn: async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from("circuit_breaker_events")
        .select("circuit_name, event_type")
        .gte("created_at", oneDayAgo.toISOString());

      if (error) {
        console.error("Error fetching circuit breaker stats:", error);
        throw error;
      }

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        opened: data?.filter((e) => e.event_type === "opened").length || 0,
        closed: data?.filter((e) => e.event_type === "closed").length || 0,
        failures: data?.filter((e) => e.event_type === "failure").length || 0,
        byCircuit: {} as Record<string, { total: number; opened: number; failures: number }>,
      };

      data?.forEach((event) => {
        if (!stats.byCircuit[event.circuit_name]) {
          stats.byCircuit[event.circuit_name] = { total: 0, opened: 0, failures: 0 };
        }
        stats.byCircuit[event.circuit_name].total++;
        if (event.event_type === "opened") {
          stats.byCircuit[event.circuit_name].opened++;
        }
        if (event.event_type === "failure") {
          stats.byCircuit[event.circuit_name].failures++;
        }
      });

      return stats;
    },
    staleTime: 30000,
  });
}
