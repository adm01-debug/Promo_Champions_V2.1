import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange, getPreviousPeriodRange, getSamePeriodLastYear } from "./useBIFilters";
import { differenceInDays, format, parseISO, differenceInBusinessDays, endOfMonth, startOfMonth } from "date-fns";
import { transformClientInsights, transformChartData } from "./useBICloserTransformers";

export interface BICloserData {
  totalRevenue: number;
  avgTicket: number;
  totalDeals: number;
  completedDeals: number;
  conversionRate: number;
  revenueGoal: number;
  goalProgress: number;
  daysRemaining: number;
  dailyRevenueNeeded: number;
  projectedRevenue: number;
  commission: number;
  commissionRate: number;
  pipelineValue: number;
  pipelineCount: number;
  weightedPipeline: number;
  pipelineByStage: { stage: string; count: number; value: number; probability: number }[];
  avgDaysToClose: number;
  avgDaysInPipeline: number;
  previousPeriod: { revenue: number; deals: number; avgTicket: number; conversionRate: number };
  sameLastYear: { revenue: number; deals: number; avgTicket: number; conversionRate: number };
  currentRank: number;
  totalClosers: number;
  topClients: { name: string; company: string; totalValue: number; dealsCount: number; avgTicket: number }[];
  recentDeals: { clientName: string; value: number; status: string; date: string }[];
  clientPurchaseHistory: { clientName: string; purchases: { date: string; value: number; category: string }[] }[];
  highestTicketClients: { name: string; avgTicket: number; totalPurchases: number }[];
  wonDeals: number;
  lostDeals: number;
  winRate: number;
  lostReasons: { reason: string; count: number }[];
  revenueByDay: { day: string; value: number }[];
  dealsByCategory: { category: string; value: number; count: number }[];
  revenueByMonth: { month: string; value: number; deals: number }[];
  dealVelocity: { stage: string; avgDays: number }[];
}

interface UseBICloserOptions {
  dateRange: DateRange;
  salespersonId?: string;
}

