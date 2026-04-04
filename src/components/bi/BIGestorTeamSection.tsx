import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, Crown, AlertTriangle, Sparkles, Users } from "lucide-react";

interface PerformerData {
  id: string;
  name: string;
  avatar_url: string | null;
  revenue: number;
  deals: number;
  goalProgress: number;
  activities: number;
}

interface SalespersonPerf {
  id: string;
  name: string;
  avatar_url: string | null;
  revenue: number;
  deals: number;
  goalProgress: number;
  activities: number;
}

interface BIGestorTeamSectionProps {
  topPerformers: PerformerData[];
  underperformers: PerformerData[];
  salespeoplePerformance: SalespersonPerf[];
  formatCurrency: (value: number) => string;
}

export const BIGestorTeamSection = React.memo(function BIGestorTeamSection({ topPerformers, underperformers, salespeoplePerformance, formatCurrency }: BIGestorTeamSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <div className="p-2 rounded-lg rank-gold"><Trophy className="h-4 w-4 text-rank-gold-foreground" /></div>
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((sp, idx) => (
                  <div key={sp.id} className={cn("flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover-lift-sm",
                    idx === 0 ? "bg-gradient-to-r from-rank-gold/10 to-transparent border-2 border-rank-gold/30" :
                    idx === 1 ? "bg-gradient-to-r from-rank-silver/10 to-transparent border border-rank-silver/30" :
                    idx === 2 ? "bg-gradient-to-r from-rank-bronze/10 to-transparent border border-rank-bronze/30" : "glass"
                  )}>
                    <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg",
                      idx === 0 ? "rank-gold" : idx === 1 ? "rank-silver" : idx === 2 ? "rank-bronze" : "bg-muted text-muted-foreground"
                    )}>{idx === 0 ? <Crown className="h-4 w-4" /> : idx + 1}</span>
                    <Avatar className="h-9 w-9 ring-2 ring-border"><AvatarImage src={sp.avatar_url || undefined} /><AvatarFallback className="text-xs font-bold">{sp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold truncate">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">{sp.deals} vendas • {sp.goalProgress.toFixed(0)}% da meta</p>
                    </div>
                    <span className="font-black gradient-text-success">{formatCurrency(sp.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground"><div className="text-center"><Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" /><p>Nenhum vendedor atingiu 100% da meta</p></div></div>
            )}
          </CardContent>
        </Card>

        {/* Underperformers */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: "650ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-warning to-warning/80"><AlertTriangle className="h-4 w-4 text-warning-foreground" /></div>
              Requerem Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {underperformers.length > 0 ? (
              <div className="space-y-3">
                {underperformers.map((sp) => (
                  <div key={sp.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-warning/5 to-transparent border border-warning/20 hover-lift-sm">
                    <Avatar className="h-9 w-9 ring-2 ring-warning/30"><AvatarImage src={sp.avatar_url || undefined} /><AvatarFallback className="text-xs font-bold">{sp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold truncate">{sp.name}</p>
                      <div className="flex items-center gap-2"><Progress value={sp.goalProgress} className="h-1.5 flex-1" /><span className="text-xs text-warning font-bold">{sp.goalProgress.toFixed(0)}%</span></div>
                    </div>
                    <div className="text-right"><p className="font-bold">{formatCurrency(sp.revenue)}</p><p className="text-xs text-muted-foreground">{sp.activities} atividades</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground"><div className="text-center"><Sparkles className="h-12 w-12 mx-auto mb-2 text-success/50" /><p className="text-success">Todos estão performando bem!</p></div></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="glass-card animate-slide-up" style={{ animationDelay: "700ms" }}>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow"><Users className="h-4 w-4 text-primary-foreground" /></div>
            Performance Detalhada do Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salespeoplePerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 text-sm font-display text-muted-foreground">#</th>
                    <th className="text-left py-3 px-2 text-sm font-display text-muted-foreground">Vendedor</th>
                    <th className="text-right py-3 px-2 text-sm font-display text-muted-foreground">Receita</th>
                    <th className="text-right py-3 px-2 text-sm font-display text-muted-foreground">Progresso</th>
                    <th className="text-right py-3 px-2 text-sm font-display text-muted-foreground">Deals</th>
                    <th className="text-right py-3 px-2 text-sm font-display text-muted-foreground">Atividades</th>
                  </tr>
                </thead>
                <tbody>
                  {salespeoplePerformance.map((sp, idx) => (
                    <tr key={sp.id} className={cn("border-b border-border/30 hover:bg-muted/30 transition-colors", idx < 3 && "bg-gradient-to-r from-rank-gold/5 to-transparent")}>
                      <td className="py-3 px-2">
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          idx === 0 ? "rank-gold" : idx === 1 ? "rank-silver" : idx === 2 ? "rank-bronze" : "bg-muted text-muted-foreground"
                        )}>{idx + 1}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarImage src={sp.avatar_url || undefined} /><AvatarFallback className="text-xs">{sp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                          <span className="font-medium">{sp.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-bold">{formatCurrency(sp.revenue)}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={Math.min(sp.goalProgress, 100)} className="w-16 h-1.5" />
                          <span className={cn("text-sm font-bold", sp.goalProgress >= 100 ? "text-success" : sp.goalProgress >= 70 ? "text-warning" : "text-destructive")}>{sp.goalProgress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">{sp.deals}</td>
                      <td className="py-3 px-2 text-right">{sp.activities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">Sem dados</div>
          )}
        </CardContent>
      </Card>
    </>
  );
});
