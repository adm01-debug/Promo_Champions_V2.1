import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

interface Row {
  jobname: string;
  alerts: number;
  stalled: number;
  failed: number;
}

async function fetchBreakdown(): Promise<Row[]> {
  const { data, error } = await supabase.rpc("fn_admin_cron_alert_breakdown" as never);
  if (error) throw error;
  return (data ?? []) as Row[];
}

export function CronAlertBreakdownChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "cron-alert-breakdown"],
    queryFn: fetchBreakdown,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          Alertas por schedule (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum alerta nas últimas 24h ✅</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 12, top: 8, bottom: 8 }}>
              <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                type="category"
                dataKey="jobname"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={160}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="stalled" stackId="a" fill="hsl(38 92% 50%)" name="Travados" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failed" stackId="a" fill="hsl(var(--destructive))" name="Falhas" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
