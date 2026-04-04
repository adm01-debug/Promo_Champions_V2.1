import { differenceInDays, format, parseISO } from "date-fns";

/**
 * Transforms raw sales data into client insights for Closer BI
 */
export function transformClientInsights(allClientSales: { client_name: string; amount: number | string; category: string; created_at: string }[]) {
  const clientTotals: Record<string, { value: number; count: number }> = {};
  allClientSales.forEach(sale => {
    if (!clientTotals[sale.client_name]) {
      clientTotals[sale.client_name] = { value: 0, count: 0 };
    }
    clientTotals[sale.client_name].value += Number(sale.amount);
    clientTotals[sale.client_name].count++;
  });

  const topClients = Object.entries(clientTotals)
    .map(([name, data]) => ({ name, company: name, totalValue: data.value, dealsCount: data.count, avgTicket: data.value / data.count }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  const highestTicketClients = Object.entries(clientTotals)
    .map(([name, data]) => ({ name, avgTicket: data.value / data.count, totalPurchases: data.count }))
    .filter(c => c.totalPurchases >= 2)
    .sort((a, b) => b.avgTicket - a.avgTicket)
    .slice(0, 10);

  const clientPurchaseHistory = Object.keys(clientTotals).slice(0, 5).map(clientName => ({
    clientName,
    purchases: allClientSales
      .filter(s => s.client_name === clientName)
      .map(s => ({ date: format(parseISO(s.created_at), "dd/MM/yyyy"), value: Number(s.amount), category: s.category }))
  }));

  return { topClients, highestTicketClients, clientPurchaseHistory };
}

/**
 * Transforms sales data into chart-ready format
 */
export function transformChartData(
  completedSales: { amount: number | string; category: string; created_at: string }[],
  allClientSales: { amount: number | string; created_at: string }[],
  stageHistory: { stage: string; entered_at: string; exited_at: string | null }[]
) {
  // Revenue by day
  const revenueByDayMap: Record<string, number> = {};
  completedSales.forEach(sale => {
    const day = format(parseISO(sale.created_at), "dd/MM");
    revenueByDayMap[day] = (revenueByDayMap[day] || 0) + Number(sale.amount);
  });
  const revenueByDay = Object.entries(revenueByDayMap).map(([day, value]) => ({ day, value }));

  // Deals by category
  const categoryMap: Record<string, { value: number; count: number }> = {};
  completedSales.forEach(sale => {
    if (!categoryMap[sale.category]) categoryMap[sale.category] = { value: 0, count: 0 };
    categoryMap[sale.category].value += Number(sale.amount);
    categoryMap[sale.category].count++;
  });
  const dealsByCategory = Object.entries(categoryMap).map(([category, data]) => ({ category, ...data }));

  // Revenue by month
  const revenueByMonthMap: Record<string, { value: number; deals: number }> = {};
  allClientSales.forEach(sale => {
    const month = format(parseISO(sale.created_at), "MMM/yy");
    if (!revenueByMonthMap[month]) revenueByMonthMap[month] = { value: 0, deals: 0 };
    revenueByMonthMap[month].value += Number(sale.amount);
    revenueByMonthMap[month].deals++;
  });
  const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, data]) => ({ month, ...data }));

  // Deal velocity
  const stageAvgDays: Record<string, { total: number; count: number }> = {};
  stageHistory.forEach(h => {
    if (h.exited_at) {
      const days = differenceInDays(parseISO(h.exited_at), parseISO(h.entered_at));
      if (!stageAvgDays[h.stage]) stageAvgDays[h.stage] = { total: 0, count: 0 };
      stageAvgDays[h.stage].total += days;
      stageAvgDays[h.stage].count++;
    }
  });
  const dealVelocity = Object.entries(stageAvgDays).map(([stage, data]) => ({ stage, avgDays: data.count > 0 ? data.total / data.count : 0 }));

  return { revenueByDay, dealsByCategory, revenueByMonth, dealVelocity };
}