export function useBICloser({ dateRange, salespersonId }: UseBICloserOptions) {
  const { salesperson } = useAuth();
  const targetSalespersonId = salespersonId || salesperson?.id;

  return useQuery({
    queryKey: ["bi-closer", targetSalespersonId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<BICloserData> => {
      if (!targetSalespersonId) throw new Error("Closer não encontrado");

      const previousRange = getPreviousPeriodRange(dateRange);
      const lastYearRange = getSamePeriodLastYear(dateRange);
      const now = new Date();

      const [currentSalesRes, previousSalesRes, lastYearSalesRes, goalRes, salespersonRes, pipelineRes, allClosersRes, dealOutcomesRes, stageHistoryRes, allClientSalesRes] = await Promise.all([
        supabase.from("sales").select("id, amount, status, category, source, client_name, created_at, updated_at").eq("salesperson_id", targetSalespersonId).gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString()),
        supabase.from("sales").select("id, amount, status").eq("salesperson_id", targetSalespersonId).gte("created_at", previousRange.start.toISOString()).lte("created_at", previousRange.end.toISOString()),
        supabase.from("sales").select("id, amount, status").eq("salesperson_id", targetSalespersonId).gte("created_at", lastYearRange.start.toISOString()).lte("created_at", lastYearRange.end.toISOString()),
        supabase.from("sales_goals").select("goal_amount").eq("salesperson_id", targetSalespersonId).eq("month", format(now, "yyyy-MM") + "-01").maybeSingle(),
        supabase.from("salespeople").select("commission_rate").eq("id", targetSalespersonId).single(),
        supabase.from("sales").select("id, amount, status, client_name, created_at").eq("salesperson_id", targetSalespersonId).in("status", ["qualified", "proposal", "negotiation"]),
        supabase.from("salespeople").select("id, role").eq("is_active", true).in("role", ["closer", "hybrid"]),
        supabase.from("deal_outcomes").select("outcome, reason").eq("salesperson_id", targetSalespersonId).gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString()),
        supabase.from("deal_stage_history").select("stage, entered_at, exited_at").gte("entered_at", dateRange.start.toISOString()),
        supabase.from("sales").select("client_name, amount, category, created_at, status").eq("salesperson_id", targetSalespersonId).eq("status", "completed").order("created_at", { ascending: false }).limit(500)
      ]);

      const currentSales = currentSalesRes.data || [];
      const previousSales = previousSalesRes.data || [];
      const lastYearSales = lastYearSalesRes.data || [];
      const goal = goalRes.data?.goal_amount || 0;
      const commissionRate = salespersonRes.data?.commission_rate || 10;
      const pipelineDeals = pipelineRes.data || [];
      const allClosers = allClosersRes.data || [];
      const dealOutcomes = dealOutcomesRes.data || [];
      const stageHistory = stageHistoryRes.data || [];
      const allClientSales = allClientSalesRes.data || [];

      // Revenue metrics
      const completedSales = currentSales.filter(s => s.status === "completed");
      const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
      const completedDeals = completedSales.length;
      const avgTicket = completedDeals > 0 ? totalRevenue / completedDeals : 0;
      const totalDeals = currentSales.length;
      const conversionRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;

      // Goal calculations
      const goalProgress = goal > 0 ? (totalRevenue / goal) * 100 : 0;
      const monthEnd = endOfMonth(now);
      const monthStart = startOfMonth(now);
      const daysRemaining = differenceInBusinessDays(monthEnd, now);
      const daysElapsed = differenceInBusinessDays(now, monthStart);
      const dailyRevenueNeeded = daysRemaining > 0 ? Math.max(0, (goal - totalRevenue) / daysRemaining) : 0;
      const dailyAvgRevenue = daysElapsed > 0 ? totalRevenue / daysElapsed : 0;
      const projectedRevenue = totalRevenue + (dailyAvgRevenue * daysRemaining);
      const commission = totalRevenue * (commissionRate / 100);

      // Pipeline
      const pipelineValue = pipelineDeals.reduce((sum, d) => sum + Number(d.amount), 0);
      const stageProbabilities: Record<string, number> = { qualified: 0.3, proposal: 0.6, negotiation: 0.8 };
      const weightedPipeline = pipelineDeals.reduce((sum, d) => sum + Number(d.amount) * (stageProbabilities[d.status] || 0.3), 0);
      const pipelineByStage = ["qualified", "proposal", "negotiation"].map(stage => ({
        stage, count: pipelineDeals.filter(d => d.status === stage).length,
        value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0),
        probability: stageProbabilities[stage] || 0.3
      }));
      const avgDaysInPipeline = pipelineDeals.length > 0 ? pipelineDeals.reduce((sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0) / pipelineDeals.length : 0;
      const avgDaysToClose = completedSales.length > 0 ? completedSales.reduce((sum, s) => sum + differenceInDays(parseISO(s.updated_at), parseISO(s.created_at)), 0) / completedSales.length : 0;

      // Period comparisons
      const prevCompleted = previousSales.filter(s => s.status === "completed");
      const prevRevenue = prevCompleted.reduce((sum, s) => sum + Number(s.amount), 0);
      const previousPeriod = { revenue: prevRevenue, deals: prevCompleted.length, avgTicket: prevCompleted.length > 0 ? prevRevenue / prevCompleted.length : 0, conversionRate: previousSales.length > 0 ? (prevCompleted.length / previousSales.length) * 100 : 0 };

      const lastYearCompleted = lastYearSales.filter(s => s.status === "completed");
      const lastYearRevenue = lastYearCompleted.reduce((sum, s) => sum + Number(s.amount), 0);
      const sameLastYear = { revenue: lastYearRevenue, deals: lastYearCompleted.length, avgTicket: lastYearCompleted.length > 0 ? lastYearRevenue / lastYearCompleted.length : 0, conversionRate: lastYearSales.length > 0 ? (lastYearCompleted.length / lastYearSales.length) * 100 : 0 };

      // Ranking
      const { data: allCloserSales } = await supabase.from("sales").select("salesperson_id, amount").eq("status", "completed").gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString()).in("salesperson_id", allClosers.map(c => c.id));
      const closerRevenues: Record<string, number> = {};
      (allCloserSales || []).forEach(s => { if (s.salesperson_id) closerRevenues[s.salesperson_id] = (closerRevenues[s.salesperson_id] || 0) + Number(s.amount); });
      const rankings = Object.entries(closerRevenues).sort((a, b) => b[1] - a[1]).map(([id], index) => ({ id, rank: index + 1 }));
      const currentRank = rankings.find(r => r.id === targetSalespersonId)?.rank || allClosers.length;

      // Client insights (extracted)
      const { topClients, highestTicketClients, clientPurchaseHistory } = transformClientInsights(allClientSales);

      // Recent deals
      const recentDeals = currentSales.slice(0, 10).map(s => ({ clientName: s.client_name, value: Number(s.amount), status: s.status, date: format(parseISO(s.created_at), "dd/MM/yyyy") }));

      // Win/Loss
      const wonDeals = currentSales.filter(s => s.status === "completed").length;
      const lostDeals = currentSales.filter(s => s.status === "lost").length;
      const winRate = (wonDeals + lostDeals) > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;
      const lostReasonCounts: Record<string, number> = {};
      dealOutcomes.filter(d => d.outcome === "lost").forEach(d => { lostReasonCounts[d.reason] = (lostReasonCounts[d.reason] || 0) + 1; });
      const lostReasons = Object.entries(lostReasonCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);

      // Charts (extracted)
      const { revenueByDay, dealsByCategory, revenueByMonth, dealVelocity } = transformChartData(completedSales, allClientSales, stageHistory);

      return {
        totalRevenue, avgTicket, totalDeals, completedDeals, conversionRate,
        revenueGoal: goal, goalProgress, daysRemaining, dailyRevenueNeeded, projectedRevenue, commission, commissionRate,
        pipelineValue, pipelineCount: pipelineDeals.length, weightedPipeline, pipelineByStage, avgDaysToClose, avgDaysInPipeline,
        previousPeriod, sameLastYear, currentRank, totalClosers: allClosers.length,
        topClients, recentDeals, clientPurchaseHistory, highestTicketClients,
        wonDeals, lostDeals, winRate, lostReasons,
        revenueByDay, dealsByCategory, revenueByMonth, dealVelocity
      };
    },
    enabled: !!targetSalespersonId,
    staleTime: 60000,
    refetchInterval: 60000
  });
}
