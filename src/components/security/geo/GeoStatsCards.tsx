import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertTriangle, Shield, Activity } from "lucide-react";

interface GeoStatsCardsProps {
  activeCount: number;
  inactiveCount: number;
  blockedAccessCount: number;
  allowedAccessCount: number;
}

export const GeoStatsCards = React.memo(function GeoStatsCards({ activeCount, inactiveCount, blockedAccessCount, allowedAccessCount }: GeoStatsCardsProps) {
  const stats = [
    { label: "Países Permitidos", value: activeCount, icon: Check, colorClass: "emerald" },
    { label: "Desativados", value: inactiveCount, icon: AlertTriangle, colorClass: "amber" },
    { label: "Acessos Bloqueados", value: blockedAccessCount, icon: Shield, colorClass: "destructive" },
    { label: "Acessos Permitidos", value: allowedAccessCount, icon: Activity, colorClass: "blue" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isDestructive = stat.colorClass === "destructive";
        return (
          <Card key={stat.label} className={`bg-gradient-to-br ${isDestructive ? 'from-destructive/10 to-destructive/5 border-destructive/20' : `from-${stat.colorClass}-500/10 to-${stat.colorClass}-600/5 border-${stat.colorClass}-500/20`}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${isDestructive ? 'text-destructive' : `text-${stat.colorClass}-600`}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${isDestructive ? 'bg-destructive/10' : `bg-${stat.colorClass}-500/10`}`}>
                  <Icon className={`h-6 w-6 ${isDestructive ? 'text-destructive' : `text-${stat.colorClass}-600`}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
