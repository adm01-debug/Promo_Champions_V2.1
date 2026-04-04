// PerformanceComparison - role-grouped performance benchmarks
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceComparison } from "@/hooks/usePerformanceComparison";
import { Users, Trophy, TrendingUp, Phone, Target, Crown } from "lucide-react";
import { SalespersonCard } from "./performance/SalespersonCard";
import { PerformanceCharts } from "./performance/PerformanceCharts";

const ROLE_LABELS: Record<string, string> = { sdr: "SDRs", closer: "Closers", hybrid: "Híbridos" };
const ROLE_COLORS: Record<string, string> = { sdr: "hsl(var(--status-info))", closer: "hsl(var(--status-success))", hybrid: "hsl(var(--status-purple))" };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);
}

export function PerformanceComparison() {
  const { data: benchmarks, isLoading } = usePerformanceComparison();
  const [selectedRole, setSelectedRole] = useState<string>("all");

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5"><Users className="h-5 w-5 text-primary" /></div><span className="gradient-text font-display">Comparativo de Performance</span></CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[400px] w-full rounded-xl animate-pulse" /></CardContent>
      </Card>
    );
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5"><Users className="h-5 w-5 text-primary" /></div><span className="gradient-text font-display">Comparativo de Performance</span></CardTitle></CardHeader>
        <CardContent><div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground glass rounded-xl"><div className="p-4 rounded-full bg-muted/20 mb-3"><Users className="h-10 w-10 opacity-50" /></div><p className="text-sm">Nenhum dado disponível para comparação</p></div></CardContent>
      </Card>
    );
  }

  const filteredBenchmarks = selectedRole === "all" ? benchmarks : benchmarks.filter(b => b.role === selectedRole);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benchmarks.map((benchmark, index) => {
          const isLeadingRole = benchmark.avgRevenue === Math.max(...benchmarks.map(b => b.avgRevenue));
          return (
            <Card key={benchmark.role} className={`glass dark:border-glow card-elevated transition-all duration-300 animate-fade-in ${isLeadingRole ? "ring-1 ring-primary/30 hover-glow" : "hover-lift"}`} style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" style={{ backgroundColor: `${ROLE_COLORS[benchmark.role]}20`, color: ROLE_COLORS[benchmark.role], borderColor: `${ROLE_COLORS[benchmark.role]}30` }} className="font-medium border">
                    {isLeadingRole && <Crown className="h-3 w-3 mr-1" />}{ROLE_LABELS[benchmark.role]}
                  </Badge>
                  <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{benchmark.salespeople.length} vendedores</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/30 dark:bg-background/10"><span className="text-sm text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Receita Média</span><span className="font-bold font-display gradient-text">{formatCurrency(benchmark.avgRevenue)}</span></div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/30 dark:bg-background/10"><span className="text-sm text-muted-foreground flex items-center gap-1.5"><Target className="h-3.5 w-3.5" />Win Rate Médio</span><span className={`font-bold ${benchmark.avgWinRate >= 50 ? "text-status-success" : ""}`}>{benchmark.avgWinRate.toFixed(0)}%</span></div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/30 dark:bg-background/10"><span className="text-sm text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Atividades Média</span><span className="font-bold">{benchmark.avgActivities.toFixed(0)}</span></div>
                </div>
                {benchmark.topPerformer && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-rank-gold/5 border border-rank-gold/20">
                      <Avatar className="h-8 w-8 border-2 border-rank-gold/50 shadow-sm shadow-rank-gold/20"><AvatarImage src={benchmark.topPerformer.avatar_url || ""} /><AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">{benchmark.topPerformer.name.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0"><p className="text-xs text-muted-foreground">Top Performer</p><p className="text-sm font-medium font-display truncate">{benchmark.topPerformer.name}</p></div>
                      <div className="p-1.5 rounded-full bg-rank-gold/20 animate-pulse"><Trophy className="h-4 w-4 text-rank-gold" /></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PerformanceCharts benchmarks={benchmarks} />

      {/* Detailed Comparison by Role */}
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5"><Users className="h-5 w-5 text-primary" /></div><span className="gradient-text font-display">Detalhamento por Vendedor</span></CardTitle>
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="glass">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {benchmarks.map((b) => <TabsTrigger key={b.role} value={b.role}>{ROLE_LABELS[b.role]}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBenchmarks.flatMap((benchmark, benchmarkIndex) =>
              benchmark.salespeople.map((person, personIndex) => (
                <SalespersonCard key={person.id} person={person} rank={personIndex + 1} avgRevenue={benchmark.avgRevenue} avgActivities={benchmark.avgActivities} avgWinRate={benchmark.avgWinRate} index={benchmarkIndex * benchmark.salespeople.length + personIndex} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
