import { differenceInDays, parseISO, format, subDays } from "date-fns";
import type { SalespersonPerformanceData } from "@/types/bi";

// Types used in helpers
interface SaleRecord {
  id?: string;
  salesperson_id?: string | null;
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
  salesperson_id?: string | null;
  activity_type: string;
  created_at?: string;
}

interface SalespersonRecord {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

const STAGE_PROBABILITIES: Record<string, number> = {
  pending: 0.1, qualified: 0.3, proposal: 0.6, negotiation: 0.8,
};

// --- GESTOR HELPERS ---

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
  const a: any[] = [], b: any[] = [], c: any[] = [];

  sorted.forEach(sp => {
    cumulative += sp.revenue;
    const pct = totalRevenue > 0 ? (cumulative / totalRevenue) * 100 : 100;
    if (pct <= 80 && a.length < sorted.length * 0.2) a.push(sp);
    else if (pct <= 95 && b.length < sorted.length * 0.3) b.push(sp);
    else c.push(sp);
  });

  return [
    { classification: "A", count: a.length, revenue: a.reduce((s: number, x: any) => s + x.revenue, 0), percentage: 80 },
    { classification: "B", count: b.length, revenue: b.reduce((s: number, x: any) => s + x.revenue, 0), percentage: 15 },
    { classification: "C", count: c.length, revenue: c.reduce((s: number, x: any) => s + x.revenue, 0), percentage: 5 },
  ];
}

// --- VENDEDOR HELPERS ---

export function computeRanking(
  rankingData: Array<{ salesperson_id?: string | null; amount: number }>,
  salespersonId: string,
  totalSalespeople: number
): number {
  const salesBySp: Record<string, number> = {};
  rankingData.forEach(sale => {
    if (sale.salesperson_id) {
      salesBySp[sale.salesperson_id] = (salesBySp[sale.salesperson_id] || 0) + Number(sale.amount);
    }
  });
  const rankings = Object.entries(salesBySp)
    .sort((a, b) => b[1] - a[1])
    .map(([id], index) => ({ id, rank: index + 1 }));
  return rankings.find(r => r.id === salespersonId)?.rank || totalSalespeople;
}

export function computeActivitiesByType(activities: ActivityRecord[]) {
  const counts: Record<string, number> = {};
  activities.forEach(a => {
    counts[a.activity_type] = (counts[a.activity_type] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

export function computeStreak(
  achievementDates: string[],
  now: Date
): { currentStreak: number; bestStreak: number } {
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < 30; i++) {
    const checkDate = format(subDays(now, i), "yyyy-MM-dd");
    if (achievementDates.includes(checkDate)) {
      if (i === 0 || tempStreak > 0) {
        tempStreak++;
        if (i < 7) currentStreak = tempStreak;
      }
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);
  return { currentStreak, bestStreak };
}

export function buildSalesByDay(sales: SaleRecord[]) {
  const map: Record<string, number> = {};
  sales.forEach(sale => {
    const day = format(parseISO(sale.created_at), "dd/MM");
    map[day] = (map[day] || 0) + Number(sale.amount);
  });
  return Object.entries(map).map(([day, value]) => ({ day, value }));
}

export function buildSalesByCategory(sales: Array<{ category?: string | null; amount: number }>) {
  const map: Record<string, number> = {};
  sales.forEach(sale => {
    const cat = sale.category || "other";
    map[cat] = (map[cat] || 0) + Number(sale.amount);
  });
  return Object.entries(map).map(([category, value]) => ({ category, value }));
}
