import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function ActivitiesTodayWidget() {
  const { salesperson } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["activities-today-widget", salesperson?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, activity_type, outcome")
        .eq("salesperson_id", salesperson!.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salesperson?.id,
  });

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const total = data?.length ?? 0;
  const positive = data?.filter(a => a.outcome === "connected" || a.outcome === "qualified" || a.outcome === "scheduled").length ?? 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-rank-gold" />
          Atividades Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{total}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {positive} com resultado positivo
        </p>
      </CardContent>
    </Card>
  );
}
