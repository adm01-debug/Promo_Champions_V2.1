import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile } from "lucide-react";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Line, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useSentimentTrend } from "@/hooks/win-loss/useSentimentTrend";

export const SentimentTrendChart = memo(function SentimentTrendChart() {
  const { data = [], isLoading } = useSentimentTrend();

  if (isLoading) return <Skeleton className="h-[260px] w-full" />;
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Smile className="h-4 w-4 text-primary" aria-hidden />
          Sentimento × Win Rate por trimestre
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[-1, 1]} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="avgSentiment" fill="hsl(var(--primary) / 0.6)" name="Sentimento médio" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="hsl(160 84% 39%)" strokeWidth={2.5} dot={{ r: 3 }} name="Win rate" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
