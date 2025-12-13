import { Card, CardContent } from "@/components/ui/card";
import { useActivityStats } from "@/hooks/useActivities";
import { Phone, Mail, Users, CheckCircle, CalendarCheck, Activity } from "lucide-react";

export function ActivityStats() {
  const { data: stats } = useActivityStats();

  const statItems = [
    { 
      label: "Total Hoje", 
      value: stats?.totalToday ?? 0, 
      icon: Activity,
      color: "text-primary"
    },
    { 
      label: "Ligações", 
      value: stats?.callsToday ?? 0, 
      icon: Phone,
      color: "text-status-info"
    },
    { 
      label: "E-mails", 
      value: stats?.emailsToday ?? 0, 
      icon: Mail,
      color: "text-streak"
    },
    { 
      label: "Reuniões", 
      value: stats?.meetingsToday ?? 0, 
      icon: Users,
      color: "text-accent"
    },
    { 
      label: "Conectou", 
      value: stats?.connectedToday ?? 0, 
      icon: CheckCircle,
      color: "text-status-success"
    },
    { 
      label: "Agendou", 
      value: stats?.scheduledToday ?? 0, 
      icon: CalendarCheck,
      color: "text-status-success"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const isFirst = index === 0;
        return (
          <Card 
            key={item.label} 
            className={`glass border-border/40 dark:border-glow card-elevated transition-all duration-300 hover-lift ${isFirst ? 'ring-1 ring-primary/20' : ''}`}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${isFirst ? 'bg-gradient-to-br from-primary/30 to-accent/20' : 'bg-muted/50 group-hover:bg-muted/70'}`}>
                <Icon className={`h-4 w-4 ${isFirst ? 'gradient-primary' : item.color}`} />
              </div>
              <div>
                <p className={`text-lg font-display font-bold ${isFirst ? 'gradient-text' : ''}`}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
