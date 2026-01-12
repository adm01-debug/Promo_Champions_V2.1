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
        if (import.meta.env.DEV) {
          console.error("Error fetching circuit breaker history:", error);
        }
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
        if (import.meta.env.DEV) {
          console.error("Error logging circuit breaker event:", error);
        }
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
        if (import.meta.env.DEV) {
          console.error("Error deleting old circuit breaker events:", error);
        }
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
        if (import.meta.env.DEV) {
          console.error("Error fetching circuit breaker stats:", error);
        }
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

// Get trend data for charts (last 7 days, hourly aggregation)
export function useCircuitBreakerTrends(days = 7, circuitFilter?: string) {
  return useQuery({
    queryKey: ["circuit-breaker-trends", days, circuitFilter],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("circuit_breaker_events")
        .select("event_type, created_at, circuit_name")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (circuitFilter) {
        query = query.eq("circuit_name", circuitFilter);
      }

      const { data, error } = await query;

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching circuit breaker trends:", error);
        }
        throw error;
      }

      // Aggregate by hour
      const hourlyData: Record<string, { 
        time: string; 
        hour: string;
        failures: number; 
        opened: number; 
        closed: number; 
        halfOpen: number;
        total: number;
      }> = {};

      data?.forEach((event) => {
        const date = new Date(event.created_at);
        const hourKey = `${date.toISOString().slice(0, 13)}:00`;
        const displayHour = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}h`;

        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = {
            time: hourKey,
            hour: displayHour,
            failures: 0,
            opened: 0,
            closed: 0,
            halfOpen: 0,
            total: 0,
          };
        }

        hourlyData[hourKey].total++;

        switch (event.event_type) {
          case "failure":
            hourlyData[hourKey].failures++;
            break;
          case "opened":
            hourlyData[hourKey].opened++;
            break;
          case "closed":
            hourlyData[hourKey].closed++;
            break;
          case "half_open":
            hourlyData[hourKey].halfOpen++;
            break;
        }
      });

      // Convert to array and sort by time
      const trendData = Object.values(hourlyData).sort((a, b) => 
        a.time.localeCompare(b.time)
      );

      // Get unique circuits
      const circuits = [...new Set(data?.map((e) => e.circuit_name) || [])];

      return {
        trendData,
        circuits,
        totalEvents: data?.length || 0,
      };
    },
    staleTime: 60000,
  });
}

// Get list of all unique circuit names
export function useCircuitBreakerNames(days = 30) {
  return useQuery({
    queryKey: ["circuit-breaker-names", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("circuit_breaker_events")
        .select("circuit_name")
        .gte("created_at", startDate.toISOString());

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching circuit names:", error);
        }
        throw error;
      }

      return [...new Set(data?.map((e) => e.circuit_name) || [])];
    },
    staleTime: 120000,
  });
}
