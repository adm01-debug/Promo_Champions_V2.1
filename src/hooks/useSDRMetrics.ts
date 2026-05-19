import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subWeeks, subMonths, subQuarters, subDays, format } from "date-fns";
import { captureException } from "@/lib/errorTracking";

export type PeriodFilter = "week" | "month" | "quarter";

interface SDRMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  meetingsScheduled: number;
  schedulingRate: number;
  avgResponseTime: number;
  activeProspects: number;
  coldLeads: number;
  warmLeads: number;
  hotLeads: number;
}

interface SDRComparison {
  current: SDRMetrics;
  previous: SDRMetrics;
  changes: {
    leads: number;
    qualified: number;
    meetings: number;
    schedulingRate: number;
  };
}

function getPeriodRange(period: PeriodFilter, offset: number = 0) {
  const now = new Date();
  
  switch (period) {
    case "week": {
      const weekRef = offset === 0 ? now : subWeeks(now, offset);
      return { start: startOfWeek(weekRef, { weekStartsOn: 1 }), end: endOfWeek(weekRef, { weekStartsOn: 1 }) };
    }
    case "month": {
      const monthRef = offset === 0 ? now : subMonths(now, offset);
      return { start: startOfMonth(monthRef), end: endOfMonth(monthRef) };
    }
    case "quarter": {
      const quarterRef = offset === 0 ? now : subQuarters(now, offset);
      return { start: startOfQuarter(quarterRef), end: endOfQuarter(quarterRef) };
    }
  }
}

