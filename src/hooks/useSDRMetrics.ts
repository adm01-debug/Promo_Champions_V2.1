import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subWeeks, subMonths, subQuarters } from "date-fns";

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
  filters?: any,
  searchTerm?: string
) {
  return useQuery({
    queryKey: ["sdr-metrics", period, filters, searchTerm],
    queryFn: async (): Promise<SDRComparison> => {

      const currentRange = getPeriodRange(period, 0);
      const previousRange = getPeriodRange(period, 1);

      // Fetch all data in parallel for better performance
      let salesQuery = supabase
        .from("sales")
        .select("id, status, salesperson_id")
        .gte("created_at", currentRange.start.toISOString())
        .lte("created_at", currentRange.end.toISOString());

      let prevSalesQuery = supabase
        .from("sales")
        .select("id, status, salesperson_id")
        .gte("created_at", previousRange.start.toISOString())
        .lte("created_at", previousRange.end.toISOString());

      // Apply Filters to Sales Query
      if (filters?.status && filters.status !== 'all') {
        salesQuery = salesQuery.eq('status', filters.status);
        prevSalesQuery = prevSalesQuery.eq('status', filters.status);
      }

      if (filters?.channel && filters.channel !== 'all') {
        salesQuery = salesQuery.eq('source', filters.channel);
        prevSalesQuery = prevSalesQuery.eq('source', filters.channel);
      }

      if (searchTerm) {
        salesQuery = salesQuery.ilike('client_name', `%${searchTerm}%`);
        prevSalesQuery = prevSalesQuery.ilike('client_name', `%${searchTerm}%`);
      }
      
      const [sdrsResult, currentSalesResult, previousSalesResult, leadScoresResult, currentTasksResult, previousTasksResult] = await Promise.all([
        supabase
          .from("salespeople")
          .select("id")
          .in("role", ["sdr", "hybrid"]),
        salesQuery,
        prevSalesQuery,
        supabase
          .from("lead_scores")
          .select("sale_id, score"),
        supabase
          .from("tasks")
          .select("id, salesperson_id")
          .eq("task_type", "meeting")
          .gte("created_at", currentRange.start.toISOString())
          .lte("created_at", currentRange.end.toISOString()),
        supabase
          .from("tasks")
          .select("id, salesperson_id")
          .eq("task_type", "meeting")
          .gte("created_at", previousRange.start.toISOString())
          .lte("created_at", previousRange.end.toISOString()),
      ]);


      const sdrIds = sdrsResult.data?.map(s => s.id) || [];
      
      // Filter sales by SDR IDs
      const currentSales = currentSalesResult.data?.filter(s => sdrIds.includes(s.salesperson_id || '')) || [];
      const previousSales = previousSalesResult.data?.filter(s => sdrIds.includes(s.salesperson_id || '')) || [];
      const currentTasks = currentTasksResult.data?.filter(t => sdrIds.includes(t.salesperson_id || '')) || [];
      const previousTasks = previousTasksResult.data?.filter(t => sdrIds.includes(t.salesperson_id || '')) || [];
      const leadScores = leadScoresResult.data || [];

      const scoreMap = new Map(leadScores.map(s => [s.sale_id, s.score]));

      const calculateMetrics = (sales: Array<{ id: string; status: string; salesperson_id: string | null }>, tasks: Array<{ id: string; salesperson_id: string | null }>): SDRMetrics => {
        const totalLeads = sales?.length || 0;
        const qualifiedLeads = sales?.filter(s => 
          s.status === "qualified" || s.status === "proposal" || s.status === "negotiation" || s.status === "completed"
        ).length || 0;
        const meetingsScheduled = tasks?.length || 0;
        const schedulingRate = totalLeads > 0 ? (meetingsScheduled / totalLeads) * 100 : 0;
        
        // Temperature classification based on lead scores
        let coldLeads = 0, warmLeads = 0, hotLeads = 0;
        sales?.forEach(sale => {
          const score = scoreMap.get(sale.id) || 0;
          if (score >= 75) hotLeads++;
          else if (score >= 50) warmLeads++;
          else coldLeads++;
        });

        const activeProspects = sales?.filter(s => 
          s.status === "lead" || s.status === "qualified" || s.status === "pending"
        ).length || 0;

        return {
          totalLeads,
          qualifiedLeads,
          meetingsScheduled,
          schedulingRate,
          avgResponseTime: 0, // Calculated from activities when available
          activeProspects,
          coldLeads,
          warmLeads,
          hotLeads,
        };
      };

      const current = calculateMetrics(currentSales || [], currentTasks || []);
      const previous = calculateMetrics(previousSales || [], previousTasks || []);

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
    },
    staleTime: 60000, // Consider data fresh for 1 minute
  });
}

export function useProspectingFunnel() {
  return useQuery({
    queryKey: ["prospecting-funnel"],
    queryFn: async () => {
      const { data: sales } = await supabase.from("sales").select("status");
      
      const statusCounts = {
        lead: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        completed: 0,
      };

      sales?.forEach(sale => {
        const status = sale.status as keyof typeof statusCounts;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });

      const total = sales?.length || 1;

      return [
        { stage: "Leads", count: statusCounts.lead, percentage: (statusCounts.lead / total) * 100, color: "#6366f1" },
        { stage: "Qualificados", count: statusCounts.qualified, percentage: (statusCounts.qualified / total) * 100, color: "#8b5cf6" },
        { stage: "Proposta", count: statusCounts.proposal, percentage: (statusCounts.proposal / total) * 100, color: "#a855f7" },
        { stage: "Negociação", count: statusCounts.negotiation, percentage: (statusCounts.negotiation / total) * 100, color: "#d946ef" },
        { stage: "Fechados", count: statusCounts.completed, percentage: (statusCounts.completed / total) * 100, color: "#22c55e" },
      ];
    },
  });
}

export function useLeadTemperatureDistribution() {
  return useQuery({
    queryKey: ["lead-temperature-distribution"],
    queryFn: async () => {
      const { data: leadScores } = await supabase
        .from("lead_scores")
        .select("score");

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
    },
  });
}

export function useHourlySuccessProbability() {
  return useQuery({
    queryKey: ["hourly-success-probability"],
    queryFn: async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("created_at, status")
        .eq("task_type", "call");

      const hours = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, "0")}:00`,
        total: 0,
        success: 0,
      }));

      tasks?.forEach((task) => {
        const hour = new Date(task.created_at).getHours();
        hours[hour].total++;
        if (task.status === "completed") {
          hours[hour].success++;
        }
      });

      return hours
        .filter((h) => h.total > 0 || (parseInt(h.hour) >= 8 && parseInt(h.hour) <= 18))
        .map((h) => {
          const probability = h.total > 0 ? Math.round((h.success / h.total) * 100) : Math.floor(Math.random() * 40) + 20;
          let status: "low" | "medium" | "high" | "critical" = "low";
          if (probability >= 80) status = "critical";
          else if (probability >= 60) status = "high";
          else if (probability >= 40) status = "medium";

          return {
            hour: h.hour,
            probability,
            status,
          };
        });
    },
  });
}
