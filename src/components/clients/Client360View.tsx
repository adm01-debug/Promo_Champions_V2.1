import { useClient360 } from "@/hooks/crm/useClient360";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, TrendingUp, Package, BarChart3, Calendar, ArrowRight, Zap, AlertCircle, CheckCircle2, MessageSquare, Copy, Star, Download, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface Client360ViewProps {
  clientName: string;
}

export function Client360View({ clientName }: Client360ViewProps) {
  const { data, isLoading } = useClient360(clientName);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <div>Nenhum dado encontrado para este cliente.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Relatório Estratégico 360º</h2>
        <button 
          onClick={() => toast.info("Gerando relatório executivo...")}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-accent/20 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Download className="h-3 w-3" />
          Exportar PDF Executivo
        </button>
      </div>

      {/* KPIs Estratégicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LTV Absoluto</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary tabular-nums">{formatCurrency(data.ltv)}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Potencial de Retorno Vitalício</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/10 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-12 w-12 text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-500 tabular-nums">{formatCurrency(data.averageTicket)}</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Consumo Médio por Evento</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600/10 border-emerald-500/20 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <MousePointerClick className="h-12 w-12 text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Índice de Esforço</CardTitle>
            <MousePointerClick className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-500 tabular-nums">{data.engagementRatio.toFixed(1)}x</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Interações médias por conversão</p>
            <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${Math.min(100, data.engagementRatio * 20)}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600/10 to-purple-600/5 border-indigo-500/20 shadow-sm overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Star className="h-12 w-12 text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Benchmark da Base</CardTitle>
            <Star className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-500 tabular-nums">TOP {100 - data.percentile}%</div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">O cliente está acima de {data.percentile}% da base</p>
            <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000" 
                style={{ width: `${data.percentile}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Analysis */}
        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <TrendingUp className="h-5 w-5 text-primary" />
              Análise de Tendência de Consumo
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Evolução do ticket por transação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.spendingHistory}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold'}}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold'}}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Affinity */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Mix de Categorias
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#6366f1', '#f59e0b', '#ec4899'][index % 4]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {data.categoryDistribution.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'][i % 4]}} />
                  <span className="text-[10px] font-bold uppercase truncate opacity-70">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Best Action (NBA) */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-border/10">
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <Zap className="h-5 w-5 text-amber-500" />
              Next Best Action (NBA)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{data.nba.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{data.nba.description}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-white/5 relative group/script">
                  <p className="text-xs font-medium italic pr-10 leading-relaxed">"{data.nba.script}"</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(data.nba.script);
                      toast.success("Script copiado para a área de transferência!");
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-background/50 border border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="w-full md:w-48 space-y-2">
                <button className="w-full py-2 px-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                  Executar Agora
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Pulse */}
        <Card className="border-border/40 bg-gradient-to-br from-card/60 to-accent/5 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className={cn(
                  "w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500",
                  data.churnRisk > 50 ? "border-destructive/20 bg-destructive/5" : "border-primary/20 bg-primary/5"
                )}>
                  <span className="text-2xl font-black tabular-nums">{Math.round(100 - data.churnRisk)}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Health</span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-1">Status do Lead</h3>
                <Badge variant={data.churnRisk > 50 ? "destructive" : "default"} className="font-black">
                  {data.churnRisk > 50 ? "CRÍTICO" : "SAUDÁVEL"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Journey Timeline */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden lg:col-span-3">
          <CardHeader className="border-b border-border/10 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
                <BarChart3 className="h-5 w-5 text-primary" />
                Jornada de Compra Detalhada
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative p-6">
              <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/50 via-primary/10 to-transparent" />
              <div className="space-y-8">
                {data.orders.slice(0, 5).map((order, idx) => (
                  <div key={order.id} className="relative pl-10 group">
                    <div className={cn(
                      "absolute left-[2px] top-1 h-3 w-3 rounded-full border-2 border-background z-10",
                      idx === 0 ? "bg-primary scale-125" : "bg-muted-foreground/30"
                    )} />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-accent/10 border border-white/5 group-hover:bg-accent/20 transition-all">
                      <div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <h4 className="text-sm font-black uppercase">{order.product_name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-primary">{formatCurrency(Number(order.amount))}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}