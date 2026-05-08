import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WinRateRow } from "@/hooks/revenue/useRevenueIntelligenceHub";

interface Props {
  data: WinRateRow[];
  dimension: "category" | "source" | "product";
  onChangeDimension: (d: "category" | "source" | "product") => void;
}

export const WinRateBreakdownChart: FC<Props> = ({ data, dimension, onChangeDimension }) => {
  const top = data.slice(0, 10);

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Win Rate Breakdown</CardTitle>
          <Select value={dimension} onValueChange={(v) => onChangeDimension(v as "category" | "source" | "product")}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Por Categoria</SelectItem>
              <SelectItem value="source">Por Origem</SelectItem>
              <SelectItem value="product">Por Produto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Sem dados suficientes.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="segment" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: any, name: any) => name === "win_rate" ? `${v}%` : v}
              />
              <Bar dataKey="win_rate" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
