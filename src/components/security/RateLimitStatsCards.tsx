import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, BarChart3, Shield } from "lucide-react";

interface RateLimitStatsCardsProps {
  hourlyTotal: number;
  hourlyBlocked: number;
  dailyTotal: number;
  dailyBlocked: number;
}

const STATS_CONFIG = [
  { key: "hourlyTotal", icon: Activity, label: "Requisições (1h)", color: "text-info", bg: "bg-info/10" },
  { key: "hourlyBlocked", icon: AlertTriangle, label: "Bloqueados (1h)", color: "text-destructive", bg: "bg-destructive/10" },
  { key: "dailyTotal", icon: BarChart3, label: "Total (24h)", color: "text-status-success", bg: "bg-status-success/10" },
  { key: "dailyBlocked", icon: Shield, label: "Bloqueados (24h)", color: "text-status-warning", bg: "bg-status-warning/10" },
] as const;

export const RateLimitStatsCards = React.memo(function RateLimitStatsCards(props: RateLimitStatsCardsProps) {
  const values = { hourlyTotal: props.hourlyTotal, hourlyBlocked: props.hourlyBlocked, dailyTotal: props.dailyTotal, dailyBlocked: props.dailyBlocked };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STATS_CONFIG.map(({ key, icon: Icon, label, color, bg }) => (
        <Card key={key}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${key.includes('Blocked') ? color : ''}`}>{values[key]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
