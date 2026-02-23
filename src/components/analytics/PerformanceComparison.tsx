// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceComparison, SalespersonPerformance } from "@/hooks/usePerformanceComparison";
import { Users, Trophy, TrendingUp, Phone, Target, Crown, ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

const ROLE_LABELS: Record<string, string> = {
  sdr: "SDRs",
  closer: "Closers",
  hybrid: "Híbridos",
};

const ROLE_COLORS: Record<string, string> = {
  sdr: "hsl(var(--status-info))",
  closer: "hsl(var(--status-success))",
  hybrid: "hsl(var(--status-purple))",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function ComparisonIndicator({ value, avg }: { value: number; avg: number }) {
  const diff = avg > 0 ? ((value - avg) / avg) * 100 : 0;
  
  if (Math.abs(diff) < 5) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  
  if (diff > 0) {
    return (
      <span className="flex items-center gap-1 text-status-success text-xs">
        <ArrowUp className="h-3 w-3" />
        +{diff.toFixed(0)}%
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1 text-status-error text-xs">
      <ArrowDown className="h-3 w-3" />
      {diff.toFixed(0)}%
    </span>
  );
}

function SalespersonCard({ 
  person, 
  rank, 
  avgRevenue, 
  avgActivities, 
  avgWinRate,
  index 
}: { 
  person: SalespersonPerformance; 
  rank: number;
  avgRevenue: number;
  avgActivities: number;
  avgWinRate: number;
  index: number;
}) {
  const isTop = rank === 1;
  const isTopThree = rank <= 3;
  
  return (
    <div 
      className={`p-4 rounded-xl glass border border-border/40 dark:border-glow transition-all duration-300 animate-fade-in ${
        isTop 
          ? "ring-1 ring-rank-gold/30 hover-glow-gold bg-gradient-to-br from-rank-gold/5 to-transparent" 
          : isTopThree
          ? "hover-glow"
          : "hover-lift"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="relative group">
          <Avatar className={`h-12 w-12 transition-all duration-300 group-hover:scale-105 ${
            isTop ? "border-2 border-rank-gold shadow-lg shadow-rank-gold/20" : 
            isTopThree ? "border-2 border-primary/30" : ""
          }`}>
            <AvatarImage src={person.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold font-display">
              {person.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {isTop && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-gold to-rank-gold/80 rounded-full p-1 shadow-lg animate-pulse">
              <Crown className="h-3 w-3 text-background" />
            </div>
          )}
          {rank === 2 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full p-0.5 shadow">
              <span className="text-[8px] font-bold text-background">2º</span>
            </div>
          )}
          {rank === 3 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full p-0.5 shadow">
              <span className="text-[8px] font-bold text-background">3º</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold font-display truncate ${isTop ? "gradient-text" : ""}`}>
              {person.name}
            </span>
            {isTop && (
              <Badge variant="secondary" className="bg-rank-gold/20 text-rank-gold text-[10px] border border-rank-gold/30">
                <Trophy className="h-2.5 w-2.5 mr-1" />
                Top
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Receita</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs">{formatCurrency(person.totalRevenue)}</span>
                <ComparisonIndicator value={person.totalRevenue} avg={avgRevenue} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Win Rate</span>
              <div className="flex items-center gap-1.5">
                <span className={`font-medium text-xs ${person.winRate >= 50 ? "text-status-success" : ""}`}>
                  {person.winRate.toFixed(0)}%
                </span>
                <ComparisonIndicator value={person.winRate} avg={avgWinRate} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Atividades</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs">{person.totalActivities}</span>
                <ComparisonIndicator value={person.totalActivities} avg={avgActivities} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Vendas</span>
              <span className="font-medium text-xs">{person.totalSales}</span>
            </div>
          </div>
          
          {person.goalProgress > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-background/30 dark:bg-background/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Meta
                </span>
                <span className={`font-medium ${
                  person.goalProgress >= 100 
                    ? "text-status-success" 
                    : person.goalProgress >= 75 
                    ? "text-status-warning" 
                    : ""
                }`}>
                  {person.goalProgress.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(person.goalProgress, 100)} 
                className={`h-1.5 ${person.goalProgress >= 100 ? "[&>div]:bg-status-success" : ""}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PerformanceComparison() {
  const { data: benchmarks, isLoading } = usePerformanceComparison();
  const [selectedRole, setSelectedRole] = useState<string>("all");

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="gradient-text font-display">Comparativo de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="gradient-text font-display">Comparativo de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground glass rounded-xl">
            <div className="p-4 rounded-full bg-muted/20 mb-3">
              <Users className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-sm">Nenhum dado disponível para comparação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build chart data for revenue comparison
  const revenueChartData = benchmarks.flatMap(b => 
    b.salespeople.map(sp => ({
      name: sp.name.split(" ")[0],
      revenue: sp.totalRevenue,
      role: b.role,
      fill: ROLE_COLORS[b.role],
    }))
  ).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Build radar data for role averages
  const radarData = [
    { metric: "Receita", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgRevenue / 1000])) },
    { metric: "Atividades", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgActivities])) },
    { metric: "Win Rate", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgWinRate])) },
    { metric: "Ticket Médio", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgDealSize / 1000])) },
  ];

  const filteredBenchmarks = selectedRole === "all" 
    ? benchmarks 
    : benchmarks.filter(b => b.role === selectedRole);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benchmarks.map((benchmark, index) => {
          const isLeadingRole = benchmark.avgRevenue === Math.max(...benchmarks.map(b => b.avgRevenue));
          return (
            <Card 
              key={benchmark.role} 
              className={`glass dark:border-glow card-elevated transition-all duration-300 animate-fade-in ${
                isLeadingRole ? "ring-1 ring-primary/30 hover-glow" : "hover-lift"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant="secondary" 
                    style={{ 
                      backgroundColor: `${ROLE_COLORS[benchmark.role]}20`, 
                      color: ROLE_COLORS[benchmark.role],
                      borderColor: `${ROLE_COLORS[benchmark.role]}30` 
                    }}
                    className="font-medium border"
                  >
                    {isLeadingRole && <Crown className="h-3 w-3 mr-1" />}
                    {ROLE_LABELS[benchmark.role]}
                  </Badge>
                  <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                    {benchmark.salespeople.length} vendedores
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/30 dark:bg-background/10">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Receita Média
                    </span>
                    <span className="font-bold font-display gradient-text">{formatCurrency(benchmark.avgRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/30 dark:bg-background/10">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Win Rate Médio
                    </span>
                    <span className={`font-bold ${benchmark.avgWinRate >= 50 ? "text-status-success" : ""}`}>
                      {benchmark.avgWinRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/30 dark:bg-background/10">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Atividades Média
                    </span>
                    <span className="font-bold">{benchmark.avgActivities.toFixed(0)}</span>
                  </div>
                </div>

                {benchmark.topPerformer && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-rank-gold/5 border border-rank-gold/20">
                      <Avatar className="h-8 w-8 border-2 border-rank-gold/50 shadow-sm shadow-rank-gold/20">
                        <AvatarImage src={benchmark.topPerformer.avatar_url || ""} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">
                          {benchmark.topPerformer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Top Performer</p>
                        <p className="text-sm font-medium font-display truncate">{benchmark.topPerformer.name}</p>
                      </div>
                      <div className="p-1.5 rounded-full bg-rank-gold/20 animate-pulse">
                        <Trophy className="h-4 w-4 text-rank-gold" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <Card className="glass dark:border-glow card-elevated">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span className="gradient-text font-display">Ranking de Receita</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] animate-fade-in">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.2)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {revenueChartData.map((entry, index) => (
                      <rect key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="glass dark:border-glow card-elevated">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <span className="gradient-text font-display">Perfil por Função</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] animate-fade-in">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  {benchmarks.map((b) => (
                    <Radar
                      key={b.role}
                      name={ROLE_LABELS[b.role]}
                      dataKey={b.role}
                      stroke={ROLE_COLORS[b.role]}
                      fill={ROLE_COLORS[b.role]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend 
                    formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison by Role */}
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="gradient-text font-display">Detalhamento por Vendedor</span>
            </CardTitle>
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="glass">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {benchmarks.map((b) => (
                  <TabsTrigger key={b.role} value={b.role}>
                    {ROLE_LABELS[b.role]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBenchmarks.flatMap((benchmark, benchmarkIndex) =>
              benchmark.salespeople.map((person, personIndex) => (
                <SalespersonCard
                  key={person.id}
                  person={person}
                  rank={personIndex + 1}
                  avgRevenue={benchmark.avgRevenue}
                  avgActivities={benchmark.avgActivities}
                  avgWinRate={benchmark.avgWinRate}
                  index={benchmarkIndex * benchmark.salespeople.length + personIndex}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
