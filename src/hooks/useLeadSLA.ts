import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours } from "date-fns";

export interface LeadSLAStatus {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
  last_activity_at: string | null;
  hours_since_contact: number;
  sla_status: "ok" | "warning" | "critical";
  salesperson: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

interface SLAConfig {
  warningHours: number;  // Hours before warning
  criticalHours: number; // Hours before critical
}

const DEFAULT_SLA_CONFIG: SLAConfig = {
  warningHours: 4,
  criticalHours: 8,
};

export function useLeadSLA(config: Partial<SLAConfig> = {}) {
  const slaConfig = { ...DEFAULT_SLA_CONFIG, ...config };

  return useQuery({
    queryKey: ["lead-sla", slaConfig.warningHours, slaConfig.criticalHours],
    queryFn: async (): Promise<LeadSLAStatus[]> => {
      // Fetch active leads (not completed/lost)
      const { data: leads, error: leadsError } = await supabase
        .from("sales")
        .select(`
          id,
          client_name,
          product_name,
          amount,
          status,
          created_at,
          salesperson_id,
          salespeople (
            id,
            name,
            email
          )
        `)
        .not("status", "in", "(completed,lost)")
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch latest activity for each lead
      const { data: activities, error: actError } = await supabase
        .from("activities")
        .select("sale_id, created_at")
        .order("created_at", { ascending: false });

      if (actError) throw actError;

      // Build a map of latest activity per sale
      const latestActivityMap = new Map<string, string>();
      for (const act of activities || []) {
        if (act.sale_id && !latestActivityMap.has(act.sale_id)) {
          latestActivityMap.set(act.sale_id, act.created_at);
        }
      }

      const now = new Date();

      const leadStatuses: LeadSLAStatus[] = (leads || []).map((lead) => {
        const lastActivityAt = latestActivityMap.get(lead.id) || null;
        const referenceTime = lastActivityAt || lead.created_at;
        const hoursSinceContact = differenceInHours(now, new Date(referenceTime));

        let slaStatus: "ok" | "warning" | "critical" = "ok";
        if (hoursSinceContact >= slaConfig.criticalHours) {
          slaStatus = "critical";
        } else if (hoursSinceContact >= slaConfig.warningHours) {
          slaStatus = "warning";
        }

        return {
          id: lead.id,
          client_name: lead.client_name,
          product_name: lead.product_name,
          amount: Number(lead.amount),
          status: lead.status,
          created_at: lead.created_at,
          last_activity_at: lastActivityAt,
          hours_since_contact: hoursSinceContact,
          sla_status: slaStatus,
          salesperson: lead.salespeople ? {
            id: lead.salespeople.id,
            name: lead.salespeople.name,
            email: lead.salespeople.email,
          } : null,
        };
      });

      // Sort by SLA status (critical first) then by hours
      return leadStatuses.sort((a, b) => {
        const statusOrder = { critical: 0, warning: 1, ok: 2 };
        if (statusOrder[a.sla_status] !== statusOrder[b.sla_status]) {
          return statusOrder[a.sla_status] - statusOrder[b.sla_status];
        }
        return b.hours_since_contact - a.hours_since_contact;
      });
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useLeadSLAStats(config: Partial<SLAConfig> = {}) {
  const { data: leads } = useLeadSLA(config);

  const stats = {
    total: leads?.length || 0,
    ok: leads?.filter(l => l.sla_status === "ok").length || 0,
    warning: leads?.filter(l => l.sla_status === "warning").length || 0,
    critical: leads?.filter(l => l.sla_status === "critical").length || 0,
  };

  return stats;
}
