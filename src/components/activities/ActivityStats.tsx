import { Card, CardContent } from "@/components/ui/card";
import { useActivityStats } from "@/hooks/useActivities";
import { Phone, Mail, Users, CheckCircle, CalendarCheck, Activity, Linkedin, MessageCircle, FileText } from "lucide-react";

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
      label: "LinkedIn", 
      value: stats?.byType.linkedin ?? 0, 
      icon: Linkedin,
      color: "text-status-info"
    },
    { 
      label: "WhatsApp", 
      value: stats?.byType.whatsapp ?? 0, 
      icon: MessageCircle,
      color: "text-status-success"
    },
    { 
      label: "Notas", 
      value: stats?.byType.note ?? 0, 
      icon: FileText,
      color: "text-muted-foreground"
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const isFirst = index === 0;
        return (
          <Card 
            key={item.label} 
            className={`glass border-border/40 dark:border-glow card-elevated transition-all duration-300 group ${
              isFirst 
                ? 'ring-1 ring-primary/30 hover-glow shadow-md shadow-primary/10' 
                : 'hover-lift'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isFirst 
                  ? 'bg-gradient-to-br from-primary/30 to-accent/20 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20' 
                  : 'bg-muted/50 group-hover:bg-muted/70'
              }`}>
                <Icon className={`h-4 w-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${isFirst ? 'text-primary' : item.color}`} />
              </div>
              <div>
                <p className={`text-lg font-display font-bold transition-colors ${isFirst ? 'gradient-text' : 'group-hover:text-primary'}`}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
