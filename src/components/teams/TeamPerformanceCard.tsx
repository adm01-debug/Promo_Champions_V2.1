import { 
  Users, Phone, Handshake, TrendingUp, DollarSign, 
  Calendar, Activity, Target 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TeamPerformance, TeamMemberMetrics } from "@/hooks/useTeamPerformance";

interface TeamPerformanceCardProps {
  team: TeamPerformance;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function MemberRow({ member, type }: { member: TeamMemberMetrics; type: "sdr" | "closer" }) {
  const isSDR = type === "sdr";
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10 border-2 border-border">
        <AvatarImage src={member.avatar_url || undefined} />
        <AvatarFallback className={cn(
          "text-xs font-semibold",
          isSDR ? "bg-status-info/20 text-status-info" : "bg-status-success/20 text-status-success"
        )}>
          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{member.name}</span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0",
              isSDR 
                ? "border-status-info/30 text-status-info bg-status-info/10" 
                : "border-status-success/30 text-status-success bg-status-success/10"
            )}
          >
            {isSDR ? "SDR" : "Closer"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          {isSDR ? (
            <>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {member.activitiesCount} atividades
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {member.meetingsScheduled} reuniões
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(member.totalSales)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {member.completedDeals} fechados
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className={cn(
          "text-lg font-bold",
          isSDR ? "text-status-info" : "text-status-success"
        )}>
          {isSDR 
            ? `${member.meetingsScheduled}` 
            : formatCurrency(member.totalSales)
          }
        </div>
        <div className="text-[10px] text-muted-foreground">
          {isSDR ? "reuniões" : "receita"}
        </div>
      </div>
    </div>
  );
}

export function TeamPerformanceCard({ team }: TeamPerformanceCardProps) {
  const maxRevenue = 100000; // For progress visualization
  const revenueProgress = Math.min((team.totals.totalRevenue / maxRevenue) * 100, 100);

  return (
    <Card className="card-elevated hover-lift overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{team.teamName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={team.isActive ? "default" : "secondary"}
                  className={cn(
                    "text-[10px]",
                    team.isActive && "bg-status-success/20 text-status-success border-status-success/30"
                  )}
                >
                  {team.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {team.sdr ? 1 : 0} SDR + {team.closers.length} Closers
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Team Totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-status-success/10 to-status-success/5 border border-status-success/20">
            <div className="flex items-center gap-2 text-status-success mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Receita Total</span>
            </div>
            <div className="text-xl font-bold text-status-success">
              {formatCurrency(team.totals.totalRevenue)}
            </div>
            <Progress 
              value={revenueProgress} 
              className="h-1 mt-2 bg-status-success/20" 
            />
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Conversão Média</span>
            </div>
            <div className="text-xl font-bold text-primary">
              {team.totals.avgConversion.toFixed(1)}%
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {team.totals.totalDeals} deals fechados
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="flex items-center justify-around py-2 px-3 rounded-lg bg-muted/30">
          <div className="text-center">
            <div className="text-lg font-bold gradient-text">{team.totals.totalActivities}</div>
            <div className="text-[10px] text-muted-foreground">Atividades</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold gradient-text">{team.totals.totalMeetings}</div>
            <div className="text-[10px] text-muted-foreground">Reuniões</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold gradient-text">{team.totals.totalDeals}</div>
            <div className="text-[10px] text-muted-foreground">Fechados</div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Phone className="h-3 w-3" />
            SDR
          </div>
          {team.sdr ? (
            <MemberRow member={team.sdr} type="sdr" />
          ) : (
            <div className="p-3 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
              Nenhum SDR atribuído
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Handshake className="h-3 w-3" />
            Closers
          </div>
          {team.closers.length > 0 ? (
            <div className="space-y-2">
              {team.closers.map((closer) => (
                <MemberRow key={closer.id} member={closer} type="closer" />
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
              Nenhum Closer atribuído
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
