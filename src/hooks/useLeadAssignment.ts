import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";

export interface LeadAssignmentRule {
  method: "round_robin" | "weighted" | "territory";
  salespeople: { id: string; name: string; weight: number; territory?: string }[];
}

export interface AssignmentResult {
  salesperson_id: string;
  salesperson_name: string;
}

let roundRobinIndex = 0;

export function assignLeadRoundRobin(
  salespeople: { id: string; name: string; weight: number }[],
  method: "round_robin" | "weighted" = "round_robin"
): AssignmentResult | null {
  if (!salespeople.length) return null;

  if (method === "weighted") {
    const totalWeight = salespeople.reduce((sum, sp) => sum + sp.weight, 0);
    let random = Math.random() * totalWeight;
    for (const sp of salespeople) {
      random -= sp.weight;
      if (random <= 0) {
        return { salesperson_id: sp.id, salesperson_name: sp.name };
      }
    }
    return { salesperson_id: salespeople[0].id, salesperson_name: salespeople[0].name };
  }

  // Round Robin
  const sp = salespeople[roundRobinIndex % salespeople.length];
  roundRobinIndex++;
  return { salesperson_id: sp.id, salesperson_name: sp.name };
}

export const useLeadAssignment = () => {
  const { data: salespeople } = useQuery({
    queryKey: ["lead-assignment-salespeople"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, role")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || []).map((sp) => ({
        id: sp.id,
        name: sp.name,
        weight: sp.role === "closer" ? 2 : 1,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const assignLead = useMemo(() => {
    return (method: "round_robin" | "weighted" = "round_robin") => {
      return assignLeadRoundRobin(salespeople || [], method);
    };
  }, [salespeople]);

  return { salespeople: salespeople || [], assignLead };
};
