import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Phone, Mail, Calendar, MessageCircle, Linkedin, Users } from "lucide-react";
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
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Atividades por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma atividade registrada</p>
            </div>
          ) : (
            data.map((sp, index) => (
              <div
                key={sp.salesperson_id}
                className="p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/60 transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-border/40">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {sp.salesperson_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 text-xs">🏆</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{sp.salesperson_name}</span>
                      <Badge className={`${roleLabels[sp.role]?.color || ''} text-[10px] px-1.5`}>
                        {roleLabels[sp.role]?.label || sp.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sp.avg_activities_per_day.toFixed(1)} atividades/dia
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{sp.total_activities}</div>
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
                  <div className="flex items-center gap-1 text-xs">
                    <Phone className="h-3 w-3 text-status-success" />
                    <span className="text-muted-foreground">{sp.calls}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3 text-status-info" />
                    <span className="text-muted-foreground">{sp.emails}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3 text-status-purple" />
                    <span className="text-muted-foreground">{sp.meetings}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Linkedin className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{sp.linkedin}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <MessageCircle className="h-3 w-3 text-accent" />
                    <span className="text-muted-foreground">{sp.whatsapp}</span>
                  </div>
                </div>

                {/* Results Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-xs font-medium text-status-success">
                      {sp.connection_rate.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Conexão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-status-info">
                      {sp.scheduling_rate.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Agendamento</div>
                  </div>
                  <div className="text-center">
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
