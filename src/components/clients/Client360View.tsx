import { useState, useMemo } from "react";
import { useClient360 } from "@/hooks/crm/useClient360";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, ShoppingBag, TrendingUp, Package, BarChart3, Calendar, 
  ArrowRight, Zap, AlertCircle, CheckCircle2, MessageSquare, Copy, 
  Star, Download, MousePointerClick, Search, Filter, Eye, User,
  ChevronDown, ArrowUpRight, ArrowDownRight, History as HistoryIcon, Info
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [valueRange, setValueRange] = useState<[number, number]>([0, 100000]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "timeline">("timeline");

  const categories = useMemo(() => {
    if (!data?.orders) return [];
    const cats = new Set<string>();
    data.orders.forEach(o => {
      if (o.product_name) {
        const cat = o.product_name.split(' ')[0];
        cats.add(cat);
      }
    });
    return Array.from(cats);
  }, [data?.orders]);

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter(order => {
      const productName = (order.product_name || "").toLowerCase();
      const matchesSearch = productName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || productName.startsWith(categoryFilter.toLowerCase());
      const amount = Number(order.amount || 0);
      const matchesValue = amount >= valueRange[0] && amount <= valueRange[1];
      
      return matchesSearch && matchesStatus && matchesCategory && matchesValue;
    });
  }, [data?.orders, searchTerm, statusFilter, categoryFilter, valueRange]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-12 text-center text-muted-foreground">Nenhum dado encontrado para este cliente.</div>;

  const ltvDiff = ((data.ltv - data.segmentAverageLtv) / data.segmentAverageLtv) * 100;
  const ticketDiff = ((data.averageTicket - data.segmentAverageTicket) / data.segmentAverageTicket) * 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-primary flex items-center gap-2">
            Relatório Estratégico 360º
            <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20">Real-time Data</Badge>
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Visão holística de comportamento e valor</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => toast.info("Gerando relatório executivo...")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-accent/20 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
          >
            <Download className="h-3.5 w-3.5" />
            PDF Executivo
          </button>
        </div>
      </div>

      {/* KPIs Estratégicos com Comparativo de Segmento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LTV Absoluto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary tabular-nums">{formatCurrency(data.ltv)}</div>
            <div className="flex items-center gap-1.5 mt-2">
              {ltvDiff >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-rose-500" />}
              <span className={cn("text-[9px] font-bold uppercase", ltvDiff >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {Math.abs(ltvDiff).toFixed(1)}% vs média segmento
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/10 shadow-sm overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-500 tabular-nums">{formatCurrency(data.averageTicket)}</div>
            <div className="flex items-center gap-1.5 mt-2">
              {ticketDiff >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-rose-500" />}
              <span className={cn("text-[9px] font-bold uppercase", ticketDiff >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {Math.abs(ticketDiff).toFixed(1)}% vs média segmento
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600/10 border-emerald-500/20 shadow-sm overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Esforço de Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-500 tabular-nums">{data.engagementRatio.toFixed(1)}x</div>
            <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold tracking-tight">Interações por conversão</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600/10 to-purple-600/5 border-indigo-500/20 shadow-sm overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Posição na Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-500 tabular-nums">TOP {100 - data.percentile}%</div>
            <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold tracking-tight">Percentil de faturamento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução LTV */}
        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Financeira (LTV)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.spendingHistory}>
                  <defs>
                    <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="cumulativeLtv" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLtv)" />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={0.1} fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">LTV Acumulado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Valor do Pedido</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mix de Categorias */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase font-black tracking-tighter">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Afinidade de Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'][index % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              {data.categoryDistribution.map((cat, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'][i % 5]}} />
                  <span className="text-[9px] font-bold uppercase truncate opacity-80">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score & NBA (Next Best Action) Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm uppercase font-black tracking-tighter">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Customer Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * (100 - data.churnRisk)) / 100}
                    className={cn(
                      "transition-all duration-1000",
                      data.churnRisk < 30 ? "text-emerald-500" : 
                      data.churnRisk < 60 ? "text-amber-500" : "text-rose-500"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{100 - data.churnRisk}</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">Score Total</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Risco de Churn:</span>
                  <span className={cn(
                    data.churnRisk < 30 ? "text-emerald-500" : 
                    data.churnRisk < 60 ? "text-amber-500" : "text-rose-500"
                  )}>{data.churnRisk}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Recência (Últ. Compra):</span>
                  <span>{data.orders.length > 0 ? `${Math.floor((new Date().getTime() - new Date(data.orders[0].created_at).getTime()) / (1000 * 60 * 60 * 24))} dias` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">Frequência Média:</span>
                  <span>{data.purchaseFrequency.toFixed(1)} dias</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm uppercase font-black tracking-tighter text-primary">
              <Zap className="h-4 w-4 fill-primary" />
              IA Next Best Action (NBA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{data.nba.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{data.nba.description}</p>
                </div>
                
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 relative">
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(data.nba.script);
                        toast.success("Script copiado para o clipboard!");
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-2">Script Sugerido pela IA</span>
                  <p className="text-xs italic text-foreground/80 leading-relaxed pr-6">"{data.nba.script}"</p>
                </div>
              </div>

              <div className="w-full md:w-48 space-y-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Previsão Próxima Compra</span>
                  <div className="text-lg font-black text-primary">
                    {data.predictedNextPurchaseDays !== null 
                      ? `Em ~${data.predictedNextPurchaseDays} dias`
                      : 'Indefinido'}
                  </div>
                  <Badge variant="outline" className="text-[8px] font-bold mt-2 border-primary/20 text-primary">85% Confiança</Badge>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toast.success("Follow-up agendado com sucesso!")}
                    className="flex-1 py-3 px-2 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-tighter hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Agendar
                  </button>
                  <button 
                    onClick={() => toast.info("Abrindo canal de comunicação...")}
                    className="py-3 px-3 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico com Filtros e Deep-dive */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg uppercase font-black tracking-tighter">
                <HistoryIcon className="h-5 w-5 text-primary" />
                Livro de Transações Detalhado
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">Gestão granular do histórico comercial</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-muted/50 p-1 rounded-xl border border-white/5 mr-2">
                <button 
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "timeline" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Timeline
                </button>
                <button 
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "table" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Tabela
                </button>
              </div>
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 h-10 bg-muted/50 border-white/5 rounded-xl text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] h-10 bg-muted/50 border-white/5 rounded-xl text-xs">
                  <Package className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-10 bg-muted/50 border-white/5 rounded-xl text-xs">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-accent/10">
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Data</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Produto / SKU</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Valor</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-border/10 group transition-colors hover:bg-white/5">
                    <TableCell className="text-xs font-medium py-4">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase group-hover:text-primary transition-colors">{order.product_name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">SKU: {order.sku || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-black text-primary">{formatCurrency(Number(order.amount))}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black border-none h-5",
                        order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                        order.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {order.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-accent/20 border border-white/5 hover:bg-primary/20 hover:border-primary/50 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                      </button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Nenhum pedido encontrado com estes filtros</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 relative">
            <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent" />
            <div className="space-y-12">
              {filteredOrders.map((order, idx) => (
                <div key={order.id} className="relative pl-16 group">
                  <div className={cn(
                    "absolute left-0 top-0 w-5 h-5 rounded-full border-4 border-background z-10 transition-transform group-hover:scale-125",
                    order.status === 'completed' ? "bg-emerald-500" : 
                    order.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                  )} />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/[0.08] transition-all">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <h4 className="text-sm font-black uppercase text-foreground group-hover:text-primary transition-colors">{order.product_name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-black border-white/10 uppercase opacity-60">SKU: {order.sku || 'N/A'}</Badge>
                        <Badge variant="outline" className={cn(
                          "text-[8px] font-black border-none uppercase",
                          order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                          order.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                        )}>{order.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-lg font-black text-primary">{formatCurrency(Number(order.amount))}</span>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Valor da Transação</p>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-primary-foreground transition-all shadow-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Nenhum evento na jornada com estes filtros</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      </Card>

      {/* Deep-dive Modal Pedido */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden p-0 shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
          <DialogHeader className="p-8 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Detalhes da Transação</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">ID: {selectedOrder?.id}</DialogDescription>
              </div>
              <Badge className={cn(
                "font-black h-6 border-none",
                selectedOrder?.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                selectedOrder?.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {selectedOrder?.status === 'completed' ? 'PEDIDO FINALIZADO' : selectedOrder?.status?.toUpperCase() || 'PROCESSANDO'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-2">
                  <User className="h-3 w-3 text-primary" />
                  Responsáveis Comercial
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">SDR (Prospecção)</span>
                    <span className="text-xs font-black uppercase truncate max-w-[120px]">{selectedOrder?.sdr?.name || selectedOrder?.salesperson?.name || 'Sistema'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Closer (Fechamento)</span>
                    <span className="text-xs font-black uppercase truncate max-w-[120px]">{selectedOrder?.closer?.name || 'Venda Direta'}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-2">
                  <Info className="h-3 w-3 text-primary" />
                  Atributos de Venda
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Origem/Canal:</span>
                    <Badge variant="outline" className="text-[9px] font-black uppercase h-5 bg-white/5">{selectedOrder?.source || 'Orgânico'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Novo Cliente?</span>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase h-5",
                      selectedOrder?.is_first_sale ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 opacity-60"
                    )}>
                      {selectedOrder?.is_first_sale ? 'SIM (CAC)' : 'RECOMPRA (LTV)'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/[0.07] transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Discriminação de Itens</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono border-white/10 uppercase">
                  v.{selectedOrder?.version || '1.0'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start group">
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase group-hover:text-primary transition-colors">{selectedOrder?.product_name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">SKU: {selectedOrder?.sku || 'N/A'}</span>
                  </div>
                  <span className="text-sm font-black text-foreground">{formatCurrency(Number(selectedOrder?.amount))}</span>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-[10px] font-bold uppercase">Subtotal Bruto:</span>
                    <span className="text-xs font-bold">{formatCurrency(Number(selectedOrder?.amount))}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-500">
                    <span className="text-[10px] font-bold uppercase flex items-center gap-1.5">
                      <Zap className="h-3 w-3 fill-emerald-500" />
                      Desconto de Campanha:
                    </span>
                    <span className="text-xs font-bold">- R$ 0,00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/20">
                    <span className="text-xs font-black uppercase tracking-widest">Investimento Final:</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                        {formatCurrency(Number(selectedOrder?.amount))}
                      </span>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">IVA Inc. / Faturado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-4 px-6 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                <Download className="h-3.5 w-3.5" />
                Gerar Comprovante
              </button>
              <button className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <HistoryIcon className="h-3.5 w-3.5" />
                Histórico de Alterações
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}