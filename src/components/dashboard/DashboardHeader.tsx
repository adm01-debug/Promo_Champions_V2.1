import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Target } from "lucide-react";

export const DashboardHeader = () => {
  const { salesperson } = useAuth();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  // Fetch actionable insight
  const { data: insight } = useQuery({
    queryKey: ["dashboard-insight", salesperson?.id],
    queryFn: async () => {
      if (!salesperson?.id) return null;

      // Count deals close to closing (proposal/negotiation stage)
      const { count: hotDeals } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("salesperson_id", salesperson.id)
        .in("status", ["proposta", "negociação", "negotiation", "proposal"]);

      // Count overdue/stagnant deals (no update in 7+ days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: stagnantDeals } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("salesperson_id", salesperson.id)
        .not("status", "in", '("ganho","perdido","won","lost")')
        .lt("updated_at", sevenDaysAgo.toISOString());

      return { hotDeals: hotDeals || 0, stagnantDeals: stagnantDeals || 0 };
    },
    enabled: !!salesperson?.id,
    staleTime: 1000 * 60 * 5,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = salesperson?.name?.split(" ")[0] || "Usuário";

  const getInsightText = () => {
    if (!insight) return null;
    if (insight.hotDeals > 0) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-status-warning" />
          Você tem <span className="font-semibold text-foreground">{insight.hotDeals} deal{insight.hotDeals > 1 ? "s" : ""}</span> próximo{insight.hotDeals > 1 ? "s" : ""} de fechar!
        </span>
      );
    }
    if (insight.stagnantDeals > 0) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Target className="h-4 w-4 text-destructive" />
          <span className="font-semibold text-foreground">{insight.stagnantDeals} deal{insight.stagnantDeals > 1 ? "s" : ""}</span> parado{insight.stagnantDeals > 1 ? "s" : ""} há 7+ dias — hora de agir!
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground capitalize">{today}</p>
        {getInsightText()}
      </div>
    </div>
  );
};
