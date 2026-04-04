import React from "react";
import { Card } from "@/components/ui/card";
import { Flame, ClipboardList, CheckCircle } from "lucide-react";

interface TaskStatsCardsProps {
  high: number;
  medium: number;
  low: number;
}

const stats = [
  { key: "high", icon: Flame, label: "Urgentes", border: "border-status-error/30", text: "text-status-error", bg: "from-status-error/30 to-status-error/10", glow: "hover-glow-error" },
  { key: "medium", icon: ClipboardList, label: "Média", border: "border-status-warning/30", text: "text-status-warning", bg: "from-status-warning/30 to-status-warning/10", glow: "hover-glow" },
  { key: "low", icon: CheckCircle, label: "Baixa", border: "border-status-success/30", text: "text-status-success", bg: "from-status-success/30 to-status-success/10", glow: "hover-glow-success" },
] as const;

export const TaskStatsCards = React.memo(function TaskStatsCards({ high, medium, low }: TaskStatsCardsProps) {
  const values = { high, medium, low };

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ key, icon: Icon, label, border, text, bg, glow }, i) => (
        <Card key={key} className={`p-4 glass border ${border} hover-lift cursor-pointer ${glow} transition-all duration-300 animate-fade-in group`} style={{ animationDelay: `${i * 75}ms` }}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${bg} shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg`}>
              <Icon className={`h-5 w-5 ${text} ${key === 'high' ? 'group-hover:animate-pulse' : ''}`} />
            </div>
            <div>
              <p className={`text-2xl font-display font-bold ${text}`}>{values[key]}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});
