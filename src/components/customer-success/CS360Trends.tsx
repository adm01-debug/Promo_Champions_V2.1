import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { formatBRL } from "./cs360Helpers";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface EvolutionData {
  name: string;
  ltv: number;
  ticket: number;
}

interface CS360TrendsProps {
  evolutionData: EvolutionData[];
}

export function CS360Trends({ evolutionData }: CS360TrendsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Evolução do LTV (Receita Acumulada)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `R$${val / 1000}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(val: ValueType | undefined) => val !== undefined ? [formatBRL(Number(val)), "LTV"] : ["", "LTV"]} 
              />
              <Bar dataKey="ltv" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            Ticket Médio por Período
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `R$${val}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                formatter={(val: ValueType | undefined) => val !== undefined ? [formatBRL(Number(val)), "Ticket Médio"] : ["", "Ticket Médio"]} 
              />
              <Line type="monotone" dataKey="ticket" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--success))" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
