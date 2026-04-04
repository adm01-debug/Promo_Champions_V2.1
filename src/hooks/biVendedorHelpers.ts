import { format, subDays, parseISO, differenceInDays } from "date-fns";

interface PipelineDeal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface ActivityRecord {
  activity_type: string;
  created_at: string;
}

interface SaleRecord {
  id?: string;
  amount: number;
  category?: string;
  status?: string;
  created_at: string;
  salesperson_id?: string | null;
}

export function computeRanking(
  rankingData: SaleRecord[],
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

export function computePipelineByStage(pipelineDeals: PipelineDeal[], now: Date) {
  const pipelineValue = pipelineDeals.reduce((sum, s) => sum + Number(s.amount), 0);
  const dealsByStage = ["pending", "qualified", "proposal", "negotiation"].map(stage => ({
    stage,
    count: pipelineDeals.filter(d => d.status === stage).length,
    value: pipelineDeals.filter(d => d.status === stage).reduce((sum, d) => sum + Number(d.amount), 0),
  }));
  const avgDaysInPipeline = pipelineDeals.length > 0
    ? pipelineDeals.reduce((sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0) / pipelineDeals.length
    : 0;
  return { pipelineValue, dealsByStage, avgDaysInPipeline };
}

export function buildSalesByDay(sales: SaleRecord[]) {
  const map: Record<string, number> = {};
  sales.forEach(sale => {
    const day = format(parseISO(sale.created_at), "dd/MM");
    map[day] = (map[day] || 0) + Number(sale.amount);
  });
  return Object.entries(map).map(([day, value]) => ({ day, value }));
}

export function buildSalesByCategory(sales: Array<{ category?: string; amount: number }>) {
  const map: Record<string, number> = {};
  sales.forEach(sale => {
    const cat = sale.category || "other";
    map[cat] = (map[cat] || 0) + Number(sale.amount);
  });
  return Object.entries(map).map(([category, value]) => ({ category, value }));
}
