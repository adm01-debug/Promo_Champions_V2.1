import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Users, Crown, Medal, TrendingUp, Activity } from "lucide-react";
import { SalespersonActivityData } from "@/hooks/sales/useSalespersonActivityReport";
import { cn } from "@/lib/utils";

interface SalespersonActivityTableProps {
  data: SalespersonActivityData[];
}

const roleLabels: Record<string, { label: string; color: string }> = {
  sdr: { label: "SDR", color: "bg-status-info/20 text-status-info" },
  closer: { label: "Closer", color: "bg-status-purple/20 text-status-purple" },
  hybrid: { label: "Híbrido", color: "bg-status-success/20 text-status-success" },
};

export function SalespersonActivityTable({ data }: SalespersonActivityTableProps) {
  const maxActivities = Math.max(...data.map(d => d.total_activities), 1);

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Atividades por Vendedor</span>
          {data.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">
              {data.length} vendedores
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-2">
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl animate-fade-in">
                <div className="p-4 rounded-full bg-gradient-to-br from-muted/20 to-muted/5 mb-3 shadow-lg">
                  <Activity className="h-10 w-10 opacity-50 animate-pulse" />
                </div>
                <p className="text-sm font-medium gradient-text">Nenhuma atividade registrada</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Registre atividades para ver o ranking</p>
              </div>
            ) : (
              data.map((sp, index) => (
                <div
                  key={sp.salesperson_id}
                  className={cn(
                    "p-4 rounded-xl glass hover-lift transition-all animate-fade-in group",
                    index === 0 && "ring-1 ring-rank-gold/30 hover-glow-gold",
                    index === 1 && "ring-1 ring-rank-silver/20",
                    index === 2 && "ring-1 ring-rank-bronze/20"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <Avatar className={cn(
                        "h-11 w-11 border-2 transition-all group-hover:scale-105 shadow-md",
                        index === 0 && "border-rank-gold shadow-rank-gold/20",
                        index === 1 && "border-rank-silver shadow-rank-silver/20",
                        index === 2 && "border-rank-bronze shadow-rank-bronze/20",
                        index > 2 && "border-border/40"
                      )}>
                        <AvatarImage src={sp.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-bold">
                          {sp.salesperson_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-gold to-rank-gold/80 rounded-full p-1 shadow-lg animate-float">
                          <Crown className="h-3 w-3 text-background" />
                        </div>
                      )}
                      {index === 1 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-silver to-rank-silver/80 rounded-full p-1 shadow-md">
                          <Medal className="h-3 w-3 text-background" />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-bronze to-rank-bronze/80 rounded-full p-1 shadow-md">
                          <Medal className="h-3 w-3 text-background" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm truncate font-display",
                          index < 3 && "gradient-text"
                        )}>
                          {sp.salesperson_name}
                        </span>
                        <Badge className={cn(
                          roleLabels[sp.role]?.color || '',
                          "text-[10px] px-1.5 shadow-sm"
                        )}>
                          {roleLabels[sp.role]?.label || sp.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <TrendingUp className="h-3 w-3" />
                        <span>{sp.avg_activities_per_day.toFixed(1)} atividades/dia</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-xl font-bold font-display group-hover:scale-110 transition-transform",
                        index === 0 ? "text-rank-gold" : "gradient-text"
                      )}>
                        {sp.total_activities}
                      </div>
                      <div className="text-[10px] text-muted-foreground">total</div>
                    </div>
                  </div>

                  {/* Activity Volume Bar */}
                  <div className="mb-3">
                    <Progress 
                      value={(sp.total_activities / maxActivities) * 100} 
                      className="h-1.5 shadow-inner"
                    />
                  </div>

                  {/* Activity Types */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-status-success/5 group-hover:bg-status-success/10 transition-all group-hover:scale-105">
                      <Phone className="h-3.5 w-3.5 text-status-success" />
                      <span className="font-medium text-muted-foreground">{sp.calls}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-status-info/5 group-hover:bg-status-info/10 transition-all group-hover:scale-105">
                      <Mail className="h-3.5 w-3.5 text-status-info" />
                      <span className="font-medium text-muted-foreground">{sp.emails}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-status-purple/5 group-hover:bg-status-purple/10 transition-all group-hover:scale-105">
                      <Calendar className="h-3.5 w-3.5 text-status-purple" />
                      <span className="font-medium text-muted-foreground">{sp.meetings}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-all group-hover:scale-105">
                      <Linkedin className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-muted-foreground">{sp.linkedin}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-accent/10 group-hover:bg-accent/20 transition-all group-hover:scale-105">
                      <MessageCircle className="h-3.5 w-3.5 text-accent" />
                      <span className="font-medium text-muted-foreground">{sp.whatsapp}</span>
                    </div>
                  </div>

                  {/* Results Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/30">
                    <div className="text-center p-2 rounded-lg bg-status-success/5 group-hover:bg-status-success/15 transition-all hover:scale-105 cursor-default shadow-sm">
                      <div className="text-sm font-bold text-status-success font-display">
                        {sp.connection_rate.toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">Conexão</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-status-info/5 group-hover:bg-status-info/15 transition-all hover:scale-105 cursor-default shadow-sm">
                      <div className="text-sm font-bold text-status-info font-display">
                        {sp.scheduling_rate.toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">Agendamento</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-status-purple/5 group-hover:bg-status-purple/15 transition-all hover:scale-105 cursor-default shadow-sm">
                      <div className="text-sm font-bold text-status-purple font-display">
                        {sp.qualification_rate.toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">Qualificação</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
