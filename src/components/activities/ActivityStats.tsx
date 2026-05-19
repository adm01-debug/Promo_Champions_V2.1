import { Card, CardContent } from "@/components/ui/card";
import { useActivityStats, useActivityGoals } from "@/hooks/activities/useActivities";
import { Phone, Mail, Users, CheckCircle, CalendarCheck, Activity, Linkedin, MessageCircle, FileText, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function ActivityStats() {
  const { data: stats } = useActivityStats();
  
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-sp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('salespeople').select('id').eq('auth_user_id', user.id).maybeSingle();
      return data;
    }
  });

  const { data: goals } = useActivityGoals(currentUser?.id);

  const statItems = [
    { 
      label: "Total Hoje", 
      value: stats?.totalToday ?? 0, 
      icon: Activity,
      color: "text-primary",
      goal: null
    },
    { 
      label: "Ligações", 
      value: stats?.callsToday ?? 0, 
      icon: Phone,
      color: "text-status-info",
      goal: goals?.calls_goal
    },
    { 
      label: "E-mails", 
      value: stats?.emailsToday ?? 0, 
      icon: Mail,
      color: "text-streak",
      goal: goals?.emails_goal
    },
    { 
      label: "Reuniões", 
      value: stats?.meetingsToday ?? 0, 
      icon: Users,
      color: "text-accent",
      goal: goals?.meetings_goal
    },
    { 
      label: "LinkedIn", 
      value: stats?.linkedinToday ?? 0, 
      icon: Linkedin,
      color: "text-status-info",
      goal: goals?.linkedin_goal
    },
    { 
      label: "WhatsApp", 
      value: stats?.whatsappToday ?? 0, 
      icon: MessageCircle,
      color: "text-status-success",
      goal: goals?.whatsapp_goal
    },
    { 
      label: "Notas", 
      value: stats?.notesToday ?? 0, 
      icon: FileText,
      color: "text-muted-foreground",
      goal: null
    },
    { 
      label: "Conectou", 
      value: stats?.connectedToday ?? 0, 
      icon: CheckCircle,
      color: "text-status-success",
      goal: null
    },
    { 
      label: "Agendou", 
      value: stats?.scheduledToday ?? 0, 
      icon: CalendarCheck,
      color: "text-status-success",
      goal: null
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const isFirst = index === 0;
        const progress = item.goal ? Math.min((item.value / item.goal) * 100, 100) : null;
        
        return (
          <Card 
            key={item.label} 
            className={`glass border-border/40 dark:border-glow card-elevated transition-all duration-300 group flex flex-col justify-between overflow-hidden ${
              isFirst 
                ? 'ring-1 ring-primary/30 hover-glow shadow-md shadow-primary/10' 
                : 'hover-lift'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isFirst 
                    ? 'bg-gradient-to-br from-primary/30 to-accent/20 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20' 
                    : 'bg-muted/50 group-hover:bg-muted/70'
                }`}>
                  <Icon className={`h-4 w-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${isFirst ? 'text-primary' : item.color}`} />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className={`text-lg font-display font-bold transition-colors ${isFirst ? 'gradient-text' : 'group-hover:text-primary'}`}>{item.value}</p>
                    {item.goal && (
                      <span className="text-[9px] text-muted-foreground font-black opacity-50">/ {item.goal}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                </div>
              </div>
              
              {progress !== null && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter text-muted-foreground">
                    <span>Meta</span>
                    <span className={progress >= 100 ? "text-status-success" : ""}>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className={`h-1 ${progress >= 100 ? "bg-status-success/20" : "bg-primary/20"}`} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
