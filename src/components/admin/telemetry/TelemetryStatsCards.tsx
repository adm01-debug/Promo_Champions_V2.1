import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, Database, Zap } from "lucide-react";

interface TelemetryStatsCardsProps {
  verySlow: number;
  slow: number;
  errors: number;
  avgDuration: string;
}

export const TelemetryStatsCards = React.memo(function TelemetryStatsCards({ verySlow, slow, errors, avgDuration }: TelemetryStatsCardsProps) {
  const cards = [
    { icon: AlertTriangle, iconColor: "text-destructive", bg: "bg-destructive/10", value: verySlow, label: "Muito Lentas (>8s)" },
    { icon: Clock, iconColor: "text-warning", bg: "bg-warning/10", value: slow, label: "Lentas (>3s)" },
    { icon: Zap, iconColor: "text-destructive", bg: "bg-destructive/10", value: errors, label: "Erros" },
    { icon: Database, iconColor: "text-primary", bg: "bg-primary/10", value: avgDuration, label: "Média de duração" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, iconColor, bg, value, label }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${iconColor}`} /></div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
