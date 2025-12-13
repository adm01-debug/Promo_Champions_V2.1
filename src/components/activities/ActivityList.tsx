import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentActivities, Activity, ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { useSalespeople } from "@/hooks/useSalespeople";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Mail, Users, Linkedin, MessageCircle, MoreHorizontal, Clock, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const activityIcons: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  other: MoreHorizontal,
};

const activityLabels: Record<ActivityType, string> = {
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Outro",
};

const outcomeLabels: Record<ActivityOutcome, { label: string; color: string }> = {
  connected: { label: "Conectou", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  no_answer: { label: "Não Atendeu", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  scheduled: { label: "Agendou", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  voicemail: { label: "Caixa Postal", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  busy: { label: "Ocupado", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  callback: { label: "Retornar", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  not_interested: { label: "Sem Interesse", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  qualified: { label: "Qualificado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

interface ActivityListProps {
  limit?: number;
  showHeader?: boolean;
}

export function ActivityList({ limit = 10, showHeader = true }: ActivityListProps) {
  const { data: activities, isLoading } = useRecentActivities(limit);
  const { data: salespeople } = useSalespeople();

  const getSalesperson = (id: string | null) => 
    salespeople?.find(sp => sp.id === id);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Log de Atividades
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      {showHeader && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Log de Atividades
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2">
            {activities?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Nenhuma atividade registrada
              </p>
            )}
            {activities?.map((activity) => {
              const Icon = activityIcons[activity.activity_type];
              const outcomeStyle = outcomeLabels[activity.outcome];
              const salesperson = getSalesperson(activity.salesperson_id);

              return (
                <div 
                  key={activity.id}
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {activityLabels[activity.activity_type]}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${outcomeStyle.color}`}>
                          {outcomeStyle.label}
                        </Badge>
                      </div>
                      {activity.contact_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.contact_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                      {activity.duration_minutes && (
                        <p className="text-[10px] text-muted-foreground">
                          {activity.duration_minutes} min
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {activity.notes && (
                    <p className="text-xs text-muted-foreground pl-11 line-clamp-2">
                      {activity.notes}
                    </p>
                  )}

                  {salesperson && (
                    <div className="flex items-center gap-2 pl-11">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={salesperson.avatar_url || undefined} />
                        <AvatarFallback className="text-[8px]">
                          {salesperson.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-muted-foreground">
                        {salesperson.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
