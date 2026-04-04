import { differenceInDays, parseISO, format } from "date-fns";
import type { SalespersonPerformanceData } from "./useBIGestor";

interface SaleRecord {
  id?: string;
  salesperson_id: string | null;
  amount: number;
  status: string;
  category?: string | null;
  source?: string | null;
  created_at: string;
}

interface GoalRecord {
  salesperson_id: string;
  goal_amount: number;
}

interface ActivityRecord {
  salesperson_id: string | null;
  activity_type: string;
}

interface SalespersonRecord {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

export function buildSalespeoplePerformance(
  salespeople: SalespersonRecord[],
  completedSales: SaleRecord[],
  allCurrentSales: SaleRecord[],
  goals: GoalRecord[],
  activities: ActivityRecord[]
): SalespersonPerformanceData[] {
  return salespeople.map(sp => {
    const spCompleted = completedSales.filter(s => s.salesperson_id === sp.id);
    const spAll = allCurrentSales.filter(s => s.salesperson_id === sp.id);
    const spGoal = goals.find(g => g.salesperson_id === sp.id)?.goal_amount || 0;
    const spActivities = activities.filter(a => a.salesperson_id === sp.id);

    const revenue = spCompleted.reduce((sum, s) => sum + Number(s.amount), 0);
    const deals = spCompleted.length;

    return {
      id: sp.id,
      name: sp.name,
      avatar_url: sp.avatar_url,
      role: sp.role,
      revenue,
      deals,
      conversionRate: spAll.length > 0 ? (deals / spAll.length) * 100 : 0,
      goalProgress: spGoal > 0 ? (revenue / spGoal) * 100 : 0,
      avgTicket: deals > 0 ? revenue / deals : 0,
      activities: spActivities.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function computePipelineHealth(pipelineDeals: SaleRecord[], now: Date) {
  const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + Number(d.amount), 0);
  const atRiskDeals = pipelineDeals.filter(d => differenceInDays(now, parseISO(d.created_at)) > 14).length;
  const avgDaysInPipeline = pipelineDeals.length > 0
    ? pipelineDeals.reduce((sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0) / pipelineDeals.length
    : 0;

  const stages = ["pending", "qualified", "proposal", "negotiation"];
  const dealsByStage = stages.map(stage => ({
    stage,
    count: pipelineDeals.filter(d => d.status === stage).length,
    value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0),
  }));

  return { totalPipelineValue, atRiskDeals, avgDaysInPipeline, dealsByStage };
}

const STAGE_PROBABILITIES: Record<string, number> = {
  pending: 0.1, qualified: 0.3, proposal: 0.6, negotiation: 0.8,
};

export function computeForecast(
  pipelineDeals: SaleRecord[],
  totalTeamRevenue: number,
  totalTeamGoal: number,
  daysRemaining: number,
  daysPassed: number
) {
  const weightedForecast = pipelineDeals.reduce(
    (sum, d) => sum + Number(d.amount) * (STAGE_PROBABILITIES[d.status] || 0.1), 0
  );
  const dailyAvg = daysPassed > 0 ? totalTeamRevenue / daysPassed : 0;
  const projectedRevenue = totalTeamRevenue + dailyAvg * daysRemaining;
  const confidenceLevel = Math.min(100, (totalTeamRevenue / totalTeamGoal) * 100 + 20);

  return { weightedForecast, projectedRevenue, confidenceLevel };
}

export function buildRevenueByMonth(sales: SaleRecord[]) {
  const map: Record<string, number> = {};
  sales.forEach(sale => {
    const month = format(parseISO(sale.created_at), "MMM/yy");
    map[month] = (map[month] || 0) + Number(sale.amount);
  });
  return Object.entries(map).map(([month, value]) => ({ month, value }));
}

export function buildDealsBySource(completedSales: SaleRecord[]) {
  const map: Record<string, { count: number; value: number }> = {};
  completedSales.forEach(sale => {
    const source = sale.source || "other";
    if (!map[source]) map[source] = { count: 0, value: 0 };
    map[source].count++;
    map[source].value += Number(sale.amount);
  });
  return Object.entries(map).map(([source, data]) => ({ source, ...data }));
}

export function buildABCAnalysis(performance: SalespersonPerformanceData[]) {
  const sorted = [...performance].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((sum, sp) => sum + sp.revenue, 0);

  let cumulative = 0;
  const a: typeof sorted = [], b: typeof sorted = [], c: typeof sorted = [];

  sorted.forEach(sp => {
    cumulative += sp.revenue;
    const pct = totalRevenue > 0 ? (cumulative / totalRevenue) * 100 : 100;
    if (pct <= 80 && a.length < sorted.length * 0.2) a.push(sp);
    else if (pct <= 95 && b.length < sorted.length * 0.3) b.push(sp);
    else c.push(sp);
  });

  return [
    { classification: "A", count: a.length, revenue: a.reduce((s, x) => s + x.revenue, 0), percentage: 80 },
    { classification: "B", count: b.length, revenue: b.reduce((s, x) => s + x.revenue, 0), percentage: 15 },
    { classification: "C", count: c.length, revenue: c.reduce((s, x) => s + x.revenue, 0), percentage: 5 },
  ];
}
