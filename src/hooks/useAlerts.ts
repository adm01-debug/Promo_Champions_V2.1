import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";

export type AlertType = "stagnant_deal" | "inactive_client" | "at_risk_goal";
export type AlertSeverity = "warning" | "critical";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  daysStagnant?: number;
  clientName?: string;
  amount?: number;
  createdAt: Date;
}

const STAGNANT_WARNING_DAYS = 7;
const STAGNANT_CRITICAL_DAYS = 14;
const INACTIVE_CLIENT_DAYS = 30;

export const useAlerts = () => {
  return useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async (): Promise<Alert[]> => {
      const alerts: Alert[] = [];
      const now = new Date();

      // Fetch pending/in-progress deals
      const { data: pendingDeals } = await supabase
        .from("sales")
        .select("*")
        .in("status", ["pending", "in_progress", "negotiation", "proposal"]);

      // Check for stagnant deals
      pendingDeals?.forEach((deal) => {
        const updatedAt = parseISO(deal.updated_at);
        const daysSinceUpdate = differenceInDays(now, updatedAt);

        if (daysSinceUpdate >= STAGNANT_WARNING_DAYS) {
          const isCritical = daysSinceUpdate >= STAGNANT_CRITICAL_DAYS;
          alerts.push({
            id: `stagnant-${deal.id}`,
            type: "stagnant_deal",
            severity: isCritical ? "critical" : "warning",
            title: isCritical ? "Deal crítico parado" : "Deal parado",
            description: `${deal.client_name} - ${deal.product_name}`,
            daysStagnant: daysSinceUpdate,
            clientName: deal.client_name,
            amount: Number(deal.amount),
            createdAt: updatedAt,
          });
        }
      });

      // Fetch all clients with their last sale
      const { data: allSales } = await supabase
        .from("sales")
        .select("client_name, created_at, status")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      // Group by client and find inactive ones
      const clientLastSale: Record<string, Date> = {};
      allSales?.forEach((sale) => {
        if (!clientLastSale[sale.client_name]) {
          clientLastSale[sale.client_name] = parseISO(sale.created_at);
        }
      });

      Object.entries(clientLastSale).forEach(([clientName, lastSaleDate]) => {
        const daysSinceLastSale = differenceInDays(now, lastSaleDate);
        if (daysSinceLastSale >= INACTIVE_CLIENT_DAYS) {
          alerts.push({
            id: `inactive-${clientName}`,
            type: "inactive_client",
            severity: daysSinceLastSale >= 60 ? "critical" : "warning",
            title: "Cliente inativo",
            description: `${clientName} - última compra há ${daysSinceLastSale} dias`,
            daysStagnant: daysSinceLastSale,
            clientName,
            createdAt: lastSaleDate,
          });
        }
      });

      // Check for at-risk goals (salespeople behind on their monthly goals)
      const { data: salespeople } = await supabase
        .from("salespeople")
        .select("id, name")
        .eq("is_active", true);

      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { data: goals } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("month", currentMonth);

      const dayOfMonth = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const expectedProgress = (dayOfMonth / daysInMonth) * 100;

      for (const person of salespeople || []) {
        const goal = goals?.find((g) => g.salesperson_id === person.id);
        if (!goal) continue;

        const { data: sales } = await supabase
          .from("sales")
          .select("amount")
          .eq("salesperson_id", person.id)
          .eq("status", "completed")
          .gte("created_at", currentMonth);

        const totalSales = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
        const actualProgress = (totalSales / Number(goal.goal_amount)) * 100;

        if (actualProgress < expectedProgress - 20) {
          alerts.push({
            id: `goal-risk-${person.id}`,
            type: "at_risk_goal",
            severity: actualProgress < expectedProgress - 40 ? "critical" : "warning",
            title: "Meta em risco",
            description: `${person.name} - ${actualProgress.toFixed(0)}% vs ${expectedProgress.toFixed(0)}% esperado`,
            createdAt: now,
          });
        }
      }

      // Sort by severity (critical first) and then by date
      return alerts.sort((a, b) => {
        if (a.severity === "critical" && b.severity !== "critical") return -1;
        if (a.severity !== "critical" && b.severity === "critical") return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: false, // Optimize: only refetch on demand or when stale, 10m is too frequent for heavy queries if not changing fast
  });
};
