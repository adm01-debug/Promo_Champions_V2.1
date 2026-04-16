import React, { FC, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { subDays, format } from "date-fns";

interface ActivityChartProps {
  userId?: string;
  timeRange?: "week" | "month" | "quarter";
}

const TYPE_COLORS: Record<string, string> = {
  call: "hsl(var(--primary))",
  email: "hsl(262, 60%, 65%)",
  meeting: "hsl(var(--success))",
  whatsapp: "hsl(142, 70%, 45%)",
  linkedin: "hsl(210, 80%, 55%)",
  follow_up: "hsl(var(--warning))",
};

const TYPE_LABELS: Record<string, string> = {
  call: "Ligações",
  email: "Emails",
  meeting: "Reuniões",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  follow_up: "Follow-ups",
};

export const ActivityChart: FC<ActivityChartProps> = React.memo(({
  userId,
  timeRange = "month",
}) => {
  const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;

  const { data, isLoading } = useQuery({
    queryKey: ["activity-chart", userId, timeRange],
    queryFn: async () => {
      const since = subDays(new Date(), days);
      let query = supabase
        .from("activities")
        .select("activity_type, created_at")
        .gte("created_at", since.toISOString());

      if (userId) query = query.eq("salesperson_id", userId);

      const { data: activities, error } = await query;
      if (error) throw error;

      // Group by day
      const bucketSize = days <= 7 ? 1 : days <= 30 ? 1 : 7;
      const buckets: Record<string, Record<string, number>> = {};

      for (let i = 0; i < days; i += bucketSize) {
        const d = subDays(new Date(), days - i);
        const key = format(d, "dd/MM");
        buckets[key] = {};
      }

      (activities || []).forEach((act) => {
        const d = new Date(act.created_at);
        const key = format(d, "dd/MM");
        if (!buckets[key]) buckets[key] = {};
        const type = act.activity_type || "other";
        buckets[key][type] = (buckets[key][type] || 0) + 1;
      });

      return Object.entries(buckets).map(([date, types]) => ({
        date,
        ...types,
      }));
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    (data || []).forEach((d) => {
      Object.keys(d).forEach((k) => {
        if (k !== "date") types.add(k);
      });
    });
    return types;
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Atividades por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 && allTypes.size > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value: string) => TYPE_LABELS[value] || value}
              />
              {Array.from(allTypes).map((type, i) => (
                <Bar
                  key={type}
                  dataKey={type}
                  name={type}
                  stackId="activities"
                  fill={TYPE_COLORS[type] || `hsl(${i * 50}, 60%, 55%)`}
                  radius={i === allTypes.size - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Sem atividades no período</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ActivityChart.displayName = "ActivityChart";
