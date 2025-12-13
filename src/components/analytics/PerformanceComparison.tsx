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
  avgWinRate 
}: { 
  person: SalespersonPerformance; 
  rank: number;
  avgRevenue: number;
  avgActivities: number;
  avgWinRate: number;
}) {
  const isTop = rank === 1;
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isTop 
        ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/30" 
        : "bg-card/50 border-border/50 hover:border-border"
    }`}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className={`h-12 w-12 ${isTop ? "border-2 border-amber-400" : ""}`}>
            <AvatarImage src={person.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {person.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {isTop && (
            <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
              <Crown className="h-3 w-3 text-amber-900" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{person.name}</span>
            {isTop && <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 text-[10px]">Top</Badge>}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Receita</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(person.totalRevenue)}</span>
                <ComparisonIndicator value={person.totalRevenue} avg={avgRevenue} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Win Rate</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{person.winRate.toFixed(0)}%</span>
                <ComparisonIndicator value={person.winRate} avg={avgWinRate} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Atividades</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{person.totalActivities}</span>
                <ComparisonIndicator value={person.totalActivities} avg={avgActivities} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vendas</span>
              <span className="font-medium">{person.totalSales}</span>
            </div>
          </div>
          
          {person.goalProgress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta</span>
                <span className={person.goalProgress >= 100 ? "text-status-success" : "text-foreground"}>
                  {person.goalProgress.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(person.goalProgress, 100)} 
                className="h-1.5"
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
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Comparativo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Comparativo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-50" />
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
        {benchmarks.map((benchmark) => (
          <Card key={benchmark.role} className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: `${ROLE_COLORS[benchmark.role]}20`, color: ROLE_COLORS[benchmark.role] }}
                >
                  {ROLE_LABELS[benchmark.role]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {benchmark.salespeople.length} vendedores
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receita Média</span>
                  <span className="font-bold">{formatCurrency(benchmark.avgRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Win Rate Médio</span>
                  <span className="font-bold">{benchmark.avgWinRate.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atividades Média</span>
                  <span className="font-bold">{benchmark.avgActivities.toFixed(0)}</span>
                </div>
              </div>

              {benchmark.topPerformer && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={benchmark.topPerformer.avatar_url || ""} />
                      <AvatarFallback className="text-xs">
                        {benchmark.topPerformer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">Top Performer</p>
                      <p className="text-sm font-medium">{benchmark.topPerformer.name}</p>
                    </div>
                    <Trophy className="h-4 w-4 text-rank-gold ml-auto" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ranking de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                      borderRadius: "8px",
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
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Perfil por Função
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison by Role */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Detalhamento por Vendedor
            </CardTitle>
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="bg-background/50">
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
            {filteredBenchmarks.flatMap((benchmark) =>
              benchmark.salespeople.map((person, index) => (
                <SalespersonCard
                  key={person.id}
                  person={person}
                  rank={index + 1}
                  avgRevenue={benchmark.avgRevenue}
                  avgActivities={benchmark.avgActivities}
                  avgWinRate={benchmark.avgWinRate}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
