import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  onRun: () => void;
  isRunning?: boolean;
}

export function WinLossLastRunCard({ onRun, isRunning }: Props) {
  const { data } = useQuery({
    queryKey: ["wl-last-run"],
    queryFn: async () => {
      const { data: last } = await supabase
        .from("win_loss_analyses")
        .select("analyzed_at")
        .order("analyzed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { count } = await supabase
        .from("win_loss_analyses")
        .select("id", { count: "exact", head: true });
      const { count: patternsCount } = await supabase
        .from("win_loss_patterns")
        .select("id", { count: "exact", head: true });
      return {
        lastAt: last?.analyzed_at as string | undefined,
        total: count ?? 0,
        patterns: patternsCount ?? 0,
      };
    },
    staleTime: 60_000,
  });

  const ago = data?.lastAt
    ? formatDistanceToNow(new Date(data.lastAt), { addSuffix: true, locale: ptBR })
    : "nunca";

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 flex flex-wrap items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <History className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Última análise</p>
          <p className="text-sm font-medium">
            {ago} · {data?.total ?? 0} deals · {data?.patterns ?? 0} padrões
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onRun} disabled={isRunning}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRunning ? "animate-spin" : ""}`} />
          Atualizar agora
        </Button>
      </CardContent>
    </Card>
  );
}
