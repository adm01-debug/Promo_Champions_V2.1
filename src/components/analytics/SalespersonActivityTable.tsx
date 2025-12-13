import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Users, Crown, Medal } from "lucide-react";
import { SalespersonActivityData } from "@/hooks/useSalespersonActivityReport";

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
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Atividades por Vendedor</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl">
              <div className="p-4 rounded-full bg-muted/20 mb-3">
                <Users className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-sm">Nenhuma atividade registrada</p>
            </div>
          ) : (
            data.map((sp, index) => (
              <div
                key={sp.salesperson_id}
                className={`p-4 rounded-xl glass hover-lift transition-all animate-fade-in group ${
                  index === 0 ? "ring-1 ring-rank-gold/30 hover-glow-gold" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Avatar className={`h-10 w-10 border-2 transition-all ${
                      index === 0 
                        ? "border-rank-gold shadow-lg shadow-rank-gold/20" 
                        : index === 1 
                          ? "border-rank-silver" 
                          : index === 2 
                            ? "border-rank-bronze" 
                            : "border-border/40"
                    }`}>
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-bold">
                        {sp.salesperson_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-gold to-rank-gold/80 rounded-full p-1 shadow-lg">
                        <Crown className="h-3 w-3 text-background" />
                      </div>
                    )}
                    {index === 1 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-silver to-rank-silver/80 rounded-full p-1">
                        <Medal className="h-3 w-3 text-background" />
                      </div>
                    )}
                    {index === 2 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-bronze to-rank-bronze/80 rounded-full p-1">
                        <Medal className="h-3 w-3 text-background" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm truncate ${index < 3 ? "gradient-text" : ""}`}>
                        {sp.salesperson_name}
                      </span>
                      <Badge className={`${roleLabels[sp.role]?.color || ''} text-[10px] px-1.5`}>
                        {roleLabels[sp.role]?.label || sp.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sp.avg_activities_per_day.toFixed(1)} atividades/dia
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold font-display ${
                      index === 0 ? "text-rank-gold" : "gradient-text"
                    }`}>
                      {sp.total_activities}
                    </div>
                    <div className="text-[10px] text-muted-foreground">total</div>
                  </div>
                </div>

                {/* Activity Volume Bar */}
                <div className="mb-3">
                  <Progress 
                    value={(sp.total_activities / maxActivities) * 100} 
                    className="h-1.5"
                  />
                </div>

                {/* Activity Types */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <div className="flex items-center gap-1 text-xs group-hover:scale-105 transition-transform">
                    <Phone className="h-3 w-3 text-status-success" />
                    <span className="text-muted-foreground">{sp.calls}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs group-hover:scale-105 transition-transform">
                    <Mail className="h-3 w-3 text-status-info" />
                    <span className="text-muted-foreground">{sp.emails}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs group-hover:scale-105 transition-transform">
                    <Calendar className="h-3 w-3 text-status-purple" />
                    <span className="text-muted-foreground">{sp.meetings}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs group-hover:scale-105 transition-transform">
                    <Linkedin className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{sp.linkedin}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs group-hover:scale-105 transition-transform">
                    <MessageCircle className="h-3 w-3 text-accent" />
                    <span className="text-muted-foreground">{sp.whatsapp}</span>
                  </div>
                </div>

                {/* Results Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                  <div className="text-center p-1.5 rounded-lg bg-status-success/5 group-hover:bg-status-success/10 transition-colors">
                    <div className="text-xs font-medium text-status-success">
                      {sp.connection_rate.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Conexão</div>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-status-info/5 group-hover:bg-status-info/10 transition-colors">
                    <div className="text-xs font-medium text-status-info">
                      {sp.scheduling_rate.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Agendamento</div>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-status-purple/5 group-hover:bg-status-purple/10 transition-colors">
                    <div className="text-xs font-medium text-status-purple">
                      {sp.qualification_rate.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Qualificação</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