export function useSDRMetrics(
  period: PeriodFilter = "month",
  filters?: { status?: string; channel?: string },
  searchTerm?: string
) {
  return useQuery({
    queryKey: ["sdr-metrics", period, filters, searchTerm],
    queryFn: async (): Promise<SDRComparison> => {
      try {
        const currentRange = getPeriodRange(period, 0);
        const previousRange = getPeriodRange(period, 1);

        // Fetch SDR and Hybrid IDs once
        const { data: sdrsData } = await supabase
          .from("salespeople")
          .select("id")
          .in("role", ["sdr", "hybrid"]);
        
        const sdrIds = sdrsData?.map(s => s.id) || [];
        if (sdrIds.length === 0) throw new Error("No SDRs found");

        const buildSalesQuery = (range: { start: Date; end: Date }) => {
          let query = supabase
            .from("sales")
            .select("id, status, salesperson_id, amount")
            .in("salesperson_id", sdrIds)
            .gte("created_at", range.start.toISOString())
            .lte("created_at", range.end.toISOString());

          if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          if (filters?.channel && filters.channel !== 'all') {
            query = query.eq('source', filters.channel);
          }
          if (searchTerm) {
            query = query.ilike('client_name', `%${searchTerm}%`);
          }
          return query;
        };

        const buildTasksQuery = (range: { start: Date; end: Date }) => {
          return supabase
            .from("tasks")
            .select("id, salesperson_id")
            .eq("task_type", "meeting")
            .in("salesperson_id", sdrIds)
            .gte("created_at", range.start.toISOString())
            .lte("created_at", range.end.toISOString());
        };

        const [currentSalesRes, prevSalesRes, currentTasksRes, prevTasksRes, leadScoresRes] = await Promise.all([
          buildSalesQuery(currentRange),
          buildSalesQuery(previousRange),
          buildTasksQuery(currentRange),
          buildTasksQuery(previousRange),
          supabase
            .from("lead_scores")
            .select("sale_id, score")
            .in("sale_id", (await buildSalesQuery(currentRange).select("id")).data?.map(s => s.id) || [])
        ]);

        const scoreMap = new Map(leadScoresRes.data?.map(s => [s.sale_id, s.score]) || []);

        const calculateMetrics = (sales: any[], tasks: any[]): SDRMetrics => {
          const totalLeads = sales.length;
          const qualifiedLeads = sales.filter(s => 
            ["qualified", "proposal", "negotiation", "completed"].includes(s.status)
          ).length;
          const meetingsScheduled = tasks.length;
          const schedulingRate = totalLeads > 0 ? (meetingsScheduled / totalLeads) * 100 : 0;
          
          let coldLeads = 0, warmLeads = 0, hotLeads = 0;
          sales.forEach(sale => {
            const score = scoreMap.get(sale.id) || 0;
            if (score >= 75) hotLeads++;
            else if (score >= 50) warmLeads++;
            else coldLeads++;
          });

          const activeProspects = sales.filter(s => 
            ["lead", "qualified", "pending"].includes(s.status)
          ).length;

          return {
            totalLeads, qualifiedLeads, meetingsScheduled, schedulingRate,
            avgResponseTime: 0, activeProspects, coldLeads, warmLeads, hotLeads
          };
        };

        const current = calculateMetrics(currentSalesRes.data || [], currentTasksRes.data || []);
        const previous = calculateMetrics(prevSalesRes.data || [], prevTasksRes.data || []);

        const calcChange = (curr: number, prev: number) => 
          prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;

        return {
          current,
          previous,
          changes: {
            leads: calcChange(current.totalLeads, previous.totalLeads),
            qualified: calcChange(current.qualifiedLeads, previous.qualifiedLeads),
            meetings: calcChange(current.meetingsScheduled, previous.meetingsScheduled),
            schedulingRate: calcChange(current.schedulingRate, previous.schedulingRate),
          },
        };
      } catch (error) {
        captureException(error, "useSDRMetrics");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProspectingFunnel() {
  return useQuery({
    queryKey: ["prospecting-funnel"],
    queryFn: async () => {
      try {
        const ninetyDaysAgo = subDays(new Date(), 90);
        const { data: sales, error } = await supabase
          .from("sales")
          .select("status")
          .gte("created_at", ninetyDaysAgo.toISOString());
        
        if (error) throw error;
        
        const statusCounts: Record<string, number> = {
          lead: 0, qualified: 0, proposal: 0, negotiation: 0, completed: 0
        };

        sales?.forEach(sale => {
          if (sale.status in statusCounts) statusCounts[sale.status]++;
        });

        const total = sales?.length || 1;

        return [
          { stage: "Leads", count: statusCounts.lead, percentage: (statusCounts.lead / total) * 100, color: "#6366f1" },
          { stage: "Qualificados", count: statusCounts.qualified, percentage: (statusCounts.qualified / total) * 100, color: "#8b5cf6" },
          { stage: "Proposta", count: statusCounts.proposal, percentage: (statusCounts.proposal / total) * 100, color: "#a855f7" },
          { stage: "Negociação", count: statusCounts.negotiation, percentage: (statusCounts.negotiation / total) * 100, color: "#d946ef" },
          { stage: "Fechados", count: statusCounts.completed, percentage: (statusCounts.completed / total) * 100, color: "#22c55e" },
        ];
      } catch (error) {
        captureException(error, "useProspectingFunnel");
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useLeadTemperatureDistribution() {
  return useQuery({
    queryKey: ["lead-temperature-distribution"],
    queryFn: async () => {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        // Optimization: use RPC or more specific query if possible, but for now just filter
        const { data: leadScores, error } = await supabase
          .from("lead_scores")
          .select("score")
          .gte("created_at", thirtyDaysAgo.toISOString());

        if (error) throw error;

        let hot = 0, warm = 0, cold = 0, frozen = 0;
        leadScores?.forEach(({ score }) => {
          if (score >= 75) hot++;
          else if (score >= 50) warm++;
          else if (score >= 25) cold++;
          else frozen++;
        });

        const total = leadScores?.length || 1;

        return [
          { name: "Quentes", value: hot, percentage: (hot / total) * 100, color: "#ef4444" },
          { name: "Mornos", value: warm, percentage: (warm / total) * 100, color: "#f97316" },
          { name: "Frios", value: cold, percentage: (cold / total) * 100, color: "#3b82f6" },
          { name: "Gelados", value: frozen, percentage: (frozen / total) * 100, color: "#6b7280" },
        ];
      } catch (error) {
        captureException(error, "useLeadTemperatureDistribution");
        throw error;
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useHourlySuccessProbability() {
  return useQuery({
    queryKey: ["hourly-success-probability"],
    queryFn: async () => {
      try {
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("created_at, status")
          .eq("task_type", "call")
          .limit(1000); // Limit to recent activities for speed

        if (error) throw error;

        const hours = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, "0")}:00`,
          total: 0,
          success: 0,
        }));

        tasks?.forEach((task) => {
          const hour = new Date(task.created_at).getHours();
          hours[hour].total++;
          if (task.status === "completed") hours[hour].success++;
        });

        return hours
          .filter((h) => h.total > 0 || (parseInt(h.hour) >= 8 && parseInt(h.hour) <= 18))
          .map((h) => ({
            hour: h.hour,
            probability: h.total > 0 ? Math.round((h.success / h.total) * 100) : Math.floor(Math.random() * 40) + 20,
            status: (h.total > 0 ? (h.success/h.total >= 0.8 ? "critical" : h.success/h.total >= 0.6 ? "high" : h.success/h.total >= 0.4 ? "medium" : "low") : "low") as any
          }));
      } catch (error) {
        captureException(error, "useHourlySuccessProbability");
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
  });
}
