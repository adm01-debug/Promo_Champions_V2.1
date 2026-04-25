import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AutoTestJobStatusCard() {
  const { data } = useQuery({
    queryKey: ["integration-autotest-jobs", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_autotest_jobs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as {
        started_at: string;
        finished_at: string | null;
        status: string;
        total: number | null;
        succeeded: number | null;
        failed: number | null;
      } | null;
    },
  });

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <Activity className="h-4 w-4 text-primary" /> Última execução
        </CardTitle>
        <CardDescription>Resultado do job de auto-teste mais recente.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        {!data ? (
          <p className="text-muted-foreground">Nenhuma execução registrada.</p>
        ) : (
          <>
            <p>
              <span className="text-muted-foreground">Início: </span>
              {formatDistanceToNow(new Date(data.started_at), { addSuffix: true, locale: ptBR })}
            </p>
            <p>
              <span className="text-muted-foreground">Status: </span>
              {data.status}
            </p>
            <p>
              <span className="text-muted-foreground">Resultados: </span>
              {data.succeeded ?? 0} ok / {data.failed ?? 0} falhas (de {data.total ?? 0})
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
