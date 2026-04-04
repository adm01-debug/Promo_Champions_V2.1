import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Target, Lightbulb, CheckCircle2, Zap, Award, Sparkles } from "lucide-react";

interface CoachingData {
  salesperson: { name: string; avatar_url: string | null };
  coaching: {
    summary: string;
    strengths: { title: string; description: string }[];
    improvements: { title: string; description: string; priority: string }[];
    actions: { action: string; timeline: string; expectedImpact: string }[];
  };
  metrics: {
    totalDeals: number;
    winRate: number;
    comparisonToTeam: number;
    avgDealValue: number;
  };
  generatedAt: string;
}

interface CoachingResultsProps {
  coaching: CoachingData;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta': return 'bg-status-error/20 text-status-error border-status-error/30';
    case 'média': return 'bg-status-warning/20 text-status-warning border-status-warning/30';
    case 'baixa': return 'bg-status-success/20 text-status-success border-status-success/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const CoachingResults = React.memo(function CoachingResults({ coaching }: CoachingResultsProps) {
  return (
    <div className="space-y-6">
      {/* Salesperson Header with Metrics */}
      <Card className="glass dark:border-glow card-elevated animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-status-purple/30 shadow-lg shadow-status-purple/10 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-status-purple/30 to-status-purple/10 font-display">
                  {coaching.salesperson.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-br from-status-purple to-status-purple/80 shadow-lg">
                <Award className="h-4 w-4 text-background" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold font-display gradient-text">{coaching.salesperson.name}</h3>
              <p className="text-muted-foreground mt-1 leading-relaxed">{coaching.coaching.summary}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="glass rounded-xl p-3 border border-border/40 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" />Total Deals</p>
                  <p className="text-2xl font-bold font-display mt-1">{coaching.metrics.totalDeals}</p>
                </div>
                <div className="glass rounded-xl p-3 border border-status-success/30 bg-status-success/5 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-status-success" />Taxa de Conversão</p>
                  <p className="text-2xl font-bold font-display text-status-success mt-1">{coaching.metrics.winRate.toFixed(1)}%</p>
                </div>
                <div className={`glass rounded-xl p-3 border hover-lift transition-all ${coaching.metrics.comparisonToTeam >= 0 ? "border-status-success/30 bg-status-success/5" : "border-status-error/30 bg-status-error/5"}`}>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {coaching.metrics.comparisonToTeam >= 0 ? <TrendingUp className="h-3 w-3 text-status-success" /> : <TrendingDown className="h-3 w-3 text-status-error" />}vs Equipe
                  </p>
                  <p className={`text-2xl font-bold font-display mt-1 ${coaching.metrics.comparisonToTeam >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                    {coaching.metrics.comparisonToTeam >= 0 ? '+' : ''}{coaching.metrics.comparisonToTeam.toFixed(1)}%
                  </p>
                </div>
                <div className="glass rounded-xl p-3 border border-border/40 hover-lift transition-all">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-status-warning" />Ticket Médio</p>
                  <p className="text-2xl font-bold font-display mt-1">R$ {coaching.metrics.avgDealValue.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {coaching.coaching.strengths.length > 0 && (
        <Card className="glass border-status-success/30 bg-gradient-to-br from-status-success/10 to-transparent animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-status-success font-display">
              <div className="p-1.5 rounded-lg bg-status-success/20"><CheckCircle2 className="h-5 w-5" /></div>
              Pontos Fortes
              <Badge variant="secondary" className="bg-status-success/20 text-status-success ml-auto">{coaching.coaching.strengths.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3 pr-2">
                {coaching.coaching.strengths.map((strength, i) => (
                  <div key={i} className="glass rounded-xl p-4 border border-status-success/20 hover-lift transition-all animate-fade-in" style={{ animationDelay: `${(i + 1) * 50}ms` }}>
                    <h4 className="font-medium font-display text-status-success flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{strength.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{strength.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {coaching.coaching.improvements.length > 0 && (
        <Card className="glass border-status-warning/30 bg-gradient-to-br from-status-warning/10 to-transparent animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-status-warning font-display">
              <div className="p-1.5 rounded-lg bg-status-warning/20"><Target className="h-5 w-5" /></div>
              Áreas de Melhoria
              <Badge variant="secondary" className="bg-status-warning/20 text-status-warning ml-auto">{coaching.coaching.improvements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3 pr-2">
                {coaching.coaching.improvements.map((improvement, i) => (
                  <div key={i} className="glass rounded-xl p-4 border border-status-warning/20 hover-lift transition-all animate-fade-in" style={{ animationDelay: `${(i + 1) * 50}ms` }}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium font-display text-status-warning flex items-center gap-2"><Target className="h-4 w-4" />{improvement.title}</h4>
                      <Badge variant="outline" className={`${getPriorityColor(improvement.priority)} text-xs`}>{improvement.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{improvement.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {coaching.coaching.actions.length > 0 && (
        <Card className="glass border-status-purple/30 bg-gradient-to-br from-status-purple/10 to-transparent animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-status-purple font-display">
              <div className="p-1.5 rounded-lg bg-status-purple/20"><Lightbulb className="h-5 w-5" /></div>
              Ações Recomendadas
              <Badge variant="secondary" className="bg-status-purple/20 text-status-purple ml-auto">{coaching.coaching.actions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3 pr-2">
                {coaching.coaching.actions.map((action, i) => (
                  <div key={i} className="glass rounded-xl p-4 border border-status-purple/20 hover-lift transition-all animate-fade-in" style={{ animationDelay: `${(i + 1) * 50}ms` }}>
                    <h4 className="font-medium font-display text-status-purple flex items-center gap-2"><Lightbulb className="h-4 w-4" />{action.action}</h4>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-status-purple/10 text-status-purple"><Target className="h-3 w-3" />{action.timeline}</span>
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-status-success/10 text-status-success"><TrendingUp className="h-3 w-3" />{action.expectedImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Generated timestamp */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground glass px-4 py-2 rounded-full w-fit mx-auto">
        <Sparkles className="h-3 w-3 text-status-warning" />
        Análise gerada em: {new Date(coaching.generatedAt).toLocaleString('pt-BR')}
      </div>
    </div>
  );
});
