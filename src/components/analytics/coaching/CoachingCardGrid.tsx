import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Trophy, CheckCircle2, Zap, AlertTriangle } from "lucide-react";
import type { CoachingData } from "@/hooks/sales/useSalespersonCoaching";

const getRankBadge = (index: number) => {
  const colors = [
    'bg-rank-gold/20 text-rank-gold border-rank-gold/30',
    'bg-rank-silver/20 text-rank-silver border-rank-silver/30',
    'bg-rank-bronze/20 text-rank-bronze border-rank-bronze/30',
    'bg-muted text-muted-foreground border-border'
  ];
  return colors[index] || colors[3];
};

const getRankIcon = (index: number) => {
  if (index === 0) return <Crown className="h-3 w-3" />;
  if (index === 1) return <Trophy className="h-3 w-3" />;
  return null;
};

interface CoachingCardGridProps {
  rankedData: CoachingData[];
}

export const CoachingCardGrid = React.memo(function CoachingCardGrid({ rankedData }: CoachingCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rankedData.map((coaching, index) => (
        <Card
          key={coaching.salesperson.id}
          className={`glass dark:border-glow card-elevated animate-fade-in transition-all duration-300 ${index === 0 ? 'ring-1 ring-rank-gold/30 hover-glow-gold' : 'hover-lift'}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Avatar className={`h-12 w-12 border-2 transition-transform duration-300 group-hover:scale-105 ${index === 0 ? 'border-rank-gold shadow-lg shadow-rank-gold/20' : 'border-primary/30'}`}>
                  <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                  <AvatarFallback className="font-display bg-gradient-to-br from-primary/20 to-primary/5">{coaching.salesperson.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-br from-rank-gold to-rank-gold/80 shadow-lg animate-pulse">
                    <Crown className="h-3 w-3 text-background" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className={`text-base font-display ${index === 0 ? 'gradient-text' : ''}`}>{coaching.salesperson.name}</CardTitle>
                  <Badge variant="outline" className={`${getRankBadge(index)} border text-xs`}>{getRankIcon(index)}#{index + 1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{coaching.coaching.summary}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {coaching.coaching.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium font-display text-status-success mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Pontos Fortes</h4>
                <div className="space-y-1.5">
                  {coaching.coaching.strengths.slice(0, 2).map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground glass rounded-lg px-2.5 py-1.5 border border-status-success/20 bg-status-success/5">{s.title}</p>
                  ))}
                </div>
              </div>
            )}
            {coaching.coaching.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium font-display text-status-warning mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Áreas de Melhoria</h4>
                <div className="space-y-1.5">
                  {coaching.coaching.improvements.slice(0, 2).map((im, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs glass rounded-lg px-2.5 py-1.5 border border-status-warning/20 bg-status-warning/5">
                      <span className="text-muted-foreground flex-1">{im.title}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-status-warning/30 text-status-warning">{im.priority}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {coaching.metrics.topLossReasons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium font-display text-status-error mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Top Motivos de Perda</h4>
                <div className="space-y-1.5">
                  {coaching.metrics.topLossReasons.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs glass rounded-lg px-2.5 py-1.5 border border-status-error/20 bg-status-error/5">
                      <span className="text-muted-foreground">{r.reason}</span>
                      <span className="text-status-error font-mono font-medium">{r.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
