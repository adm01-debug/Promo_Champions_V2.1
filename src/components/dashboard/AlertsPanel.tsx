import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Alert {
  type: "warning" | "info" | "success";
  message: string;
}

export const AlertsPanel = () => {
  const { salesperson } = useAuth();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["dashboard-alerts", salesperson?.id],
    queryFn: async (): Promise<Alert[]> => {
      const result: Alert[] = [];

      // Check stagnant deals (no update in 5+ days)
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const { count: stagnantCount } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .not("status", "in", '("completed","lost","ganho","perdido")')
        .lt("updated_at", fiveDaysAgo.toISOString());

      if (stagnantCount && stagnantCount > 0) {
        result.push({
          type: "warning",
          message: `${stagnantCount} deal${stagnantCount > 1 ? "s" : ""} sem atividade há 5+ dias`,
        });
      }

      // Check goal progress
      if (salesperson?.id) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const [goalResult, salesResult] = await Promise.all([
          supabase
            .from("sales_goals")
            .select("goal_amount")
            .eq("salesperson_id", salesperson.id)
            .eq("month", new Date().toISOString().slice(0, 7) + "-01")
            .maybeSingle(),
          supabase
            .from("sales")
            .select("amount")
            .eq("salesperson_id", salesperson.id)
            .eq("status", "completed")
            .gte("created_at", monthStart)
            .lte("created_at", monthEnd),
        ]);

        const goalAmount = goalResult.data?.goal_amount || 0;
        const totalSales = salesResult.data?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

        if (goalAmount > 0) {
          const pct = (totalSales / goalAmount) * 100;
          if (pct >= 85) {
            result.push({ type: "success", message: `Meta ${pct.toFixed(0)}% atingida! 🔥` });
          } else if (pct >= 50) {
            result.push({ type: "info", message: `Meta ${pct.toFixed(0)}% atingida` });
          } else if (pct < 30 && now.getDate() > 15) {
            result.push({ type: "warning", message: `Meta apenas ${pct.toFixed(0)}% — hora de acelerar!` });
          }
        }
      }

      // Check overdue tasks
      const { count: overdueTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .lt("due_date", new Date().toISOString().split("T")[0]);

      if (overdueTasks && overdueTasks > 0) {
        result.push({
          type: "warning",
          message: `${overdueTasks} tarefa${overdueTasks > 1 ? "s" : ""} atrasada${overdueTasks > 1 ? "s" : ""}`,
        });
      }

      return result;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} className="h-9 w-full rounded-lg" />)
        ) : alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                alert.type === "warning"
                  ? "bg-warning/10 border border-warning/20"
                  : alert.type === "success"
                  ? "bg-success/10 border border-success/20"
                  : "bg-primary/10 border border-primary/20"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-success" />
              ) : (
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    alert.type === "warning" ? "text-warning" : "text-primary"
                  }`}
                />
              )}
              <p className="text-xs">{alert.message}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-6 w-6 text-success mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">
              Tudo em dia! Nenhum alerta.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
